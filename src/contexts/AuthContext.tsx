import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from '@/integrations/supabase/client';
import { authService } from "@/services/authService";
import { useUserProfile, Profile } from "@/hooks/useProfiles";
import { useTeacherByUserId } from "@/hooks/useTeacherClassAccess";
import { useToast } from "@/hooks/use-toast";

interface TeacherRecord {
  id: string;
  full_name: string;
  email?: string;
  user_id: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: Profile | null | undefined;
  teacherRecord: TeacherRecord | null | undefined;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  isTeacher: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const { toast } = useToast();

  const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: teacherRecord, isLoading: teacherLoading } = useTeacherByUserId(user?.id);

  // User is a teacher if their profile says so OR if they have a linked teacher record
  const isTeacher = userProfile?.user_type === 'teacher' || !!teacherRecord;
  const isAdmin = ['admin', 'super_admin'].includes((userProfile?.user_type as string) ?? '');
  const isAuthenticated = !!user;

  const signOut = useCallback(async () => {
    try {
      // Clear local user state immediately
      setUser(null);

      // Clear all Supabase-related items from localStorage
      // This ensures no stale session data remains
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Also clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      // Attempt to sign out from Supabase (this may fail if session already invalid)
      try {
        await authService.signOut();
      } catch (e) {
        // Ignore errors - we've already cleared local storage
        console.warn('Supabase signOut error (ignored):', e);
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        variant: "default",
      });
    } catch (error) {
      // Log error but still proceed with sign out
      console.warn('Sign out error:', error);
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
        variant: "default",
      });
    } finally {
      // Always redirect to login, regardless of errors
      // Use replace to prevent back button from returning to authenticated page
      window.location.replace(window.location.origin + '/login');
    }
  }, [toast]);

  // Clear invalid session data from storage
  const clearInvalidSession = useCallback(async () => {
    console.warn('Clearing invalid session data...');
    // Sign out to clear all auth data
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // If there's an error getting the session (e.g., invalid refresh token),
        // clear the session data
        if (error) {
          console.error('Error getting initial session:', error);
          await clearInvalidSession();
          return;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        await clearInvalidSession();
      } finally {
        setInitialAuthLoading(false);
      }
    };

    initializeAuth();

    // Then subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      // Handle token refresh errors by clearing invalid session
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        await clearInvalidSession();
        return;
      }

      // Handle sign out or session expiry
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearInvalidSession]);

  // Include both initial auth loading AND profile/teacher loading
  // This ensures we don't show "Access Denied" while profile or teacher record is still loading
  const contextLoading = initialAuthLoading || (!!user && (profileLoading || teacherLoading));

  const contextValue: AuthContextType = {
    user,
    userProfile,
    teacherRecord,
    loading: contextLoading,
    profileLoading,
    signOut,
    isTeacher,
    isAdmin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const usePermissions = () => {
  const { userProfile, isTeacher, isAdmin } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    if (isAdmin) return true;

    const permissions = userProfile?.permissions || [];
    return permissions.includes(permission);
  }, [userProfile, isAdmin]);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (isAdmin) return true;

    if (isTeacher) {
      const teacherRoutes = [
        '/teacher',
        '/teacher/dashboard',
        '/teacher/results',
        '/teacher/results/add',
        '/teacher/results/manage',
        '/profile'
      ];
      return teacherRoutes.some(allowedRoute => route.startsWith(allowedRoute));
    }

    return false;
  }, [isTeacher, isAdmin]);

  return {
    hasPermission,
    canAccessRoute,
    isTeacher,
    isAdmin,
  };
};
