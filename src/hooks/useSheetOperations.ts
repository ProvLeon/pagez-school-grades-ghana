
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SheetOperation {
  id: string;
  operation_type: 'student_upload' | 'results_upload' | 'template_download' | 'report_export';
  template_id?: string;
  file_name?: string;
  file_path?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  failed_records: number;
  error_log: any[];
  metadata: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

type CreateSheetOperationInput = {
  operation_type: 'student_upload' | 'results_upload' | 'template_download' | 'report_export';
  template_id?: string;
  file_name?: string;
  file_path?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  total_records?: number;
  processed_records?: number;
  failed_records?: number;
  error_log?: any[];
  metadata?: any;
  created_by?: string;
};

export const useSheetOperations = () => {
  return useQuery({
    queryKey: ['sheet-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_operations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SheetOperation[];
    }
  });
};

export const useCreateSheetOperation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (operation: CreateSheetOperationInput) => {
      const { data, error } = await supabase
        .from('sheet_operations')
        .insert(operation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-operations'] });
      toast({
        title: "Operation Created",
        description: "Sheet operation has been initiated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sheet operation",
        variant: "destructive",
      });
      console.error('Error creating sheet operation:', error);
    }
  });
};

export const useUpdateSheetOperation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SheetOperation> }) => {
      const { data, error } = await supabase
        .from('sheet_operations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-operations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update sheet operation",
        variant: "destructive",
      });
      console.error('Error updating sheet operation:', error);
    }
  });
};
