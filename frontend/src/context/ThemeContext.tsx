'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeType, getTheme } from '../utils/themes';

type ThemeContextType = {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [theme, setTheme] = useState<Theme>(getTheme('dark'));

  const toggleTheme = () => {
    const newType = themeType === 'dark' ? 'light' : 'dark';
    setThemeType(newType);
    setTheme(getTheme(newType));
  };

  useEffect(() => {
    // Apply theme CSS variables to :root when theme changes
    const root = document.documentElement;
    const cssVars = Object.entries(theme)
      .map(([key, value]) => `--${key}: ${value};`)
      .join(' ');
    
    root.setAttribute('style', cssVars);
    root.setAttribute('data-theme', themeType);
  }, [theme, themeType]);

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
