
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Subject } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SubjectWithDepartment extends Omit<Subject, 'department'> {
  department?: {
    id: string;
    name: string;
  };
}

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          department:departments(id, name)
        `)
        .order('name');
      
      if (error) throw error;
      return data as SubjectWithDepartment[];
    },
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subject: { name: string; code?: string; department_id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Success",
        description: "Subject created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name: string; code?: string; department_id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Success",
        description: "Subject updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Success",
        description: "Subject deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    },
  });
};
