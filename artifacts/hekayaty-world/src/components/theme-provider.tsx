import React, { useEffect } from 'react';
import { useAppStore } from '@/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const language = useAppStore((state) => state.language);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Handle RTL
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [theme, language]);

  return <>{children}</>;
}
