
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SubjectMark {
  id: string;
  result_id: string;
  subject_id: string;
  ca1_score?: number;
  ca2_score?: number;
  ca3_score?: number;
  ca4_score?: number;
  exam_score?: number;
  total_score?: number;
  grade?: string;
  position?: number;
  created_at: string;
  updated_at: string;
  subject?: any;
}

export const useSubjectMarksByResult = (resultId: string) => {
  return useQuery({
    queryKey: ['subject-marks', resultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subject_marks')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('result_id', resultId);
      
      if (error) throw error;
      return data as SubjectMark[];
    },
    enabled: !!resultId,
  });
};

export const useCreateSubjectMark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<SubjectMark>) => {
      const { data: mark, error } = await supabase
        .from('subject_marks')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return mark;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-marks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject mark",
        variant: "destructive",
      });
    },
  });
};

export const useBulkCreateSubjectMarks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (marks: Partial<SubjectMark>[]) => {
      const { data, error } = await supabase
        .from('subject_marks')
        .insert(marks)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-marks'] });
      toast({
        title: "Success",
        description: "Subject marks saved successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save subject marks",
        variant: "destructive",
      });
    },
  });
};

export const useBulkUpdateSubjectMarks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ resultId, marks }: { resultId: string; marks: Partial<SubjectMark>[] }) => {
      // First, delete existing subject marks for this result
      const { error: deleteError } = await supabase
        .from('subject_marks')
        .delete()
        .eq('result_id', resultId);
      
      if (deleteError) throw deleteError;

      // Then insert the new marks
      if (marks.length > 0) {
        const { data, error } = await supabase
          .from('subject_marks')
          .insert(marks)
          .select();

        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-marks'] });
      toast({
        title: "Success",
        description: "Subject marks updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject marks",
        variant: "destructive",
      });
    },
  });
};
