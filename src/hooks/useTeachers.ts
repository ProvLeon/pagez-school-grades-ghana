
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
      const email = teacherData.email || `${teacherData.username}@school.local`;
      let userId: string | null = null;

      // Check if user already exists with this email
      const { data: existingTeacher } = await supabase
        .from('teachers')
        .select('id, email, user_id')
        .eq('email', email)
        .maybeSingle();

      if (existingTeacher) {
        throw new Error(`A teacher with email ${email} already exists`);
      }

      // Try to create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: teacherData.password,
        options: {
          data: {
            user_type: 'teacher',
            full_name: teacherData.full_name,
          }
        }
      });

      if (authError) {
        // If user already exists in auth, we can still create the teacher record
        if (authError.message.includes('already registered')) {
          console.warn('Auth user already exists, creating teacher record without auth link');
          userId = null;
        } else {
          console.error('Auth user creation error:', authError);
          throw new Error(`Failed to create authentication account: ${authError.message}`);
        }
      } else if (authData.user) {
        userId = authData.user.id;
      }

      // Create teacher record - only include columns that exist in the table
      // Base columns that definitely exist
      const teacherInsertData: Record<string, unknown> = {
        full_name: teacherData.full_name,
        email: email,
        phone: teacherData.phone || null,
        department_id: teacherData.department_id || null,
      };

      // Only add user_id if we created an auth user
      if (userId) {
        teacherInsertData.user_id = userId;
      }

      const { data: teacherRecord, error: teacherError } = await supabase
        .from('teachers')
        .insert(teacherInsertData)
        .select()
        .single();

      if (teacherError) {
        console.error('Teacher record creation error:', teacherError);
        // If teacher creation fails and we created an auth user, try to clean up
        if (userId) {
          try {
            await supabase.auth.admin.deleteUser(userId);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
        }
        throw new Error(`Failed to create teacher record: ${teacherError.message}`);
      }

      return teacherRecord;
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
      // First get the teacher to find their user_id
      const { data: teacher, error: fetchError } = await supabase
        .from('teachers')
        .select('user_id, full_name')
        .eq('id', teacherId)
        .single();

      if (fetchError) {
        console.error('Error fetching teacher:', fetchError);
        throw new Error('Failed to find teacher record');
      }

      // Delete the teacher record (this will cascade delete due to foreign key)
      const { error: deleteError } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (deleteError) {
        console.error('Error deleting teacher:', deleteError);
        throw new Error('Failed to delete teacher record');
      }

      // If teacher has a linked auth user, try to delete that too
      // Note: This requires service role key which may not be available on client
      if (teacher.user_id) {
        try {
          const { error: authDeleteError } = await supabase.auth.admin.deleteUser(teacher.user_id);
          if (authDeleteError) {
            console.error('Error deleting auth user (may require service role):', authDeleteError);
            // Don't throw here as the teacher record is already deleted
          }
        } catch (authError) {
          console.error('Could not delete auth user (service role may be required):', authError);
        }
      }

      return teacher;
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
