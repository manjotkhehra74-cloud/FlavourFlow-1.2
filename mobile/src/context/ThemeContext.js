import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeCtx = createContext(null);

const lightColors = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  card2: '#F1F5F9',
  text: '#0F172A',
  textLight: '#334155',
  subtext: '#64748B',
  border: '#E2E8F0',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',
};

const darkColors = {
  bg: '#020617',
  card: '#1E293B',
  card2: '#0F172A',
  text: '#F1F5F9',
  textLight: '#E2E8F0',
  subtext: '#94A3B8',
  border: '#334155',
  navBg: '#0F172A',
  navBorder: '#334155',
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system'); // light | dark | system
  const [resolved, setResolved] = useState(systemScheme || 'dark');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('theme_mode');
      if (saved) setMode(saved);
    })();
  }, []);

  useEffect(() => {
    const next = mode === 'system' ? (systemScheme || 'dark') : mode;
    setResolved(next);
  }, [mode, systemScheme]);

  const setTheme = async (m) => {
    setMode(m);
    await AsyncStorage.setItem('theme_mode', m);
  };

  const isDark = resolved === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeCtx.Provider value={{ mode, resolved, isDark, colors: themeColors, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
