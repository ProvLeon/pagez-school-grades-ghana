import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Transfer {
  id: string;
  student_id: string;
  from_class_id: string | null;
  to_class_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_by_teacher_id: string | null;
  approved_by_teacher_id: string | null;
  request_date: string;
  approved_date: string | null;
  completed_date: string | null;
  notes: string | null;
  academic_year: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    student_id: string;
  };
  from_class?: {
    id: string;
    name: string;
  };
  to_class?: {
    id: string;
    name: string;
  };
  requested_by_teacher?: {
    id: string;
    full_name: string;
  };
  approved_by_teacher?: {
    id: string;
    full_name: string;
  };
}

export type CreateTransferData = {
  student_id: string;
  reason: string;
  from_class_id?: string | null;
  to_class_id?: string | null;
  requested_by_teacher_id?: string | null;
  notes?: string | null;
  academic_year?: string;
};

export const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          student:students(id, full_name, student_id),
          from_class:classes!from_class_id(id, name),
          to_class:classes!to_class_id(id, name),
          requested_by_teacher:teachers!requested_by_teacher_id(id, full_name),
          approved_by_teacher:teachers!approved_by_teacher_id(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transfers:', error);
        throw error;
      }

      return data as Transfer[];
    },
  });
};

export const useUpdateTransferStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.approved_date = new Date().toISOString().split('T')[0];
      } else if (status === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      if (notes) {
        updateData.notes = notes;
      }

      // First update the transfer status
      const { data: transferData, error: transferError } = await supabase
        .from('transfers')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          student:students(id, full_name, student_id),
          to_class:classes!to_class_id(id, name)
        `)
        .single();

      if (transferError) throw transferError;

      // If status is completed, actually move the student to the new class
      if (status === 'completed' && transferData.to_class_id && transferData.student_id) {
        console.log(`Moving student ${transferData.student_id} to class ${transferData.to_class_id}`);
        
        const { error: studentUpdateError } = await supabase
          .from('students')
          .update({ 
            class_id: transferData.to_class_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', transferData.student_id);

        if (studentUpdateError) {
          console.error('Error updating student class:', studentUpdateError);
          throw new Error(`Failed to move student to new class: ${studentUpdateError.message}`);
        }
      }

      return transferData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      
      if (data.status === 'completed') {
        toast({
          title: "Transfer Completed",
          description: `${data.student?.full_name} has been successfully moved to ${data.to_class?.name}`,
        });
      } else {
        toast({
          title: "Transfer Updated",
          description: `Transfer status changed to ${data.status}`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Transfer update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update transfer status",
        variant: "destructive",
      });
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transferData: CreateTransferData) => {
      const { data, error } = await supabase
        .from('transfers')
        .insert(transferData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast({
        title: "Transfer Created",
        description: "New transfer request has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create transfer request",
        variant: "destructive",
      });
    },
  });
};
