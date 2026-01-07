import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Class } from '@/lib/supabase';

export const useClasses = (departmentId?: string) => {
  return useQuery({
    queryKey: ['classes', departmentId],
    queryFn: async () => {
      // First, fetch all classes with their relations
      let query = supabase
        .from('classes')
        .select(`
          *,
          department:departments(*),
          teacher:teachers(*)
        `)
        .order('name');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data: classes, error: classesError } = await query;

      if (classesError) throw classesError;

      if (!classes || classes.length === 0) {
        return [] as Class[];
      }

      // Get student counts for all classes in a single query
      const { data: studentCounts, error: countError } = await supabase
        .from('students')
        .select('class_id')
        .not('class_id', 'is', null);

      if (countError) {
        console.error('Error fetching student counts:', countError);
        // Return classes without counts if there's an error
        return classes as Class[];
      }

      // Count students per class
      const countsByClassId: Record<string, number> = {};
      if (studentCounts) {
        for (const student of studentCounts) {
          if (student.class_id) {
            countsByClassId[student.class_id] = (countsByClassId[student.class_id] || 0) + 1;
          }
        }
      }

      // Merge student counts into classes
      const classesWithCounts = classes.map(cls => ({
        ...cls,
        student_count: countsByClassId[cls.id] || 0
      }));

      return classesWithCounts as Class[];
    },
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: {
      name: string;
      department_id: string;
      academic_year: string;
      teacher_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: {
      id: string;
      name?: string;
      department_id?: string;
      academic_year?: string;
      teacher_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};
