
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  user_type: 'admin' | 'teacher';
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          // Log error but don't throw - profile might not exist yet
          console.warn('Error fetching profile (profile may not exist):', error.message);
          return null;
        }
        return data as Profile;
      } catch (err) {
        // Catch any unexpected errors and return null gracefully
        console.warn('Unexpected error fetching profile:', err);
        return null;
      }
    },
    enabled: !!userId,
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ user_id, user_type }: { user_id: string; user_type: 'admin' | 'teacher' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ user_id, user_type })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create user profile",
        variant: "destructive",
      });
    },
  });
};
