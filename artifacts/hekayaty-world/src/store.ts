import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';
type Language = 'en' | 'ar';

interface AppState {
  theme: Theme;
  language: Language;
  searchOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setSearchOpen: (open: boolean) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      searchOpen: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ar' : 'en' })),
    }),
    {
      name: 'hekayaty-world-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
);
