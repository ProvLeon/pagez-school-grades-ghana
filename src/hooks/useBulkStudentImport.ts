import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ParsedStudentData } from '@/hooks/useExcelParser';
import { isValidDate } from '@/utils/dateUtils';
import { getUserOrganizationId } from '@/utils/organizationHelper';

// Helper function to generate student ID
const generateStudentId = (schoolName: string = "School", index: number): string => {
  const prefix = schoolName.substring(0, 2).toUpperCase() || "SC";
  const year = new Date().getFullYear().toString().slice(-2);
  // Use a mix of timestamp and random to ensure uniqueness better than just trailing timestamp
  // Base 36 timestamp (last 4 chars) + random 3 digits + index suffix
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const indexStr = String(index).padStart(2, '0');
  return `${prefix}${year}${timestamp}${random}${indexStr}`;
};

export interface BulkImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  duplicateCount: number;
  errors: { row: number; studentId: string; error: string }[];
  createdStudents: string[];
}

export interface BulkImportProgress {
  current: number;
  total: number;
  phase: 'validating' | 'checking-duplicates' | 'importing' | 'complete';
  message: string;
}

export const useBulkStudentImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [progress, setProgress] = useState<BulkImportProgress | null>(null);

  const importStudents = useMutation({
    mutationFn: async ({
      students,
      classId,
      departmentId,
      onProgress
    }: {
      students: ParsedStudentData[];
      classId?: string;
      departmentId?: string;
      onProgress?: (progress: BulkImportProgress) => void;
    }): Promise<BulkImportResult> => {
      // Get user's organization for data isolation
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        throw new Error('User not associated with any organization. Cannot import students.');
      }

      const result: BulkImportResult = {
        success: false,
        totalProcessed: students.length,
        successCount: 0,
        failedCount: 0,
        duplicateCount: 0,
        errors: [],
        createdStudents: []
      };

      const updateProgress = (update: BulkImportProgress) => {
        setProgress(update);
        onProgress?.(update);
      };

      try {
        // Phase 1: Validate data
        updateProgress({
          current: 0,
          total: students.length,
          phase: 'validating',
          message: 'Validating student data...'
        });

        // Get school settings for student ID generation
        const { data: schoolSettings } = await supabase
          .from('school_settings')
          .select('school_name')
          .single();

        const schoolName = schoolSettings?.school_name || "School";

        // Get existing classes and departments for name-to-ID mapping (filtered by org)
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name')
          .eq('organization_id', organizationId);

        const { data: departments } = await supabase
          .from('departments')
          .select('id, name')
          .eq('organization_id', organizationId);

        const classMap = new Map(classes?.map(c => [c.name.toLowerCase(), c.id]) || []);
        const departmentMap = new Map(departments?.map(d => [d.name.toLowerCase(), d.id]) || []);

        // Phase 2: Check for duplicates and generate IDs where needed
        updateProgress({
          current: 0,
          total: students.length,
          phase: 'checking-duplicates',
          message: 'Checking for existing students and generating IDs...'
        });

        // Get all existing student IDs to check for duplicates (filtered by org)
        // Fetched with higher limit to minimize false negatives on collision checks
        const { data: allExistingStudents } = await supabase
          .from('students')
          .select('student_id')
          .eq('organization_id', organizationId)
          .limit(5000);

        const dbStudentIds = new Set(allExistingStudents?.map(s => s.student_id) || []);
        const takenIds = new Set(dbStudentIds); // Will include new executions

        // Auto-generate student IDs for records that don't have one
        students.forEach((student, index) => {
          // If ID provided by user, check if it exists in DB
          if (student.student_id && student.student_id.trim()) {
            // We'll check for duplicates during batch processing against dbStudentIds
            // But valid to add to takenIds to avoid generating collisions with user-provided IDs
            takenIds.add(student.student_id.trim());
          } else {
            // Generate ID
            let newId = generateStudentId(schoolName, index);
            let attempts = 0;
            // Ensure uniqueness against DB and other new students
            while (takenIds.has(newId) && attempts < 20) {
              newId = generateStudentId(schoolName, index + Math.floor(Math.random() * 10000));
              attempts++;
            }
            student.student_id = newId;
            takenIds.add(newId);
          }
        });

        // Phase 3: Import students in batches
        updateProgress({
          current: 0,
          total: students.length,
          phase: 'importing',
          message: 'Importing students...'
        });

        const BATCH_SIZE = 50;
        const batches = [];

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          batches.push(students.slice(i, i + BATCH_SIZE));
        }

        let processedCount = 0;

        for (const batch of batches) {
          const studentsToInsert = [];

          for (const student of batch) {
            processedCount++;

            // Strict Duplicate Check: Only flag if it exists in the DATABASE.
            // (Use dbStudentIds, not takenIds which contains our just-generated IDs)
            if (student.student_id && dbStudentIds.has(student.student_id)) {
              result.duplicateCount++;
              result.errors.push({
                row: processedCount,
                studentId: student.student_id,
                error: `Student ID "${student.student_id}" already exists in the database`
              });
              continue;
            }

            // Resolve class_id
            let resolvedClassId = classId;
            if (!resolvedClassId && student.class_id) {
              // Check if it's a UUID or a name
              if (isUUID(student.class_id)) {
                resolvedClassId = student.class_id;
              } else {
                resolvedClassId = classMap.get(student.class_id.toLowerCase()) || undefined;
              }
            }

            // Resolve department_id
            let resolvedDepartmentId = departmentId;
            if (!resolvedDepartmentId && student.department_id) {
              if (isUUID(student.department_id)) {
                resolvedDepartmentId = student.department_id;
              } else {
                resolvedDepartmentId = departmentMap.get(student.department_id.toLowerCase()) || undefined;
              }
            }

            // Validate required fields (student_id should be auto-generated by now)
            if (!student.full_name?.trim()) {
              result.failedCount++;
              result.errors.push({
                row: processedCount,
                studentId: student.student_id,
                error: 'Full name is required'
              });
              continue;
            }

            // Prepare student data for insertion
            const studentRecord: Record<string, any> = {
              student_id: student.student_id.trim(),
              full_name: student.full_name.trim(),
              gender: normalizeGender(student.gender) || 'male',
              academic_year: student.academic_year?.trim() || '2025/2026', // Default to current academic year
              has_left: false,
              organization_id: organizationId
            };

            // Only add optional fields if they have values and are valid
            if (student.date_of_birth && student.date_of_birth.trim()) {
              if (isValidDate(student.date_of_birth)) {
                studentRecord.date_of_birth = student.date_of_birth;
              } else {
                console.warn(`Invalid date for student ${student.student_id}: ${student.date_of_birth}`);
              }
            }
            if (resolvedClassId) { studentRecord.class_id = resolvedClassId; }
            if (resolvedDepartmentId) { studentRecord.department_id = resolvedDepartmentId; }
            if (student.email?.trim()) { studentRecord.email = student.email.trim(); }
            if (student.guardian_name?.trim()) { studentRecord.guardian_name = student.guardian_name.trim(); }
            if (student.guardian_phone?.trim()) { studentRecord.guardian_phone = student.guardian_phone.trim(); }
            if (student.guardian_email?.trim()) { studentRecord.guardian_email = student.guardian_email.trim(); }
            if (student.address?.trim()) { studentRecord.address = student.address.trim(); }

            studentsToInsert.push(studentRecord);
          }

          // Insert batch
          if (studentsToInsert.length > 0) {
            console.log('Attempting to insert students:', JSON.stringify(studentsToInsert, null, 2));

            const { data: insertedData, error: insertError } = await supabase
              .from('students')
              .insert(studentsToInsert)
              .select('id, student_id');

            if (insertError) {
              console.error('Supabase insert error details:', insertError);

              // Handle batch error - mark all as failed
              studentsToInsert.forEach(s => {
                result.failedCount++;
                result.errors.push({
                  row: processedCount,
                  studentId: s.student_id,
                  error: `${insertError.message}${insertError.details ? ` - ${insertError.details}` : ''}${insertError.hint ? ` (Hint: ${insertError.hint})` : ''}`
                });
              });
            } else {
              result.successCount += insertedData?.length || 0;
              result.createdStudents.push(...(insertedData?.map(s => s.student_id) || []));
            }
          }

          updateProgress({
            current: processedCount,
            total: students.length,
            phase: 'importing',
            message: `Imported ${processedCount} of ${students.length} students...`
          });
        }

        // Phase 4: Complete
        updateProgress({
          current: students.length,
          total: students.length,
          phase: 'complete',
          message: 'Import complete!'
        });

        result.success = result.failedCount === 0 && result.successCount > 0;
        return result;

      } catch (error) {
        console.error('Import execution error:', error);
        result.success = false;
        result.errors.push({
          row: 0,
          studentId: 'N/A',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        return result;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });

      if (result.success) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.successCount} students.`
        });
      } else if (result.successCount > 0) {
        toast({
          title: 'Import Completed with Issues',
          description: `Imported ${result.successCount} students. ${result.failedCount} failed, ${result.duplicateCount} duplicates.`,
          variant: 'default'
        });
      } else {
        // Display the first specific error message to help the user debugging
        const firstError = result.errors[0]?.error || 'Unknown error';
        toast({
          title: 'Import Failed',
          description: `Failed to import students. ${result.errors.length} errors occurred. First error: ${firstError}`,
          variant: 'destructive'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Import Error',
        description: error.message || 'An unexpected error occurred during import.',
        variant: 'destructive'
      });
    }
  });

  const resetProgress = () => {
    setProgress(null);
  };

  return {
    importStudents,
    progress,
    resetProgress,
    isImporting: importStudents.isPending
  };
};

// Helper functions
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function normalizeGender(gender?: string): 'male' | 'female' | null {
  if (!gender) return null;
  const normalized = gender.toLowerCase().trim();
  if (normalized === 'male' || normalized === 'm') return 'male';
  if (normalized === 'female' || normalized === 'f') return 'female';
  return null;
}
