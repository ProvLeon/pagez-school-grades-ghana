import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { applyThemeColor } from '@/utils/themeUtils';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string | null;
  isLoadingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const primaryColorRef = useRef<string | null>(null);

  // Fetch primary color from database on app load
  useEffect(() => {
    const fetchPrimaryColor = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('primary_color')
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching theme color:', error);
          // Apply default color if fetch fails
          applyThemeColor('#e11d48');
        } else if (data?.primary_color) {
          setPrimaryColor(data.primary_color);
          primaryColorRef.current = data.primary_color;
          applyThemeColor(data.primary_color);
        } else {
          // Apply default color if no settings found
          applyThemeColor('#e11d48');
        }
      } catch (error) {
        console.error('Error fetching theme color:', error);
        // Apply default color on error
        applyThemeColor('#e11d48');
      } finally {
        setIsLoadingTheme(false);
      }
    };

    fetchPrimaryColor();

    // Subscribe to realtime changes on school_settings
    const channel = supabase
      .channel('school_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'school_settings',
        },
        (payload) => {
          const newColor = payload.new?.primary_color;
          if (newColor && newColor !== primaryColorRef.current) {
            setPrimaryColor(newColor);
            primaryColorRef.current = newColor;
            applyThemeColor(newColor);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log("Toggling dark mode from:", isDarkMode, "to:", !isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, primaryColor, isLoadingTheme }}>
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
