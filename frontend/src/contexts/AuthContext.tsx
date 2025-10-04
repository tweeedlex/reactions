import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/utils/supabase';
import { saveUserData, clearUserData, getUserData, updateUserProfile } from '@/utils/localStorage';
import { mockBillingHistory } from '@/utils/mockData';
import { companyService } from '@/utils/companyService';
import type { UserData } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { fetchUserCompanies, clearCompanyData } from '@/store/slices/companySlice';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasCompany: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; hasCompany?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<{ error: AuthError | null }>;
  refreshCompanyStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const dispatch = useAppDispatch();

  // Функція для перевірки та завантаження компаній користувача
  const checkUserCompanies = async (userId: string) => {
    try {
      // Додаємо таймаут для запобігання нескінченного завантаження
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const hasCompaniesPromise = companyService.hasUserCompanies(userId);
      const hasCompanies = await Promise.race([hasCompaniesPromise, timeoutPromise]) as boolean;
      
      setHasCompany(hasCompanies);
      
      if (hasCompanies) {
        // Завантажуємо дані компаній в Redux
        dispatch(fetchUserCompanies(userId));
      }
    } catch (error) {
      // Мовчазно встановлюємо false для відсутніх таблиць
      if (error instanceof Error && error.message === 'Timeout') {
        console.warn('Company check timeout - tables may not exist, setting hasCompany to false');
      } else {
        console.error('Error checking user companies:', error);
      }
      setHasCompany(false);
    }
  };

  useEffect(() => {
    // Додаємо загальний таймаут для всього процесу
    const initTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout, setting loading to false');
      setLoading(false);
    }, 10000); // 10 секунд максимум

    // Отримуємо поточну сесію
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          await checkUserCompanies(session.user.id);
        } catch (error) {
          console.error('Error in checkUserCompanies:', error);
          setHasCompany(false);
        }
      }
      
      clearTimeout(initTimeout);
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      clearTimeout(initTimeout);
      setLoading(false);
    });

    // Слухаємо зміни авторизації
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        // Перевіряємо компанії користувача
        await checkUserCompanies(session.user.id);
        
        // При вході зберігаємо дані користувача в localStorage
        const existingData = getUserData();
        if (!existingData) {
          const userData: UserData = {
            user: {
              id: session.user.id,
              name: session.user.user_metadata?.name || '',
              email: session.user.email || '',
            },
            brand: {
              brandName: '',
              keywords: [],
              sources: [],
              sourceLinks: [],
              saasPoints: 1000,
            },
            subscription: {
              isActive: true,
              plan: 'basic',
              parsingEnabled: true,
              maxSources: 5,
              usedSources: 0,
              autoRenew: true,
              billingHistory: mockBillingHistory,
              totalSpent: mockBillingHistory.reduce((sum, record) => sum + record.cost, 0),
              monthlyLimit: 100,
              parsingInterval: {
                days: 0,
                hours: 4,
                minutes: 0,
              },
            },
            isOnboarded: false,
          };
          saveUserData(userData);
        } else {
          // Оновлюємо існуючі дані користувача
          updateUserProfile(
            session.user.id,
            session.user.user_metadata?.name || existingData.user.name,
            session.user.email || existingData.user.email
          );
        }
      }

      if (event === 'SIGNED_OUT') {
        // При виході очищуємо дані
        clearUserData();
        setHasCompany(false);
        dispatch(clearCompanyData());
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, [dispatch]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // Після успішного входу перевіряємо компанії
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user) {
          const hasCompanies = await companyService.hasUserCompanies(session.data.session.user.id);
          setHasCompany(hasCompanies);
          return { error: null, hasCompany: hasCompanies };
        }
      } catch (err) {
        console.error('Error checking companies after sign in:', err);
        setHasCompany(false);
        return { error: null, hasCompany: false };
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: { name?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { error };
  };

  const refreshCompanyStatus = async () => {
    if (user) {
      try {
        // Додаємо таймаут для refresh
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const hasCompaniesPromise = companyService.hasUserCompanies(user.id);
        const hasCompanies = await Promise.race([hasCompaniesPromise, timeoutPromise]) as boolean;
        
        setHasCompany(hasCompanies);
        
        if (hasCompanies) {
          dispatch(fetchUserCompanies(user.id));
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
          console.warn('Company refresh timeout - tables may not exist');
        } else {
          console.error('Error refreshing company status:', error);
        }
        setHasCompany(false);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    hasCompany,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshCompanyStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
