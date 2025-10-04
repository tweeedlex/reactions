import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/utils/supabase';
import { saveUserData, clearUserData, getUserData, updateUserProfile, saveCompanyStatus, getCompanyStatus, clearCompanyStatus } from '@/utils/localStorage';
import { mockBillingHistory } from '@/utils/mockData';
import { companyService } from '@/utils/companyService';
import type { UserData } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { fetchUserCompanies, clearCompanyData, setCurrentUserRole } from '@/store/slices/companySlice';
import type { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  hasCompany: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; hasCompany?: boolean; userRole?: UserRole }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<{ error: AuthError | null }>;
  refreshCompanyStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [hasCompany, setHasCompany] = useState(() => {
    // Відновлюємо стан з localStorage при ініціалізації
    return getCompanyStatus() ?? false;
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const dispatch = useAppDispatch();

  // Функція для перевірки та завантаження компаній користувача
  const checkUserCompanies = async (userId: string) => {
    try {
      // Додаємо таймаут для запобігання нескінченного завантаження
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const hasCompaniesPromise = companyService.hasUserCompanies(userId);
      const hasCompanies = await Promise.race([hasCompaniesPromise, timeoutPromise]) as boolean;
      
      setHasCompany(hasCompanies);
      saveCompanyStatus(hasCompanies); // Зберігаємо в localStorage
      
        if (hasCompanies) {
          // Завантажуємо дані компаній в Redux
          const userCompanies = await dispatch(fetchUserCompanies(userId)).unwrap();
          // Встановлюємо роль користувача
          if (userCompanies.length > 0) {
            const role = companyService.getUserRole(userCompanies[0].role_id);
            setUserRole(role);
            dispatch(setCurrentUserRole(role));
          }
        }
    } catch (error) {
      // Мовчазно встановлюємо false для відсутніх таблиць
      if (error instanceof Error && error.message === 'Timeout') {
        console.warn('Company check timeout - tables may not exist, keeping current state');
        // Не змінюємо hasCompany при таймауті, залишаємо поточний стан
        return;
      } else {
        console.error('Error checking user companies:', error);
        setHasCompany(false);
        saveCompanyStatus(false); // Зберігаємо в localStorage
      }
    }
  };

  useEffect(() => {
    // Додаємо загальний таймаут для всього процесу
    const initTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout, setting loading to false');
      setLoading(false);
      setInitialized(true);
    }, 10000); // 10 секунд максимум

    // Отримуємо поточну сесію
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 AuthContext: Getting session...', { hasSession: !!session, hasUser: !!session?.user });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 AuthContext: User found, checking companies...', session.user.id);
        try {
          await checkUserCompanies(session.user.id);
          console.log('✅ AuthContext: Company check completed');
        } catch (error) {
          console.error('❌ AuthContext: Error in checkUserCompanies:', error);
          setHasCompany(false);
          saveCompanyStatus(false);
        }
      } else {
        console.log('🚫 AuthContext: No user, setting hasCompany to false');
        setHasCompany(false);
        saveCompanyStatus(false);
      }
      
      console.log('🏁 AuthContext: Initialization completed', { hasCompany: getCompanyStatus() });
      clearTimeout(initTimeout);
      setLoading(false);
      setInitialized(true);
    }).catch((error) => {
      console.error('❌ AuthContext: Error getting session:', error);
      setHasCompany(false);
      saveCompanyStatus(false);
      clearTimeout(initTimeout);
      setLoading(false);
      setInitialized(true);
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
        clearCompanyStatus(); // Очищуємо localStorage
        dispatch(clearCompanyData());
      }
      
      setLoading(false);
      setInitialized(true);
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
          saveCompanyStatus(hasCompanies); // Зберігаємо в localStorage
          
          // Отримуємо роль користувача
          let userRole: UserRole | null = null;
          if (hasCompanies) {
            userRole = await companyService.getUserRoleForCompany(session.data.session.user.id);
            setUserRole(userRole);
          }
          
          return { error: null, hasCompany: hasCompanies, userRole: userRole || undefined };
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
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const hasCompaniesPromise = companyService.hasUserCompanies(user.id);
        const hasCompanies = await Promise.race([hasCompaniesPromise, timeoutPromise]) as boolean;
        
        setHasCompany(hasCompanies);
        saveCompanyStatus(hasCompanies); // Зберігаємо в localStorage
        
        if (hasCompanies) {
          dispatch(fetchUserCompanies(user.id));
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
          console.warn('Company refresh timeout - tables may not exist, keeping current state');
          // Не змінюємо hasCompany при таймауті, залишаємо поточний стан
          return;
        } else {
          console.error('Error refreshing company status:', error);
          setHasCompany(false);
          saveCompanyStatus(false); // Зберігаємо в localStorage
        }
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    initialized,
    hasCompany,
    userRole,
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
