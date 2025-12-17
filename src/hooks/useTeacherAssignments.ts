
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  is_primary_teacher: boolean;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    full_name: string;
    email?: string;
  };
  class?: {
    id: string;
    name: string;
    department?: {
      name: string;
    };
  };
  subject?: {
    id: string;
    name: string;
    code?: string;
  };
}

export type CreateTeacherAssignmentData = {
  teacher_id: string;
  class_id: string;
  subject_id: string;
  academic_year?: string;
  is_primary_teacher?: boolean;
};

export const useTeacherAssignments = (teacherId?: string, classId?: string) => {
  return useQuery({
    queryKey: ['teacher_assignments', teacherId, classId],
    queryFn: async () => {
      let query = supabase
        .from('teacher_assignments')
        .select(`
          *,
          teacher:teachers(id, full_name, email),
          class:classes(id, name, department:departments(name)),
          subject:subjects(id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching teacher assignments:', error);
        throw error;
      }

      return data as TeacherAssignment[];
    },
  });
};

export const useCreateTeacherAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentData: CreateTeacherAssignmentData) => {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .insert({
          ...assignmentData,
          academic_year: assignmentData.academic_year || '2024/2025'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_assignments'] });
      toast({
        title: "Assignment Created",
        description: "Teacher assignment has been created successfully",
      });
    },
    onError: (error) => {
      console.error('Assignment creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create teacher assignment",
        variant: "destructive",
      });
    },
  });
};

// Bulk create multiple assignments at once (for multiple classes/subjects)
export const useBulkCreateTeacherAssignments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignments: CreateTeacherAssignmentData[]) => {
      if (assignments.length === 0) {
        throw new Error('No assignments to create');
      }

      const assignmentsWithDefaults = assignments.map(a => ({
        ...a,
        academic_year: a.academic_year || '2024/2025',
      }));

      const { data, error } = await supabase
        .from('teacher_assignments')
        .insert(assignmentsWithDefaults)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacher_assignments'] });
      toast({
        title: "Assignments Created",
        description: `${data.length} teacher assignment(s) created successfully`,
      });
    },
    onError: (error: Error) => {
      console.error('Bulk assignment creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher assignments",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeacherAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('teacher_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_assignments'] });
      toast({
        title: "Assignment Removed",
        description: "Teacher assignment has been removed successfully",
      });
    },
    onError: (error) => {
      console.error('Assignment deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to remove teacher assignment",
        variant: "destructive",
      });
    },
  });
};
