import { create } from 'zustand';
import { User, TierName } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface SignupData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
}

const mockUser: User = {
  id: 'user-001',
  email: 'sarah.green@email.com',
  phone: '+1 (555) 123-4567',
  firstName: 'Sarah',
  lastName: 'Green',
  totalPoints: 2450,
  currentTier: 'gold' as TierName,
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  createdAt: new Date('2023-06-15'),
  referralCode: 'SARAH2024',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (email && password.length >= 6) {
        set({ 
          user: { ...mockUser, email },
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          authError: 'Invalid email or password. Please try again.',
        });
        return false;
      }
    } catch (error) {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.email && data.password.length >= 6 && data.firstName && data.lastName) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          totalPoints: 100,
          currentTier: 'bronze' as TierName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.firstName + ' ' + data.lastName)}&background=059669&color=fff&size=200`,
          createdAt: new Date(),
          referralCode: data.firstName.toUpperCase().slice(0, 4) + Date.now().toString().slice(-4),
        };
        
        set({ 
          user: newUser,
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          authError: 'Please fill in all required fields correctly.',
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        authError: 'Failed to create account. Please try again.',
      });
      return false;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      authError: null,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ isLoading: false });
  },

  clearError: () => {
    set({ authError: null });
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
}));