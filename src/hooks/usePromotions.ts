import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Ghana Education Service class progression order
export const CLASS_PROGRESSION_ORDER = [
  "KG1",
  "KG2",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "JHS 1",
  "JHS 2",
  "JHS 3",
  "SHS 1",
  "SHS 2",
  "SHS 3",
  "Graduation" // Special case - student has completed school
] as const;

export type ClassName = typeof CLASS_PROGRESSION_ORDER[number];

export interface ClassMapping {
  id: string;
  name: string;
  department_id?: string;
  normalizedName: string;
  progressionIndex: number;
}

export interface StudentForPromotion {
  id: string;
  student_id: string;
  full_name: string;
  class_id: string;
  class_name: string;
  department_id?: string;
  department_name?: string;
}

export interface PromotionResult {
  studentId: string;
  studentName: string;
  fromClass: string;
  toClass: string | null;
  status: 'promoted' | 'graduated' | 'error' | 'skipped';
  message?: string;
}

export interface BulkPromotionData {
  fromClassId: string;
  toClassId: string | null; // null means graduation
  studentIds: string[];
  academicYear: string;
  reason: string;
  autoComplete?: boolean; // If true, directly complete the transfer without pending status
}

/**
 * Normalize class name for comparison
 * Handles variations like "Class 1", "CLASS 1", "class1", etc.
 */
export function normalizeClassName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get the progression index for a class name
 * Returns -1 if not found in the standard progression
 */
