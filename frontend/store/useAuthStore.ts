import { create } from 'zustand';
import { loginApi, signupApi, updateProfileApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'user' | 'provider';
  category?: string;
  areas?: string[];
}

interface AuthState {
  user: User | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  hasCompletedOnboarding: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string, role: string, category?: string, baseRate?: number, areas?: string[]) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { category?: string; areas?: string[] }) => Promise<boolean>;
}

const mockUser: User = {
  id: 'user_001',
  name: 'Ahmed Hassan',
  email: 'ahmed@example.com',
  phone: '0300-1234567',
  avatar: '👤',
  role: 'user',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isOnboarded: false,
  isLoggedIn: false,
  hasCompletedOnboarding: () => set({ isOnboarded: true }),
  login: async (email: string, password: string) => {
    try {
      const data = await loginApi(email, password);
      set({ user: data.user, isLoggedIn: true });
      return true;
    } catch (e) {
      throw e;
    }
  },
  signup: async (name: string, email: string, phone: string, password: string, role: string, category?: string, baseRate?: number, areas?: string[]) => {
    try {
      const data = await signupApi(name, email, phone, password, role, category, baseRate, areas);
      set({ user: data.user, isLoggedIn: true });
      return true;
    } catch (e) {
      throw e;
    }
  },
  logout: () => set({ user: null, isLoggedIn: false }),
  updateProfile: async (data) => {
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return false;
      const res = await updateProfileApi({
        user_id: currentUser.id,
        name: data.name,
        phone: data.phone,
        category: data.category,
        areas: data.areas,
      });
      set({ user: res.user });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
}));
