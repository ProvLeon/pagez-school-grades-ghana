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
  const { user, isTeacher } = useAuth();
  const { data: teacher, isLoading: teacherLoading, isFetched: teacherFetched } = useTeacherByUserId(user?.id);
  const { data: assignments = [], isLoading: assignmentsLoading, isFetched: assignmentsFetched } = useTeacherClassAccess();

  // Combined loading state - we're loading if either teacher record or assignments are loading
  const isLoading = (isTeacher && teacherLoading) || (!!teacher?.id && assignmentsLoading);

  // Check if data has been fetched (not loading and query was enabled)
  // For teachers: we're loaded when teacher query is done (teacher is null or has data)
  // For non-teachers: we're always "loaded" since we don't need teacher data
  const hasLoaded = isTeacher
    ? (teacherFetched && (teacher?.id ? assignmentsFetched : true))
    : true;

  const canAccessClass = (classId: string) => {
    return assignments.some(assignment => assignment.class_id === classId);
  };

  // Return unique class IDs (a teacher may be assigned to same class for multiple subjects)
  const getAccessibleClassIds = (): string[] => {
    const classIds = assignments.map(assignment => assignment.class_id);
    return [...new Set(classIds)];
  };

  // Return unique classes (deduplicated by class id)
  const getAssignedClasses = () => {
    const classesMap = new Map<string, typeof assignments[0]['class']>();
    assignments.forEach(assignment => {
      if (assignment.class && !classesMap.has(assignment.class_id)) {
        classesMap.set(assignment.class_id, assignment.class);
      }
    });
    return Array.from(classesMap.values());
  };

  return {
    canAccessClass,
    getAccessibleClassIds,
    getAssignedClasses,
    assignments,
    isLoading,
    hasLoaded,
    teacherId: teacher?.id,
  };
};
