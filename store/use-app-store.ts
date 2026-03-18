import { create } from 'zustand';


interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  clinicMembers?: any[];
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
}

interface AppState {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Clinic State
  clinic: Clinic | null;

  // Actions
  setAuth: (user: User, token: string, clinic?: Clinic | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setClinic: (clinic: Clinic) => void;
  clearClinic: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  clinic: null,

  setAuth: (user, token, clinic = null) => set((state) => ({ 
    user, 
    token, 
    isAuthenticated: !!token,
    clinic: clinic !== undefined ? clinic : state.clinic // only override if provided
  })),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false, clinic: null }),
  
  setClinic: (clinic) => set({ clinic }),
  clearClinic: () => set({ clinic: null }),
}));
