
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
        .or(`organization_id.eq.${organizationId},organization_id.is.null`);
      if (error) throw error;
      return data as CAType[];
    },
  });
};
