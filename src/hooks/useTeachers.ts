import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Teacher } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ExtendedTeacher extends Teacher {
  username?: string;
  password_hash?: string;
  is_active?: boolean;
  last_login?: string;
  created_by?: string;
  user_id?: string;
}

export type CreateTeacherData = {
  full_name: string;
  email?: string;
  phone?: string;
  department_id?: string;
  username: string;
  password: string;
};

export const useTeachers = (departmentId?: string) => {
  return useQuery({
    queryKey: ['teachers', departmentId],
    queryFn: async () => {
      let query = supabase
        .from('teachers')
        .select(`
          *,
          department:departments(*)
        `)
        .order('full_name');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExtendedTeacher[];
    },
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacherData: CreateTeacherData) => {
      // Get the current session to pass auth to the edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        throw new Error('No active session. Please log in again.');
      }

      const accessToken = sessionData.session.access_token;

      // Call the edge function which uses admin API to create users with email_confirm: true
      // This ensures the teacher can log in immediately without email verification
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-teacher`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            full_name: teacherData.full_name,
            email: teacherData.email,
            password: teacherData.password,
            phone: teacherData.phone,
            department_id: teacherData.department_id,
            username: teacherData.username,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create teacher');
      }

      return result.teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Created",
        description: "New teacher account has been successfully created with login credentials",
      });
    },
    onError: (error) => {
      console.error('Teacher creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher account",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: Partial<ExtendedTeacher> }) => {
      const { data, error } = await supabase
        .from('teachers')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Updated",
        description: "Teacher information has been successfully updated",
      });
    },
    onError: (error) => {
      console.error('Teacher update error:', error);
      toast({
        title: "Error",
        description: "Failed to update teacher information",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      // Get the current session to pass auth to the edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error('Session expired. Please refresh the page and try again.');
        }
      }

      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('No active session. Please log in again.');
      }

      // Call the edge function which uses admin API to delete both teacher record and auth user
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-teacher`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            teacher_id: teacherId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete teacher');
      }

      return { full_name: result.teacher_name };
    },
    onSuccess: (deletedTeacher) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Deleted",
        description: `${deletedTeacher.full_name} has been successfully removed from the system`,
      });
    },
    onError: (error) => {
      console.error('Teacher deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });
};
