import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string | null;  // Used for report sheets only, not main app theme
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
          // Use default color for report sheets if fetch fails
          setPrimaryColor('#e11d48');
          primaryColorRef.current = '#e11d48';
        } else if (data?.primary_color) {
          // Store the color for report sheet use only - don't apply to main app
          setPrimaryColor(data.primary_color);
          primaryColorRef.current = data.primary_color;
        } else {
          // Use default color for report sheets if no settings found
          setPrimaryColor('#e11d48');
          primaryColorRef.current = '#e11d48';
        }
      } catch (error) {
        console.error('Error fetching theme color:', error);
        // Use default color for report sheets on error
        setPrimaryColor('#e11d48');
        primaryColorRef.current = '#e11d48';
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
            // Store the color for report sheet use only - don't apply to main app
            setPrimaryColor(newColor);
            primaryColorRef.current = newColor;
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
