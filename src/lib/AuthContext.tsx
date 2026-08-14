'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SubscriptionTier } from '@/types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  subscribeToPlan: (tier: 'monthly' | 'annual') => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<void>;
  hasAccessToProduct: (productId: string) => boolean;
  addPurchasedProduct: (productId: string) => void;
  toggleAdminRole: () => void;
  toggleSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'lensforge_auth_user_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const purchasedRaw = localStorage.getItem(`purchases_${session.user.id}`);
            const purchasedIds = purchasedRaw ? JSON.parse(purchasedRaw) : [];

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: (profileData?.role as UserRole) || 'customer',
              subscriptionTier: (profileData?.subscription_tier as SubscriptionTier) || 'none',
              subscriptionExpiresAt: profileData?.subscription_expires_at,
              purchasedProductIds: purchasedIds,
              createdAt: session.user.created_at || new Date().toISOString(),
              isVerified: session.user.email_confirmed_at !== null
            });
          }
        } catch (err) {
          console.warn('Supabase auth check failed', err);
        }
      } else {
        // Fallback local storage auth check
        try {
          const raw = localStorage.getItem(LOCAL_USER_KEY);
          if (raw) {
            setUser(JSON.parse(raw));
          } else {
            // Default demo admin account with subscription enabled for instant testing
            const defaultDemoAdmin: UserProfile = {
              id: 'usr-admin-demo',
              email: 'admin@lensforge.io',
              role: 'admin',
              subscriptionTier: 'annual',
              purchasedProductIds: [],
              createdAt: new Date().toISOString(),
              isVerified: true
            };
            setUser(defaultDemoAdmin);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultDemoAdmin));
          }
        } catch (e) {
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();

    // Supabase auth state change listener
    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const purchasedRaw = localStorage.getItem(`purchases_${session.user.id}`);
          const purchasedIds = purchasedRaw ? JSON.parse(purchasedRaw) : [];

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (profileData?.role as UserRole) || 'customer',
            subscriptionTier: (profileData?.subscription_tier as SubscriptionTier) || 'none',
            subscriptionExpiresAt: profileData?.subscription_expires_at,
            purchasedProductIds: purchasedIds,
            createdAt: session.user.created_at || new Date().toISOString(),
            isVerified: session.user.email_confirmed_at !== null
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const saveLocalUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  // CLIENT-SIDE VALIDATION HELPERS
  const validateEmail = (email: string): string | null => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address (e.g. user@domain.com).';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  // SIGN UP
  const signUp = async (email: string, pass: string) => {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    const passErr = validatePassword(pass);
    if (passErr) return { success: false, error: passErr };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
          }
          return { success: false, error: error.message };
        }

        const requiresVerification = !data.session;
        return { success: true, requiresVerification };
      } catch (err: any) {
        return { success: false, error: err.message || 'Signup failed.' };
      }
    } else {
      // Local fallback
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        role: 'customer',
        subscriptionTier: 'none',
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      saveLocalUser(newUser);
      return { success: true, requiresVerification: false };
    }
  };

  // SIGN IN
  const signIn = async (email: string, pass: string) => {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    const passErr = validatePassword(pass);
    if (passErr) return { success: false, error: passErr };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Incorrect email or password. Please check your credentials.' };
          }
          if (error.message.includes('Email not confirmed')) {
            return { success: false, error: 'Your email has not been verified yet. Please check your inbox for confirmation link.' };
          }
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Sign in failed.' };
      }
    } else {
      // Local mock login
      const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@lensforge.io';
      const loggedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        role: isAdminEmail ? 'admin' : 'customer',
        subscriptionTier: isAdminEmail ? 'annual' : 'none',
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      saveLocalUser(loggedUser);
      return { success: true };
    }
  };

  // SIGN OUT
  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    saveLocalUser(null);
  };

  // REQUEST PASSWORD RESET
  const requestPasswordReset = async (email: string) => {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Password reset link sent to your email.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send reset link.' };
      }
    } else {
      return { success: true, message: 'Mock reset email sent! Check your inbox to proceed.' };
    }
  };

  // UPDATE PASSWORD
  const updatePassword = async (newPassword: string) => {
    const passErr = validatePassword(newPassword);
    if (passErr) return { success: false, error: passErr };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Password update failed.' };
      }
    } else {
      return { success: true };
    }
  };

  // SUBSCRIPTION MANAGEMENT
  const subscribeToPlan = async (tier: 'monthly' | 'annual') => {
    const expiresAt = new Date();
    if (tier === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (user) {
      const updated: UserProfile = {
        ...user,
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt.toISOString()
      };
      saveLocalUser(updated);

      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', user.id);
      }
      return { success: true };
    } else {
      // Guest subscribes - creates a subscriber profile
      const newUser: UserProfile = {
        id: `usr_sub_${Date.now()}`,
        email: 'subscriber@lensforge.io',
        role: 'customer',
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt.toISOString(),
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      saveLocalUser(newUser);
      return { success: true };
    }
  };

  const cancelSubscription = async () => {
    if (user) {
      const updated: UserProfile = {
        ...user,
        subscriptionTier: 'none',
        subscriptionExpiresAt: undefined
      };
      saveLocalUser(updated);
    }
  };

  // PRODUCT ACCESS CHECK (Admin, Active Subscriber, or One-time Purchaser)
  const hasAccessToProduct = (productId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.subscriptionTier === 'annual' || user.subscriptionTier === 'monthly') return true;
    if (user.purchasedProductIds?.includes(productId)) return true;
    return false;
  };

  const addPurchasedProduct = (productId: string) => {
    if (user) {
      const current = user.purchasedProductIds || [];
      if (!current.includes(productId)) {
        const updatedIds = [...current, productId];
        const updated: UserProfile = { ...user, purchasedProductIds: updatedIds };
        saveLocalUser(updated);
        localStorage.setItem(`purchases_${user.id}`, JSON.stringify(updatedIds));
      }
    }
  };

  // DEV/DEMO TOGGLES
  const toggleAdminRole = () => {
    if (!user) return;
    const newRole: UserRole = user.role === 'admin' ? 'customer' : 'admin';
    saveLocalUser({ ...user, role: newRole });
  };

  const toggleSubscription = () => {
    if (!user) return;
    const newTier: SubscriptionTier = user.subscriptionTier === 'none' ? 'annual' : 'none';
    saveLocalUser({ ...user, subscriptionTier: newTier });
  };

  const isAdmin = user?.role === 'admin';
  const isSubscribed = user?.subscriptionTier === 'annual' || user?.subscriptionTier === 'monthly';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isSubscribed,
        subscriptionTier: user?.subscriptionTier || 'none',
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        updatePassword,
        subscribeToPlan,
        cancelSubscription,
        hasAccessToProduct,
        addPurchasedProduct,
        toggleAdminRole,
        toggleSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
