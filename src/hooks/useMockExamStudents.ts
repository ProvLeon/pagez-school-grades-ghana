import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type MockExamStudent = {
  id: string;
  full_name: string;
  class_id: string | null;
  class_name?: string;
  student_id?: string;
  no_on_roll?: string;
};

/**
 * Fetch students for mock exams based on class IDs
 * If no classIds provided, returns empty array
 */
export const useMockExamStudents = (classIds: string[] | null) => {
  return useQuery({
    queryKey: ["mock-exam-students", classIds],
    enabled: !!classIds && classIds.length > 0,
    staleTime: 30000, // 30 seconds - prevent excessive refetching
    retry: false, // Don't retry on errors (prevents infinite 400 error loops)
    queryFn: async (): Promise<MockExamStudent[]> => {
      if (!classIds || classIds.length === 0) {
        return [];
      }

      // Query students in the specified classes
      // Use .eq() for single class, .in() for multiple to avoid potential issues
      let query = supabase
        .from("students")
        .select(`
          id,
          full_name,
          class_id,
          student_id,
          no_on_roll,
          has_left,
          class:classes(id, name)
        `);

      // Use eq for single class, in for multiple
      if (classIds.length === 1) {
        query = query.eq("class_id", classIds[0]);
      } else {
        query = query.in("class_id", classIds);
      }

      const { data: students, error } = await query.order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      // Filter out students who have explicitly left (has_left === true)
      // Include students where has_left is false, null, or undefined
      const activeStudents = (students || []).filter(s => s.has_left !== true);

      return activeStudents.map((s) => {
        // Handle class relation - could be object or array depending on Supabase response
        const classRaw = s.class;
        let className: string | null = null;
        if (classRaw) {
          if (Array.isArray(classRaw) && classRaw.length > 0) {
            className = (classRaw[0] as { name?: string })?.name || null;
          } else if (typeof classRaw === 'object' && 'name' in classRaw) {
            className = (classRaw as { name: string }).name;
          }
        }
        return {
          id: s.id,
          full_name: s.full_name,
          class_id: s.class_id,
          class_name: className,
          student_id: s.student_id || undefined,
          no_on_roll: s.no_on_roll || undefined,
        };
      });
    },
  });
};

/**
 * Fetch students for a single class
 */
export const useMockExamStudentsByClass = (classId: string | null) => {
  return useMockExamStudents(classId ? [classId] : null);
};

/**
 * Fetch students for mock exams by department
 */
export const useMockExamStudentsByDepartment = (departmentId: string | null) => {
  return useQuery({
    queryKey: ["mock-exam-students-by-department", departmentId],
    enabled: !!departmentId,
    retry: false, // Don't retry on errors
    queryFn: async (): Promise<MockExamStudent[]> => {
      if (!departmentId) return [];

      // First get classes in this department
      const { data: classes, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("department_id", departmentId);

      if (classError) throw classError;

      const classIds = (classes || []).map((c) => c.id);
      if (classIds.length === 0) return [];

      // Then get students in those classes
      // Use .eq() for single class, .in() for multiple
      let query = supabase
        .from("students")
        .select(`
          id,
          full_name,
          class_id,
          student_id,
          no_on_roll,
          has_left,
          class:classes(id, name)
        `);

      if (classIds.length === 1) {
        query = query.eq("class_id", classIds[0]);
      } else {
        query = query.in("class_id", classIds);
      }

      const { data: students, error } = await query.order("full_name", { ascending: true });

      if (error) throw error;

      // Filter out students who have explicitly left (has_left === true)
      const activeStudents = (students || []).filter(s => s.has_left !== true);

      return activeStudents.map((s) => {
        // Handle class relation - could be object or array depending on Supabase response
        const classRaw = s.class;
        let className: string | null = null;
        if (classRaw) {
          if (Array.isArray(classRaw) && classRaw.length > 0) {
            className = (classRaw[0] as { name?: string })?.name || null;
          } else if (typeof classRaw === 'object' && 'name' in classRaw) {
            className = (classRaw as { name: string }).name;
          }
        }
        return {
          id: s.id,
          full_name: s.full_name,
          class_id: s.class_id,
          class_name: className,
          student_id: s.student_id || undefined,
          no_on_roll: s.no_on_roll || undefined,
        };
      });
    },
  });
};

/**
 * Get students who already have results in a session
 */
export const useStudentsWithMockResults = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["students-with-mock-results", sessionId],
    enabled: !!sessionId,
    retry: false, // Don't retry on errors
    queryFn: async (): Promise<Set<string>> => {
      if (!sessionId) return new Set();

      const { data, error } = await supabase
        .from("mock_exam_results")
        .select("student_id")
        .eq("session_id", sessionId);

      if (error) throw error;

      return new Set((data || []).map((r) => r.student_id));
    },
  });
};
