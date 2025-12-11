
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

    try {
      const resultData = { /* ... result data mapping ... */ };

      if (isEditMode && resultId) {
        await updateResult.mutateAsync({ id: resultId, data: resultData });
        const marksToUpdate = Object.entries(subjectMarks)
          .filter(([, mark]) => mark.ca1_score || mark.ca2_score || mark.exam_score)
          .map(([subjectId, mark]) => ({ /* ... mapping ... */ }));
        await updateSubjectMarks.mutateAsync({ resultId, marks: marksToUpdate });
      } else {
        const result = await createResult.mutateAsync(resultData);
        const marksToCreate = Object.entries(subjectMarks)
          .filter(([, mark]) => mark.ca1_score || mark.ca2_score || mark.exam_score)
          .map(([subjectId, mark]) => ({ result_id: result.id, subject_id: subjectId, ...mark }));
        if (marksToCreate.length > 0) {
          await createSubjectMarks.mutateAsync(marksToCreate);
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
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEditMode ? 'Updating...' : 'Saving...'}</>
        ) : (
          <><Save className="w-4 h-4 mr-2" />{isEditMode ? 'Update Result' : 'Save Result'}</>
        )}
      </Button>
    </div>
  );
};

export default AddResultsActions;
