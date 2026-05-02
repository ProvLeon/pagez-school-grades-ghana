import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'react-router-dom';

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
        // Get current user first
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting current user:', userError);
          // Use default color if user not authenticated
          setPrimaryColor('#e11d48');
          primaryColorRef.current = '#e11d48';
          setIsLoadingTheme(false);
          return;
        }

        // Fetch school_settings for current user
        const { data, error } = await supabase
          .from('school_settings')
          .select('primary_color')
          .eq('admin_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
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

  const location = useLocation();

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Define public/marketing routes that MUST remain in light mode
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/student-reports', '/no-organization'];
    const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/mock-results');

    if (isPublicRoute) {
      // Force remove dark class on marketing/auth pages
      document.documentElement.classList.remove('dark');
    } else {
      // Respect user preference on application pages
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, location.pathname]);

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
