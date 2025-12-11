
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SubjectCombination {
  id: string;
  name: string;
  department_id: string;
  subject_ids: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: {
    id: string;
    name: string;
  };
}

export const useSubjectCombinations = () => {
  return useQuery({
    queryKey: ['subject-combinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subject_combinations')
        .select(`
          *,
          department:departments(id, name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubjectCombination[];
    },
  });
};

export const useCreateSubjectCombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      department_id: string;
      subject_ids: string[];
      description?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('subject_combinations')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-combinations'] });
      toast({
        title: "Success",
        description: "Subject combination created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject combination",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSubjectCombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name: string;
      department_id: string;
      subject_ids: string[];
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('subject_combinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-combinations'] });
      toast({
        title: "Success",
        description: "Subject combination updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject combination",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSubjectCombination = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subject_combinations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-combinations'] });
      toast({
        title: "Success",
        description: "Subject combination deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject combination",
        variant: "destructive",
      });
    },
  });
};
