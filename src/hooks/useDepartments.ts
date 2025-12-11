import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Department } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Re-export Department type for use in components
export type { Department };

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Department[];
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (department: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([department])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Success",
        description: "Department created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Success",
        description: "Department updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Success",
        description: "Department deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    },
  });
};
