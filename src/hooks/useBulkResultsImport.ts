import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ParsedResultData } from '@/hooks/useResultsExcelParser';

export interface BulkResultsImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: { row: number; studentId: string; error: string }[];
  createdResults: string[];
}

export interface BulkResultsImportProgress {
  current: number;
  total: number;
  phase: 'validating' | 'matching-students' | 'matching-subjects' | 'importing' | 'complete';
  message: string;
}

export const useBulkResultsImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [progress, setProgress] = useState<BulkResultsImportProgress | null>(null);

  const importResults = useMutation({
    mutationFn: async ({
      results,
      classId,
      caTypeId,
      onProgress
    }: {
      results: ParsedResultData[];
      classId?: string;
      caTypeId?: string;
      onProgress?: (progress: BulkResultsImportProgress) => void;
    }): Promise<BulkResultsImportResult> => {
      const result: BulkResultsImportResult = {
        success: false,
        totalProcessed: results.length,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [],
        createdResults: []
      };

      const updateProgress = (update: BulkResultsImportProgress) => {
        setProgress(update);
        onProgress?.(update);
      };

      try {
        // Phase 1: Validate data
        updateProgress({
          current: 0,
          total: results.length,
          phase: 'validating',
          message: 'Validating results data...'
        });

        // Phase 2: Get all students to match student_id
        updateProgress({
          current: 0,
          total: results.length,
          phase: 'matching-students',
          message: 'Matching students...'
        });

        const studentIds = results.map(r => r.student_id).filter(Boolean);
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, student_id, class_id')
          .in('student_id', studentIds);

        if (studentsError) {
          throw new Error(`Failed to fetch students: ${studentsError.message}`);
        }

        const studentMap = new Map(students?.map(s => [s.student_id, { id: s.id, class_id: s.class_id }]) || []);

        // Phase 3: Get all subjects to match subject names
        updateProgress({
          current: 0,
          total: results.length,
          phase: 'matching-subjects',
          message: 'Matching subjects...'
        });

        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name, code');

        if (subjectsError) {
          throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
        }

        // Create multiple mappings for flexible matching
        const subjectByName = new Map(subjects?.map(s => [s.name.toLowerCase().trim(), s.id]) || []);
        const subjectByCode = new Map(subjects?.map(s => [s.code?.toLowerCase().trim(), s.id]) || []);

        // Get CA type configuration if provided
        let caConfiguration: Record<string, number> | null = null;
        if (caTypeId) {
          const { data: caType } = await supabase
            .from('ca_types')
            .select('configuration')
            .eq('id', caTypeId)
            .single();
          caConfiguration = caType?.configuration as Record<string, number> | null;
        }

        // Phase 4: Import results
        updateProgress({
          current: 0,
          total: results.length,
          phase: 'importing',
          message: 'Importing results...'
        });

        let processedCount = 0;

        for (const resultData of results) {
          processedCount++;

          try {
            // Find student by student_id
            const studentInfo = studentMap.get(resultData.student_id);

            if (!studentInfo) {
              result.failedCount++;
              result.errors.push({
                row: processedCount,
                studentId: resultData.student_id,
                error: `Student with ID "${resultData.student_id}" not found in the system`
              });
              continue;
            }

            // Use student's class_id or provided classId
            const effectiveClassId = classId || studentInfo.class_id;

            if (!effectiveClassId) {
              result.failedCount++;
              result.errors.push({
                row: processedCount,
                studentId: resultData.student_id,
                error: 'No class ID available for this student'
              });
              continue;
            }

            // Check if result already exists for this student/term/year
            const { data: existingResult } = await supabase
              .from('results')
              .select('id')
              .eq('student_id', studentInfo.id)
              .eq('term', resultData.term)
              .eq('academic_year', resultData.academic_year)
              .maybeSingle();

            let resultId: string;

            if (existingResult) {
              // Update existing result
              const { data: updatedResult, error: updateError } = await supabase
                .from('results')
                .update({
                  class_id: effectiveClassId,
                  ca_type_id: caTypeId || null,
                  days_school_opened: resultData.days_school_opened || null,
                  days_present: resultData.days_present || null,
                  days_absent: resultData.days_absent || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingResult.id)
                .select('id')
                .single();

              if (updateError) {
                result.failedCount++;
                result.errors.push({
                  row: processedCount,
                  studentId: resultData.student_id,
                  error: `Failed to update result: ${updateError.message}`
                });
                continue;
              }

              resultId = updatedResult.id;
            } else {
              // Create new result
              const { data: newResult, error: createError } = await supabase
                .from('results')
                .insert({
                  student_id: studentInfo.id,
                  class_id: effectiveClassId,
                  term: resultData.term,
                  academic_year: resultData.academic_year,
                  ca_type_id: caTypeId || null,
                  days_school_opened: resultData.days_school_opened || null,
                  days_present: resultData.days_present || null,
                  days_absent: resultData.days_absent || null,
                  admin_approved: false,
                  teacher_approved: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

              if (createError) {
                result.failedCount++;
                result.errors.push({
                  row: processedCount,
                  studentId: resultData.student_id,
                  error: `Failed to create result: ${createError.message}`
                });
                continue;
              }

              resultId = newResult.id;
            }

            // Process subject marks
            for (const subjectData of resultData.subjects) {
              // Find subject ID
              let subjectId = subjectByName.get(subjectData.subject_name.toLowerCase().trim());
              if (!subjectId) {
                subjectId = subjectByCode.get(subjectData.subject_code.toLowerCase().trim());
              }

              if (!subjectId) {
                // Try partial matching
                for (const [name, id] of subjectByName) {
                  if (name.includes(subjectData.subject_name.toLowerCase().trim()) ||
                    subjectData.subject_name.toLowerCase().trim().includes(name)) {
                    subjectId = id;
                    break;
                  }
                }
              }

              if (!subjectId) {
                result.errors.push({
                  row: processedCount,
                  studentId: resultData.student_id,
                  error: `Subject "${subjectData.subject_name}" not found in the system`
                });
                continue;
              }

              // Calculate total score based on CA configuration
              let totalScore = 0;
              if (caConfiguration) {
                const ca1Weight = caConfiguration.ca1 || caConfiguration.ca || 0;
                const ca2Weight = caConfiguration.ca2 || 0;
                const ca3Weight = caConfiguration.ca3 || 0;
                const ca4Weight = caConfiguration.ca4 || 0;
                const examWeight = caConfiguration.exam || 0;

                if (caConfiguration.ca) {
                  // Simple CA/Exam split (e.g., 50/50)
                  const caScore = subjectData.ca1_score || 0;
                  const examScore = subjectData.exam_score || 0;
                  totalScore = Math.round((caScore * ca1Weight / 100) + (examScore * examWeight / 100));
                } else {
                  // Multiple CAs
                  const ca1 = (subjectData.ca1_score || 0) * (ca1Weight / 100);
                  const ca2 = (subjectData.ca2_score || 0) * (ca2Weight / 100);
                  const ca3 = (subjectData.ca3_score || 0) * (ca3Weight / 100);
                  const ca4 = (subjectData.ca4_score || 0) * (ca4Weight / 100);
                  const exam = (subjectData.exam_score || 0) * (examWeight / 100);
                  totalScore = Math.round(ca1 + ca2 + ca3 + ca4 + exam);
                }
              } else {
                // Default calculation if no CA configuration
                const ca1 = subjectData.ca1_score || 0;
                const ca2 = subjectData.ca2_score || 0;
                const ca3 = subjectData.ca3_score || 0;
                const ca4 = subjectData.ca4_score || 0;
                const exam = subjectData.exam_score || 0;
                totalScore = Math.round(ca1 + ca2 + ca3 + ca4 + exam);
              }

              // Calculate grade based on total score
              const grade = calculateGrade(totalScore);

              // Check if subject mark already exists
              const { data: existingMark } = await supabase
                .from('subject_marks')
                .select('id')
                .eq('result_id', resultId)
                .eq('subject_id', subjectId)
                .maybeSingle();

              const markData = {
                result_id: resultId,
                subject_id: subjectId,
                ca1_score: subjectData.ca1_score ?? null,
                ca2_score: subjectData.ca2_score ?? null,
                ca3_score: subjectData.ca3_score ?? null,
                ca4_score: subjectData.ca4_score ?? null,
                exam_score: subjectData.exam_score ?? null,
                total_score: totalScore,
                grade: grade
              };

              if (existingMark) {
                await supabase
                  .from('subject_marks')
                  .update(markData)
                  .eq('id', existingMark.id);
              } else {
                await supabase
                  .from('subject_marks')
                  .insert(markData);
              }
            }

            result.successCount++;
            result.createdResults.push(resultId);

          } catch (error) {
            result.failedCount++;
            result.errors.push({
              row: processedCount,
              studentId: resultData.student_id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }

          updateProgress({
            current: processedCount,
            total: results.length,
            phase: 'importing',
            message: `Processing ${processedCount} of ${results.length} results...`
          });
        }

        // Phase 5: Complete
        updateProgress({
          current: results.length,
          total: results.length,
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
      queryClient.invalidateQueries({ queryKey: ['results'] });

      if (result.success) {
        toast({
          title: 'Results Import Successful',
          description: `Successfully imported ${result.successCount} results.`
        });
      } else if (result.successCount > 0) {
        toast({
          title: 'Import Completed with Issues',
          description: `Imported ${result.successCount} results. ${result.failedCount} failed.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Import Failed',
          description: `Failed to import results. ${result.errors.length} errors occurred.`,
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
    importResults,
    progress,
    resetProgress,
    isImporting: importResults.isPending
  };
};

// Helper function to calculate grade based on score
function calculateGrade(score: number): string {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
}
