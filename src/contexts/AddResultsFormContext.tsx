
import { createContext, useContext } from "react";
import { FormData } from "@/hooks/useAddResultsFormData";

interface AddResultsFormContextType {
  formData: FormData;
  setFormData: (data: FormData) => void;
  subjectMarks: Record<string, any>;
  setSubjectMarks: (marks: Record<string, any>) => void;
  classes: any[];
  allStudents: any[];
  subjects: any[];
  caTypes: any[];
  teachers: any[];
  studentsInClass: any[];
  selectedStudent: any;
  selectedClass: any;
  selectedSBAType: any;
  classSubjects: any[];
  isFormValid: () => boolean;
  existingResultError: string | null;
  setExistingResultError: (error: string | null) => void;
  gradingSettings: any;
  assessmentConfig: any;
  gradingScales: any[];
  configLoading?: boolean;
  configError?: any;
  conductOptions: { id: string; value: string }[];
  attitudeOptions: { id: string; value: string }[];
  interestOptions: { id: string; value: string }[];
  teacherCommentOptions: { id: string; value: string }[];
}

export const AddResultsFormContext = createContext<AddResultsFormContextType | undefined>(undefined);

export const useAddResultsForm = () => {
  const context = useContext(AddResultsFormContext);
  if (!context) {
    throw new Error('useAddResultsForm must be used within AddResultsFormProvider');
  }
  return context;
};
