import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from '@/integrations/supabase/client';
import { authService } from "@/services/authService";
import { useUserProfile, Profile } from "@/hooks/useProfiles";
import { useTeacherByUserId } from "@/hooks/useTeacherClassAccess";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TeacherRecord {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  user_id: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: Profile | null | undefined;
  teacherRecord: TeacherRecord | null | undefined;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isTeacher: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useUserProfile(user?.id);
  const { data: teacherRecord, isLoading: teacherLoading, isFetched: teacherFetched } = useTeacherByUserId(user?.id);

  // Roles are only trustworthy once BOTH queries have fetched at least once
  // for the current user. `isFetched` resets to false automatically whenever
  // the queryKey changes (i.e. userId changes), so this correctly blocks any
  // intermediate render where profileLoading/teacherLoading haven't started yet.
  const rolesReady = !user || (profileFetched && teacherFetched);

  // Derive role from profile type first (source of truth).
  // teacherRecord is only a fallback for users who haven't had their profile
  // created yet — it must never override an admin's actual role.
  const isAdmin = ['admin', 'super_admin'].includes((userProfile?.user_type as string) ?? '');
  const isTeacher = !isAdmin && (userProfile?.user_type === 'teacher' || !!teacherRecord);
  const isAuthenticated = !!user;

  // Function to refresh user data from Supabase
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error refreshing user:', error);
        return;
      }
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // 1. Wipe all React Query cached data immediately — prevents stale
      //    authenticated data from briefly flashing on the login page.
      queryClient.clear();

      // 2. Clear local user state → ProtectedRoute detects isAuthenticated=false
      //    and redirects to /login via React Router (no page reload).
      setUser(null);

      // 3. Clear any leftover Supabase session keys from storage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      // 4. Tell Supabase to invalidate the server-side session token
      try {
        await authService.signOut();
      } catch (e) {
        // Safe to ignore — local state is already cleared
        console.warn('Supabase signOut error (ignored):', e);
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        variant: "default",
      });

      // NOTE: No window.location.replace here.
      // setUser(null) already triggers ProtectedRoute → navigate('/login') via
      // React Router — a smooth SPA transition with no page reload.
    } catch (error) {
      console.warn('Sign out error:', error);
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
        variant: "default",
      });
    }
  }, [toast, queryClient]);

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

  // Hold the loading gate open until:
  // 1. The initial auth session check is done, AND
  // 2. Both profile + teacher queries have fetched at least once for the current user.
  // Using rolesReady (isFetched-based) instead of isLoading prevents the one-frame
  // window where isLoading is still false before React Query kicks off its fetch.
  const contextLoading = initialAuthLoading || !rolesReady;

  const contextValue: AuthContextType = {
    user,
    userProfile,
    teacherRecord,
    loading: contextLoading,
    profileLoading,
    signOut,
    refreshUser,
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
