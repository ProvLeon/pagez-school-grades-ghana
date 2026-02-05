import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getUserOrganizationId } from '@/utils/organizationHelper';

export interface CAType {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, number>;
  created_at: string;
  updated_at: string;
  organization_id: string | null;
}

export const useCATypes = () => {
  return useQuery({
    queryKey: ['ca-types'],
    queryFn: async () => {
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        console.warn('User not associated with any organization');
        return [];
      }

      const { data, error } = await supabase
        .from('ca_types')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      return data as CAType[];
    },
  });
};
