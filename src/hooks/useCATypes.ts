
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CAType {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export const useCATypes = () => {
  return useQuery({
    queryKey: ['ca-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ca_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CAType[];
    },
  });
};
