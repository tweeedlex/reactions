import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/utils/supabase';
import { saveUserData, clearUserData, getUserData, updateUserProfile } from '@/utils/localStorage';
import type { UserData } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Отримуємо поточну сесію
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Слухаємо зміни авторизації
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
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
