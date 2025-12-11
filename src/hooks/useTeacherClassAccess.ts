import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherRecord {
  id: string;
  full_name: string;
  email?: string;
  user_id: string;
}

export const useTeacherByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ['teacher_by_user_id', userId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(); // Use maybeSingle instead of single to handle no records gracefully

        if (error) {
          // Log error but don't throw - user might not be a teacher
          console.warn('Error fetching teacher (user may not be a teacher):', error.message);
          return null;
        }

        return data as TeacherRecord | null;
      } catch (err) {
        // Catch any unexpected errors and return null gracefully
        console.warn('Unexpected error fetching teacher:', err);
        return null;
      }
    },
    enabled: !!userId,
    retry: false, // Don't retry on failure - user might not be a teacher
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useTeacherClassAccess = () => {
  const { user, isTeacher } = useAuth();
  const { data: teacher } = useTeacherByUserId(user?.id);
  
  return useQuery({
    queryKey: ['teacher_class_access', teacher?.id],
    queryFn: async () => {
      if (!teacher?.id) return [];
      
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          *,
          class:classes(
            id,
            name,
            department:departments(name)
          ),
          subject:subjects(id, name, code)
        `)
        .eq('teacher_id', teacher.id);
      
      if (error) {
        console.error('Error fetching teacher class access:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!teacher?.id && isTeacher,
  });
};

export const useCanAccessClass = () => {
  const { data: assignments = [] } = useTeacherClassAccess();
  
  const canAccessClass = (classId: string) => {
    return assignments.some(assignment => assignment.class_id === classId);
  };
  
  const getAccessibleClassIds = () => {
    return assignments.map(assignment => assignment.class_id);
  };
  
  const getAssignedClasses = () => {
    return assignments.map(assignment => assignment.class).filter(Boolean);
  };
  
  return {
    canAccessClass,
    getAccessibleClassIds,
    getAssignedClasses,
    assignments
  };
};