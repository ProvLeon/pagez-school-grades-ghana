import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Department } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getUserOrganizationId } from '@/utils/organizationHelper';

// Re-export Department type for use in components
export type { Department };

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      // Get user's organization for data isolation
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        console.warn('User not associated with any organization');
        return [] as Department[];
      }

      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      // Exclude SHS from all department lists
      const filtered = (data as Department[]).filter(d => d.name.toLowerCase() !== 'shs' && d.name.toLowerCase() !== 'senior high' && d.name.toLowerCase() !== 'senior high school');
      return filtered;
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (department: { name: string; description?: string }) => {
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        throw new Error('User is not associated with any organization');
      }

      const { data, error } = await supabase
        .from('departments')
        .insert([{ ...department, organization_id: organizationId }])
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