export function getProgressionIndex(className: string): number {
  const normalized = normalizeClassName(className);

  for (let i = 0; i < CLASS_PROGRESSION_ORDER.length; i++) {
    if (normalizeClassName(CLASS_PROGRESSION_ORDER[i]) === normalized) {
      return i;
    }
  }

  // Try partial matching for common variations
  const lowerName = normalized;

  if (lowerName.includes('kg1') || lowerName.includes('kg 1') || lowerName === 'kindergarten 1') return 0;
  if (lowerName.includes('kg2') || lowerName.includes('kg 2') || lowerName === 'kindergarten 2') return 1;
  if ((lowerName.includes('class 1') || lowerName === 'primary 1' || lowerName === 'p1') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 2;
  if ((lowerName.includes('class 2') || lowerName === 'primary 2' || lowerName === 'p2') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 3;
  if ((lowerName.includes('class 3') || lowerName === 'primary 3' || lowerName === 'p3') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 4;
  if ((lowerName.includes('class 4') || lowerName === 'primary 4' || lowerName === 'p4') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 5;
  if ((lowerName.includes('class 5') || lowerName === 'primary 5' || lowerName === 'p5') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 6;
  if ((lowerName.includes('class 6') || lowerName === 'primary 6' || lowerName === 'p6') && !lowerName.includes('jhs') && !lowerName.includes('shs')) return 7;
  if (lowerName.includes('jhs 1') || lowerName.includes('jhs1') || lowerName === 'junior high 1') return 8;
  if (lowerName.includes('jhs 2') || lowerName.includes('jhs2') || lowerName === 'junior high 2') return 9;
  if (lowerName.includes('jhs 3') || lowerName.includes('jhs3') || lowerName === 'junior high 3') return 10;
  if (lowerName.includes('shs 1') || lowerName.includes('shs1') || lowerName === 'senior high 1') return 11;
  if (lowerName.includes('shs 2') || lowerName.includes('shs2') || lowerName === 'senior high 2') return 12;
  if (lowerName.includes('shs 3') || lowerName.includes('shs3') || lowerName === 'senior high 3') return 13;
  if (lowerName.includes('graduat')) return 14;

  return -1; // Not in standard progression
}

/**
 * Get the next class in progression
 * Returns null if already at graduation or not in standard progression
 */
export function getNextClass(currentClassName: string): ClassName | null {
  const currentIndex = getProgressionIndex(currentClassName);

  if (currentIndex === -1) {
    return null; // Not in standard progression
  }

  if (currentIndex >= CLASS_PROGRESSION_ORDER.length - 1) {
    return null; // Already at graduation or beyond
  }

  return CLASS_PROGRESSION_ORDER[currentIndex + 1];
}

/**
 * Check if a student should graduate (completed final class)
 */
export function shouldGraduate(currentClassName: string): boolean {
  const currentIndex = getProgressionIndex(currentClassName);
  // SHS 3 is index 13, Graduation is index 14
  return currentIndex === 13;
}

/**
 * Map database classes to progression order
 */
export function mapClassesToProgression(classes: { id: string; name: string; department_id?: string }[]): ClassMapping[] {
  return classes.map(cls => ({
    id: cls.id,
    name: cls.name,
    department_id: cls.department_id,
    normalizedName: normalizeClassName(cls.name),
    progressionIndex: getProgressionIndex(cls.name)
  })).sort((a, b) => a.progressionIndex - b.progressionIndex);
}

/**
 * Find the next class in the database based on progression
 */
export function findNextClassInDatabase(
  currentClassName: string,
  allClasses: ClassMapping[],
  preferredDepartmentId?: string
): ClassMapping | null {
  const nextClassName = getNextClass(currentClassName);

  if (!nextClassName) {
    return null; // Graduation or not in progression
  }

  if (nextClassName === "Graduation") {
    return null; // Special case - will be handled separately
  }

  const normalizedNext = normalizeClassName(nextClassName);

  // First try to find a class in the same department
  if (preferredDepartmentId) {
    const sameDeptClass = allClasses.find(
      cls => cls.normalizedName === normalizedNext && cls.department_id === preferredDepartmentId
    );
    if (sameDeptClass) return sameDeptClass;
  }

  // Fall back to any class with the right name
  return allClasses.find(cls => cls.normalizedName === normalizedNext) || null;
}

/**
 * Hook for bulk student promotions
 */
export const useBulkPromotion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BulkPromotionData): Promise<PromotionResult[]> => {
      const results: PromotionResult[] = [];
      const { fromClassId, toClassId, studentIds, academicYear, reason, autoComplete = true } = data;

      // Fetch from class details
      const { data: fromClass, error: fromClassError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('id', fromClassId)
        .single();

      if (fromClassError || !fromClass) {
        throw new Error('Could not find the source class');
      }

      // Fetch to class details (if not graduation)
      let toClass: { id: string; name: string } | null = null;
      if (toClassId) {
        const { data: toClassData, error: toClassError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('id', toClassId)
          .single();

        if (toClassError || !toClassData) {
          throw new Error('Could not find the destination class');
        }
        toClass = toClassData;
      }

      const isGraduation = !toClassId;

      // Process each student
      for (const studentId of studentIds) {
        try {
          // Fetch student details
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id, student_id, full_name, class_id')
            .eq('id', studentId)
            .single();

          if (studentError || !student) {
            results.push({
              studentId,
              studentName: 'Unknown',
              fromClass: fromClass.name,
              toClass: toClass?.name || 'Graduation',
              status: 'error',
              message: 'Student not found'
            });
            continue;
          }

          // Verify student is in the from class
          if (student.class_id !== fromClassId) {
            results.push({
              studentId: student.student_id,
              studentName: student.full_name,
              fromClass: fromClass.name,
              toClass: toClass?.name || 'Graduation',
              status: 'skipped',
              message: 'Student is not in the source class'
            });
            continue;
          }

          if (isGraduation) {
            // Handle graduation - mark student as has_left
            const { error: updateError } = await supabase
              .from('students')
              .update({
                has_left: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', studentId);

            if (updateError) {
              results.push({
                studentId: student.student_id,
                studentName: student.full_name,
                fromClass: fromClass.name,
                toClass: 'Graduation',
                status: 'error',
                message: updateError.message
              });
              continue;
            }

            // Create transfer record for graduation
            await supabase
              .from('transfers')
              .insert({
                student_id: studentId,
                from_class_id: fromClassId,
                to_class_id: null,
                reason: reason || 'Graduation - Completed final class',
                status: 'completed',
                academic_year: academicYear,
                request_date: new Date().toISOString().split('T')[0],
                completed_date: new Date().toISOString().split('T')[0],
                notes: 'Bulk graduation'
              });

            results.push({
              studentId: student.student_id,
              studentName: student.full_name,
              fromClass: fromClass.name,
              toClass: 'Graduation',
              status: 'graduated',
              message: 'Successfully graduated'
            });
          } else {
            // Handle regular promotion
            const transferStatus = autoComplete ? 'completed' : 'pending';
            const completedDate = autoComplete ? new Date().toISOString().split('T')[0] : null;

            // Create transfer record
            const { error: transferError } = await supabase
              .from('transfers')
              .insert({
                student_id: studentId,
                from_class_id: fromClassId,
                to_class_id: toClassId,
                reason: reason || 'Annual promotion',
                status: transferStatus,
                academic_year: academicYear,
                request_date: new Date().toISOString().split('T')[0],
                completed_date: completedDate,
                notes: 'Bulk promotion'
              });

            if (transferError) {
              results.push({
                studentId: student.student_id,
                studentName: student.full_name,
                fromClass: fromClass.name,
                toClass: toClass!.name,
                status: 'error',
                message: transferError.message
              });
              continue;
            }

            // If auto-complete, update student's class
            if (autoComplete) {
              const { error: updateError } = await supabase
                .from('students')
                .update({
                  class_id: toClassId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', studentId);

              if (updateError) {
                results.push({
                  studentId: student.student_id,
                  studentName: student.full_name,
                  fromClass: fromClass.name,
                  toClass: toClass!.name,
                  status: 'error',
                  message: updateError.message
                });
                continue;
              }
            }

            results.push({
              studentId: student.student_id,
              studentName: student.full_name,
              fromClass: fromClass.name,
              toClass: toClass!.name,
              status: 'promoted',
              message: autoComplete ? 'Successfully promoted' : 'Promotion pending approval'
            });
          }
        } catch (error) {
          results.push({
            studentId,
            studentName: 'Unknown',
            fromClass: fromClass.name,
            toClass: toClass?.name || 'Graduation',
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });

      const promoted = results.filter(r => r.status === 'promoted').length;
      const graduated = results.filter(r => r.status === 'graduated').length;
      const errors = results.filter(r => r.status === 'error').length;
      const skipped = results.filter(r => r.status === 'skipped').length;

      let description = '';
      if (promoted > 0) description += `${promoted} promoted. `;
      if (graduated > 0) description += `${graduated} graduated. `;
      if (skipped > 0) description += `${skipped} skipped. `;
      if (errors > 0) description += `${errors} failed.`;

      toast({
        title: "Bulk Promotion Complete",
        description: description.trim(),
        variant: errors > 0 && (promoted + graduated === 0) ? "destructive" : "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Promotion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

/**
 * Get promotion suggestions for a class
 */
export function getPromotionSuggestion(
  fromClassName: string,
  allClasses: ClassMapping[],
  departmentId?: string
): {
  nextClass: ClassMapping | null;
  isGraduation: boolean;
  message: string;
} {
  if (shouldGraduate(fromClassName)) {
    return {
      nextClass: null,
      isGraduation: true,
      message: `Students in ${fromClassName} will graduate`
    };
  }

  const nextClass = findNextClassInDatabase(fromClassName, allClasses, departmentId);

  if (nextClass) {
    return {
      nextClass,
      isGraduation: false,
      message: `Students will be promoted to ${nextClass.name}`
    };
  }

  const expectedNext = getNextClass(fromClassName);
  if (expectedNext) {
    return {
      nextClass: null,
      isGraduation: false,
      message: `Warning: Next class "${expectedNext}" not found in the system. Please create it first.`
    };
  }

  return {
    nextClass: null,
    isGraduation: false,
    message: `Class "${fromClassName}" is not in the standard progression`
  };
}
