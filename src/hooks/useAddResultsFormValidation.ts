
import { FormData } from "@/hooks/useAddResultsFormData";

export const useAddResultsFormValidation = (
  formData: FormData,
  selectedSBAType: any,
  existingResultError: string | null,
  subjectMarks: Record<string, any>
) => {
  const isFormValid = () => {
    const hasBasicInfo = formData.class_id && 
                        formData.student_id && 
                        formData.term && 
                        selectedSBAType;
    
    const hasNoErrors = !existingResultError;
    
    const hasMarks = Object.values(subjectMarks).some(mark => 
      mark?.ca1_score || mark?.ca2_score || mark?.ca3_score || mark?.ca4_score || mark?.exam_score
    );
    
    return hasBasicInfo && hasNoErrors && hasMarks;
  };

  return { isFormValid };
};
