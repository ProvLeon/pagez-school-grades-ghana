import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Result {
  id: string;
  student_id: string;
  class_id: string;
  term: 'first' | 'second' | 'third';
  academic_year: string;
  ca_type_id?: string;
  days_school_opened?: number;
  days_present?: number;
  days_absent?: number;
  term_begin?: string;
  term_ends?: string;
  next_term_begin?: string;
  teachers_comment?: string;
  teacher_id?: string;
  admin_approved: boolean;
  teacher_approved: boolean;
  is_public?: boolean;
  total_score?: number;
  total_marks?: number;
  overall_position?: number;
  promoted_to_class?: string;
  attitude?: string;
  conduct?: string;
  interest?: string;
  heads_remarks?: string;
  created_at: string;
  updated_at: string;
  student?: any;
  class?: any;
  teacher?: any;
  ca_type?: any;
  subject_marks?: Array<{
    id: string;
    subject_id: string;
    ca1_score?: number | null;
    ca2_score?: number | null;
    ca3_score?: number | null;
    ca4_score?: number | null;
    exam_score?: number | null;
    total_score?: number | null;
    grade?: string | null;
    subject?: { id: string; name: string };
  }>;
}

export const useResults = () => {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      // First try with all relations
      let { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students(*),
          class:classes(*, department:departments(*)),
          teacher:teachers(*),
          ca_type:ca_types(*),
          subject_marks(*, subject:subjects(id, name))
        `)
        .order('created_at', { ascending: false });

      // If 406 error (relation doesn't exist), try without optional relations
      if (error && error.code === 'PGRST200') {
        console.warn('Some relations not found, retrying with basic query...');
        const fallbackResult = await supabase
          .from('results')
          .select(`
            *,
            student:students(*),
            class:classes(*, department:departments(*)),
            subject_marks(*, subject:subjects(id, name))
          `)
          .order('created_at', { ascending: false });

        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        console.error('Error fetching results:', error);
        throw error;
      }

      console.log('Raw results from database:', data);
      console.log('Number of results fetched:', data?.length || 0);

      // Log details about each result for debugging
      data?.forEach((result, index) => {
        console.log(`Result ${index + 1}:`, {
          id: result.id,
          student_name: result.student?.full_name,
          class_name: result.class?.name,
          term: result.term,
          academic_year: result.academic_year,
          subject_marks_count: result.subject_marks?.length || 0
        });
      });

      return data as Result[];
    },
  });
};

export const useCheckExistingResult = () => {
  return useMutation({
    mutationFn: async ({ student_id, term, academic_year, exclude_result_id }: {
      student_id: string;
      term: string;
      academic_year: string;
      exclude_result_id?: string;
    }) => {
      let query = supabase
        .from('results')
        .select('id')
        .eq('student_id', student_id)
        .eq('term', term)
        .eq('academic_year', academic_year);

      // Exclude the current result being edited
      if (exclude_result_id) {
        query = query.neq('id', exclude_result_id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Result>) => {
      const { data: result, error } = await supabase
        .from('results')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({
        title: "Success",
        description: "Result created successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Create result error:', error);
      let errorMessage = "Failed to create result";

      if (error.message?.includes('duplicate key value violates unique constraint')) {
        errorMessage = "A result already exists for this student, term, and academic year. Please check existing results or choose a different combination.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Result> }) => {
      const { data: result, error } = await supabase
        .from('results')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['result-edit'] });
      toast({
        title: "Success",
        description: "Result updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Update result error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update result",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resultId: string) => {
      console.log("Deleting result with ID:", resultId);

      // First delete related subject marks
      const { error: subjectMarksError } = await supabase
        .from('subject_marks')
        .delete()
        .eq('result_id', resultId);

      if (subjectMarksError) {
        console.error("Error deleting subject marks:", subjectMarksError);
        throw subjectMarksError;
      }

      // Then delete the result
      const { error: resultError } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId);

      if (resultError) {
        console.error("Error deleting result:", resultError);
        throw resultError;
      }

      return resultId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({
        title: "Result Deleted",
        description: "The result has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete the result. Please try again.",
        variant: "destructive",
      });
    },
  });
};
