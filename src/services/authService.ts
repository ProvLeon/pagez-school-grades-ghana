import { supabase } from '@/integrations/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  error: AuthError | null;
  success: boolean;
}

export interface SessionInfo {
  isValid: boolean;
  user: User | null;
}

class AuthService {
  async signIn(credentials: LoginCredentials): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      user: data.user,
      error,
      success: !error,
    };
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // Use 'local' scope to avoid 403 errors when session is already invalid
      // 'local' only clears the session on this device, not all devices
      const result = await supabase.auth.signOut({ scope: 'local' });
      return result;
    } catch (error) {
      // If signOut fails (e.g., session already expired), we still want to
      // clear local state and redirect to login
      console.warn('Sign out error (session may already be invalid):', error);
      return { error: null }; // Return success to allow redirect to login
    }
  }

  async getSessionInfo(): Promise<SessionInfo> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        isValid: false,
        user: null,
      };
    }

    return {
      isValid: true,
      user: session.user,
    };
  }
}

export const authService = new AuthService();
