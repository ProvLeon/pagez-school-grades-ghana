import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCreateResult, useUpdateResult } from "@/hooks/useResults";
import { useBulkCreateSubjectMarks, useBulkUpdateSubjectMarks } from "@/hooks/useSubjectMarks";
import { useAddResultsForm } from "@/contexts/AddResultsFormContext";
import { Save, Loader2 } from "lucide-react";

interface AddResultsActionsProps {
  isEditMode?: boolean;
  resultId?: string;
}

const AddResultsActions = ({ isEditMode = false, resultId }: AddResultsActionsProps) => {
  const navigate = useNavigate();
  const { formData, subjectMarks, isFormValid, existingResultError } = useAddResultsForm();
  const createResult = useCreateResult();
  const updateResult = useUpdateResult();
  const createSubjectMarks = useBulkCreateSubjectMarks();
  const updateSubjectMarks = useBulkUpdateSubjectMarks();

  const isLoading = createResult.isPending || createSubjectMarks.isPending || updateResult.isPending || updateSubjectMarks.isPending;

  const handleSubmit = async () => {
    if (existingResultError && !isEditMode) return;

    // Validate required fields before submission
    if (!formData.student_id || !formData.class_id || !formData.term || !formData.academic_year) {
      console.error('Missing required fields:', {
        student_id: formData.student_id,
        class_id: formData.class_id,
        term: formData.term,
        academic_year: formData.academic_year
      });
      return;
    }

    // Helper function to safely parse numeric values (preserves 0 as valid)
    const parseScore = (value: any): number | null => {
      if (value === undefined || value === null || value === '') return null;
      const parsed = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    try {
      // Map form data to result data for database
      const resultData = {
        student_id: formData.student_id,
        class_id: formData.class_id,
        term: formData.term,
        academic_year: formData.academic_year,
        ca_type_id: formData.ca_type_id || null,
        teacher_id: formData.teacher_id || null,
        days_school_opened: formData.days_school_opened ? parseInt(formData.days_school_opened, 10) : null,
        days_present: formData.days_present ? parseInt(formData.days_present, 10) : null,
        days_absent: formData.days_absent ? parseInt(formData.days_absent, 10) : null,
        term_begin: formData.term_begin || null,
        term_ends: formData.term_ends || null,
        next_term_begin: formData.next_term_begin || null,
        teachers_comment: formData.teachers_comment || null,
        conduct: formData.conduct || null,
        attitude: formData.attitude || null,
        interest: formData.interest || null,
        heads_remarks: formData.heads_remarks || null,
        teacher_approved: formData.teacher_approved || false,
        admin_approved: formData.admin_approved || false,
      };

      console.log('Submitting result data:', resultData);
      console.log('Subject marks state before processing:', subjectMarks);
      console.log('Subject marks entries:', Object.entries(subjectMarks));

      if (isEditMode && resultId) {
        // Update existing result
        await updateResult.mutateAsync({ id: resultId, data: resultData });

        // Update subject marks
        const allMarksBeforeFilter = Object.entries(subjectMarks);
        console.log('All marks before filter (edit mode):', allMarksBeforeFilter);

        const marksToUpdate = Object.entries(subjectMarks)
          .filter(([subjectId, mark]) => {
            const hasScores = mark.ca1_score !== undefined || mark.ca2_score !== undefined || mark.exam_score !== undefined;
            console.log(`Subject ${subjectId}: ca1=${mark.ca1_score}, ca2=${mark.ca2_score}, exam=${mark.exam_score}, passes filter: ${hasScores}`);
            return hasScores;
          })
          .map(([subjectId, mark]) => ({
            subject_id: subjectId,
            ca1_score: parseScore(mark.ca1_score),
            ca2_score: parseScore(mark.ca2_score),
            ca3_score: parseScore(mark.ca3_score),
            ca4_score: parseScore(mark.ca4_score),
            exam_score: parseScore(mark.exam_score),
            total_score: parseScore(mark.total_score),
            grade: mark.grade || null,
            position: mark.position !== undefined && mark.position !== null ? parseInt(mark.position, 10) : null,
          }));

        console.log('Marks to update (after filter and map):', marksToUpdate);

        if (marksToUpdate.length > 0) {
          console.log('Calling updateSubjectMarks with:', { resultId, marks: marksToUpdate });
          await updateSubjectMarks.mutateAsync({ resultId, marks: marksToUpdate });
        } else {
          console.warn('No marks to update - marksToUpdate array is empty!');
        }
      } else {
        // Create new result
        const result = await createResult.mutateAsync(resultData);

        // Create subject marks
        const allMarksBeforeFilterCreate = Object.entries(subjectMarks);
        console.log('All marks before filter (create mode):', allMarksBeforeFilterCreate);

        const marksToCreate = Object.entries(subjectMarks)
          .filter(([subjectId, mark]) => {
            const hasScores = mark.ca1_score !== undefined || mark.ca2_score !== undefined || mark.exam_score !== undefined;
            console.log(`Subject ${subjectId}: ca1=${mark.ca1_score}, ca2=${mark.ca2_score}, exam=${mark.exam_score}, passes filter: ${hasScores}`);
            return hasScores;
          })
          .map(([subjectId, mark]) => ({
            result_id: result.id,
            subject_id: subjectId,
            ca1_score: parseScore(mark.ca1_score),
            ca2_score: parseScore(mark.ca2_score),
            ca3_score: parseScore(mark.ca3_score),
            ca4_score: parseScore(mark.ca4_score),
            exam_score: parseScore(mark.exam_score),
            total_score: parseScore(mark.total_score),
            grade: mark.grade || null,
            position: mark.position !== undefined && mark.position !== null ? parseInt(mark.position, 10) : null,
          }));

        console.log('Marks to create (after filter and map):', marksToCreate);

        if (marksToCreate.length > 0) {
          console.log('Calling createSubjectMarks with:', marksToCreate);
          await createSubjectMarks.mutateAsync(marksToCreate);
        } else {
          console.warn('No marks to create - marksToCreate array is empty!');
        }
      }

      navigate('/results/manage-results');
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  return (
    <div className="flex justify-end gap-4 pt-6 border-t">
      <Button
        variant="outline"
        onClick={() => navigate('/results/manage-results')}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={!isFormValid() || isLoading || (!!existingResultError && !isEditMode)}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {isEditMode ? 'Updating...' : 'Saving...'}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Update Result' : 'Save Result'}
          </>
        )}
      </Button>
    </div>
  );
};

export default AddResultsActions;
