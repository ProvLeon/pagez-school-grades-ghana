
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SheetTemplate {
  id: string;
  name: string;
  type: 'student_registration' | 'results_entry' | 'attendance' | 'teacher_assignment';
  description?: string;
  template_config: any;
  file_path?: string;
  department_id?: string;
  class_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CreateSheetTemplateInput = {
  name: string;
  type: 'student_registration' | 'results_entry' | 'attendance' | 'teacher_assignment';
  description?: string;
  template_config?: any;
  file_path?: string;
  department_id?: string;
  class_id?: string;
  is_active?: boolean;
};

export const useSheetTemplates = () => {
  return useQuery({
    queryKey: ['sheet-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SheetTemplate[];
    }
  });
};

export const useCreateSheetTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: CreateSheetTemplateInput) => {
      const { data, error } = await supabase
        .from('sheet_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-templates'] });
      toast({
        title: "Template Created",
        description: "Sheet template has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sheet template",
        variant: "destructive",
      });
      console.error('Error creating sheet template:', error);
    }
  });
};
