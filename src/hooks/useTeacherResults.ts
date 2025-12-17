import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCanAccessClass } from './useTeacherClassAccess';
import { Result } from './useResults';

export const useTeacherResults = () => {
  const { isTeacher } = useAuth();
  const { getAccessibleClassIds } = useCanAccessClass();
  const accessibleClassIds = getAccessibleClassIds();

  return useQuery({
    queryKey: ['teacher_results', accessibleClassIds],
    queryFn: async () => {
      if (!isTeacher || accessibleClassIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students(*),
          class:classes(*, department:departments(*)),
          teacher:teachers(*),
          ca_type:ca_types(*),
          subject_marks(*, subject:subjects(id, name))
        `)
        .in('class_id', accessibleClassIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Result[];
    },
    enabled: isTeacher && accessibleClassIds.length > 0,
  });
};
