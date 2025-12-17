import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ParsedStudentData } from '@/hooks/useExcelParser';

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

        // Get existing classes and departments for name-to-ID mapping
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name');

        const { data: departments } = await supabase
          .from('departments')
          .select('id, name');

        const classMap = new Map(classes?.map(c => [c.name.toLowerCase(), c.id]) || []);
        const departmentMap = new Map(departments?.map(d => [d.name.toLowerCase(), d.id]) || []);

        // Phase 2: Check for duplicates
        updateProgress({
          current: 0,
          total: students.length,
          phase: 'checking-duplicates',
          message: 'Checking for existing students...'
        });

        const studentIds = students.map(s => s.student_id).filter(Boolean);
        const { data: existingStudents } = await supabase
          .from('students')
          .select('student_id')
          .in('student_id', studentIds);

        const existingStudentIds = new Set(existingStudents?.map(s => s.student_id) || []);

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

            // Skip duplicates
            if (existingStudentIds.has(student.student_id)) {
              result.duplicateCount++;
              result.errors.push({
                row: processedCount,
                studentId: student.student_id,
                error: `Student ID "${student.student_id}" already exists`
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

            // Validate required fields
            if (!student.student_id?.trim()) {
              result.failedCount++;
              result.errors.push({
                row: processedCount,
                studentId: student.student_id || 'N/A',
                error: 'Student ID is required'
              });
              continue;
            }

            if (!student.full_name?.trim()) {
              result.failedCount++;
              result.errors.push({
                row: processedCount,
                studentId: student.student_id,
                error: 'Full name is required'
              });
              continue;
            }

            // Prepare student data for insertion - matching seed.js format
            const studentRecord: Record<string, any> = {
              student_id: student.student_id.trim(),
              full_name: student.full_name.trim(),
              gender: normalizeGender(student.gender) || 'male',
              academic_year: student.academic_year?.trim() || '2024/2025',
              has_left: false
            };

            // Only add optional fields if they have values
            if (student.date_of_birth) {
              studentRecord.date_of_birth = student.date_of_birth;
            }
            if (resolvedClassId) {
              studentRecord.class_id = resolvedClassId;
            }
            if (resolvedDepartmentId) {
              studentRecord.department_id = resolvedDepartmentId;
            }
            if (student.email?.trim()) {
              studentRecord.email = student.email.trim();
            }
            if (student.guardian_name?.trim()) {
              studentRecord.guardian_name = student.guardian_name.trim();
            }
            if (student.guardian_phone?.trim()) {
              studentRecord.guardian_phone = student.guardian_phone.trim();
            }
            if (student.guardian_email?.trim()) {
              studentRecord.guardian_email = student.guardian_email.trim();
            }
            if (student.address?.trim()) {
              studentRecord.address = student.address.trim();
            }

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
              console.error('Supabase insert error:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code,
                fullError: JSON.stringify(insertError, null, 2)
              });
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
        toast({
          title: 'Import Failed',
          description: `Failed to import students. ${result.errors.length} errors occurred.`,
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
