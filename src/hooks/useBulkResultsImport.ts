import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ParsedResultData } from '@/hooks/useResultsExcelParser';
import { getUserOrganizationId } from '@/utils/organizationHelper';

interface GradingScale {
  id: string;
  grade: string;
  from_percentage: number;
  to_percentage: number;
  remark: string;
}

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
      // Get organization context
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        throw new Error('User is not associated with any organization');
      }

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
          .eq('organization_id', organizationId)
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
          .select('id, name, code')
          .eq('organization_id', organizationId);

        if (subjectsError) {
          throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
        }

        // Create multiple mappings for flexible matching
        const subjectByName = new Map(subjects?.map(s => [s.name.toLowerCase().trim(), s.id]) || []);
        const subjectByCode = new Map(subjects?.map(s => [s.code?.toLowerCase().trim(), s.id]) || []);

        // Fetch grading scales for automatic remark generation
        const { data: gradingScales, error: gradingScalesError } = await supabase
          .from('grading_scales')
          .select('id, grade, from_percentage, to_percentage, remark')
          .eq('organization_id', organizationId)
          .order('from_percentage', { ascending: false });

        if (gradingScalesError) {
          console.warn('Failed to fetch grading scales:', gradingScalesError.message);
        }

        // Fetch all CA types for this organization to support name-to-ID mapping
        const { data: allCATypes, error: caTypesError } = await supabase
          .from('ca_types')
          .select('id, name, configuration');

        if (caTypesError) {
          console.warn('Failed to fetch CA types:', caTypesError.message);
        }

        // Create a mapping from CA type name to ID for flexible lookup
        const caTypeByName = new Map((allCATypes || []).map(ca => [ca.name.toLowerCase().trim(), ca.id]));

        // Helper function to find CA type with partial matching
        const findCATypeByName = (name: string): string | undefined => {
          const trimmedLowerName = name.toLowerCase().trim();

          // First try exact match
          if (caTypeByName.has(trimmedLowerName)) {
            return caTypeByName.get(trimmedLowerName);
          }

          // Try partial match (e.g., "SBA 50/50" matches "50/50")
          const availableTypes = allCATypes || [];
          for (const caType of availableTypes) {
            const caTypeLower = caType.name.toLowerCase();
            // Check if the input contains the CA type name or vice versa
            if (caTypeLower.includes(trimmedLowerName) || trimmedLowerName.includes(caTypeLower)) {
              return caType.id;
            }
            // Check if any part matches (e.g., "50/50" from "SBA 50/50")
            const parts = caType.name.split(/[\s\-/]+/).filter(p => p);
            if (parts.some(part => trimmedLowerName.includes(part.toLowerCase()) || part.toLowerCase().includes(trimmedLowerName))) {
              return caType.id;
            }
          }

          return undefined;
        };

        // Helper function to get available CA types for error messages
        const getAvailableCATypes = (): string => {
          const types = (allCATypes || []).map(ca => `"${ca.name}"`).join(', ');
          return types || 'None configured';
        };

        // Get CA type configuration if provided
        let caConfiguration: Record<string, number> | null = null;
        const resolvedCATypeId = caTypeId;

        // If caTypeId not provided, results may have ca_type_name from template parser
        // We'll handle name-to-ID resolution per row below

        if (resolvedCATypeId) {
          const { data: caType } = await supabase
            .from('ca_types')
            .select('configuration')
            .eq('id', resolvedCATypeId)
            .single();
          caConfiguration = caType?.configuration as Record<string, number> | null;
        }

        // Helper function to get remark based on score
        const getRemarkForScore = (score: number): string => {
          if (!gradingScales || gradingScales.length === 0) {
            // Default remarks if no grading scales available
            if (score >= 80) return 'Excellent';
            if (score >= 70) return 'Very Good';
            if (score >= 60) return 'Good';
            if (score >= 50) return 'Credit';
            if (score >= 40) return 'Pass';
            return 'Fail';
          }

          for (const scale of gradingScales) {
            if (score >= scale.from_percentage && score <= scale.to_percentage) {
              return scale.remark || 'N/A';
            }
          }
          return 'N/A';
        };

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

            // Resolve CA type ID - first from explicit caTypeId, then from ca_type_name in data
            let rowCATypeId = resolvedCATypeId;
            if (!rowCATypeId && resultData.ca_type_name) {
              // Look up CA type ID by name from the template data using flexible matching
              const lookedUpCATypeId = findCATypeByName(resultData.ca_type_name);
              if (lookedUpCATypeId) {
                rowCATypeId = lookedUpCATypeId;
              } else {
                result.failedCount++;
                const availableTypes = getAvailableCATypes();
                result.errors.push({
                  row: processedCount,
                  studentId: resultData.student_id,
                  error: `CA Type "${resultData.ca_type_name}" not found. Available types: ${availableTypes}. Please use one of the configured assessment types.`
                });
                continue;
              }
            }

            // Validate that we have a CA type ID before proceeding
            if (!rowCATypeId) {
              result.failedCount++;
              const availableTypes = getAvailableCATypes();
              result.errors.push({
                row: processedCount,
                studentId: resultData.student_id,
                error: `Assessment Type (CA Type) is required. Please select an assessment type when importing or specify it in the Excel file. Available types: ${availableTypes}`
              });
              continue;
            }

            // Get CA configuration for this row (use prop-level config, or look up from allCATypes)
            let rowCAConfig = caConfiguration;
            if (!rowCAConfig && rowCATypeId && allCATypes) {
              const caTypeObj = allCATypes.find(ca => ca.id === rowCATypeId);
              if (caTypeObj?.configuration) {
                rowCAConfig = caTypeObj.configuration as Record<string, number>;
              }
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
              .eq('organization_id', organizationId)
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
                  ca_type_id: rowCATypeId || null,
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
                  organization_id: organizationId,
                  term: resultData.term,
                  academic_year: resultData.academic_year,
                  ca_type_id: rowCATypeId || null,
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

              // Calculate total score based on CA configuration (per-row)
              let totalScore = 0;
              if (rowCAConfig) {
                const examWeight = rowCAConfig.exam || 0;

                if (rowCAConfig.ca) {
                  // Simple CA/Exam split (e.g., 50/50)
                  // Use the actual CA score provided, do not convert/scale
                  const caScore = subjectData.ca1_score || 0;
                  const examScore = subjectData.exam_score || 0;
                  totalScore = Math.round(caScore + (examScore * examWeight / 100));
                } else {
                  // Multiple CAs
                  // Use the actual CAi score provided, do not convert/scale
                  const ca1 = subjectData.ca1_score || 0;
                  const ca2 = subjectData.ca2_score || 0;
                  const ca3 = subjectData.ca3_score || 0;
                  const ca4 = subjectData.ca4_score || 0;
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
              const grade = calculateGrade(totalScore, gradingScales || undefined);

              // Get automatic remark based on total score
              const autoRemark = getRemarkForScore(totalScore);

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
                grade: grade,
                subject_teacher_remarks: autoRemark
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
        // Build a more descriptive error message showing the first few errors
        const errorDetails = result.errors.slice(0, 3).map(e =>
          `Row ${e.row}: ${e.error}`
        ).join('; ');
        const moreErrors = result.errors.length > 3 ? ` (+${result.errors.length - 3} more)` : '';

        toast({
          title: 'Import Failed',
          description: errorDetails + moreErrors,
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
// Uses organization's grading scales if available, falls back to single-letter grades
// matching the format used by display/PDF components
function calculateGrade(score: number, gradingScales?: any[]): string {
  if (gradingScales && gradingScales.length > 0) {
    for (const scale of gradingScales) {
      if (score >= scale.from_percentage && score <= scale.to_percentage) {
        return scale.grade;
      }
    }
  }
  // Single-letter fallback matching SubjectsTableSection, reportCardService, exportService
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}
