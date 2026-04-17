import { create } from 'zustand';
import { User, TierName } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

interface SignupData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
}

const mapDatabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    phone: dbUser.phone || '',
    firstName: dbUser.firstName || '',
    lastName: dbUser.lastName || '',
    totalPoints: dbUser.totalPoints || 0,
    currentTier: (dbUser.currentTier || 'bronze') as TierName,
    avatar: dbUser.avatar || '',
    createdAt: new Date(dbUser.created_at),
    referralCode: dbUser.referralCode || '',
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, authError: null });
    
    try {
      if (!email || !password) {
        set({ 
          isLoading: false, 
          authError: 'Please fill in all required fields.',
        });
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let friendlyMessage = 'Incorrect email or password. Please try again.';
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please verify your email before logging in.';
        }
        set({ 
          isLoading: false, 
          authError: friendlyMessage,
        });
        return false;
      }

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          set({ 
            isLoading: false, 
            authError: 'Failed to load user profile. Please try again.',
          });
          return false;
        }

        const user = mapDatabaseUserToUser(userData);
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      }

      set({ 
        isLoading: false, 
        authError: 'Login failed. Please try again.',
      });
      return false;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        authError: 'An unexpected error occurred. Please try again.',
      });
      return false;
    }
  },

  signup: async (data: SignupData): Promise<boolean> => {
    set({ isLoading: true, authError: null });
    
    try {
      if (!data.email || !data.password || !data.firstName || !data.lastName || !data.phone) {
        set({ 
          isLoading: false, 
          authError: 'Please fill in all required fields.',
        });
        return false;
      }

      if (data.password.length < 6) {
        set({ 
          isLoading: false, 
          authError: 'Password must be at least 6 characters long.',
        });
        return false;
      }

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signupError) {
        let friendlyMessage = 'Failed to create account. Please try again.';
        if (signupError.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (signupError.message.includes('invalid email')) {
          friendlyMessage = 'Please enter a valid email address.';
        }
        set({ 
          isLoading: false, 
          authError: friendlyMessage,
        });
        return false;
      }

      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) {
          set({ 
            isLoading: false, 
            authError: 'Account created but failed to load profile. Please try logging in.',
          });
          return false;
        }

        const user = mapDatabaseUserToUser(userData);
        set({ 
          user,
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      }

      set({ 
        isLoading: false, 
        authError: 'Failed to create account. Please try again.',
      });
      return false;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        authError: 'An unexpected error occurred. Please try again.',
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        authError: null,
      });
    } catch (error) {
      set({ 
        authError: 'Failed to logout. Please try again.',
      });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        set({ isLoading: false });
        return;
      }

      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!userError && userData) {
          const user = mapDatabaseUserToUser(userData);
          set({ 
            user,
            isAuthenticated: true, 
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userData) {
              const user = mapDatabaseUserToUser(userData);
              set({ 
                user,
                isAuthenticated: true,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ 
              user: null, 
              isAuthenticated: false,
              authError: null,
            });
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ authError: null });
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
      if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        set({ authError: 'Failed to update profile. Please try again.' });
        return;
      }

      if (updatedUser) {
        const mappedUser = mapDatabaseUserToUser(updatedUser);
        set({ user: mappedUser });
      }
    } catch (error) {
      set({ authError: 'An unexpected error occurred while updating profile.' });
    }
  },
}));