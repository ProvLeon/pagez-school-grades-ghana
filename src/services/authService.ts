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
    return supabase.auth.signOut();
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