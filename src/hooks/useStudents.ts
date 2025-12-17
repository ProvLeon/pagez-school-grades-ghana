import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  class_id?: string;
  department_id?: string;
  academic_year: string;
  photo_url?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  has_left: boolean;
  created_at: string;
  updated_at: string;
  class?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

export const useStudents = (filters?: {
  class_id?: string;
  class_ids?: string[]; // For filtering by multiple classes (e.g., teacher's assigned classes)
  department_id?: string;
  has_left?: boolean;
  search?: string;
  gender?: string;
}) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          department:departments(id, name)
        `)
        .order('created_at', { ascending: false });

      // Single class filter takes precedence
      if (filters?.class_id) {
        query = query.eq('class_id', filters.class_id);
      } else if (filters?.class_ids && filters.class_ids.length > 0) {
        // Filter by multiple class IDs (for teacher access)
        query = query.in('class_id', filters.class_ids);
      }

      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id);
      }

      if (filters?.has_left !== undefined) {
        query = query.eq('has_left', filters.has_left);
      }

      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      return data as Student[];
    },
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'class' | 'department'>) => {
      console.log('Creating student with data:', studentData);

      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate both students and classes queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "Failed to create student: " + (error.message || 'Unknown error'),
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both students and classes queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update student: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate both students and classes queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete student: " + error.message,
        variant: "destructive",
      });
    },
  });
};
