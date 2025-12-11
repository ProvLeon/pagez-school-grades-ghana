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

  const isTeacher = userProfile?.user_type === 'teacher';
  const isAdmin = ['admin', 'super_admin'].includes((userProfile?.user_type as string) ?? '');
  const isAuthenticated = !!user;

  const signOut = useCallback(async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        toast({
          title: "Sign Out Error",
          description: "There was an issue signing out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
          variant: "default",
        });
        window.location.assign(window.location.origin + '/login');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
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

  // Only use initialAuthLoading for the main loading state
  // Profile loading shouldn't block authentication checks
  const contextLoading = initialAuthLoading;

  const contextValue: AuthContextType = {
    user,
    userProfile,
    teacherRecord,
    loading: contextLoading,
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
        '/teacher-dashboard',
        '/teacher-results',
        '/students',
        '/classes',
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
