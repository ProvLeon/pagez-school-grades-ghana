
import React, { useEffect } from 'react';
import { AddResultsFormContext } from '@/contexts/AddResultsFormContext';
import { useAddResultsFormData } from '@/hooks/useAddResultsFormData';
import { useAddResultsFormDerivedData } from '@/hooks/useAddResultsFormDerivedData';
import { useAddResultsFormValidation } from '@/hooks/useAddResultsFormValidation';
import { useState } from 'react';

interface AddResultsFormProviderProps {
  children: React.ReactNode;
  initialData?: any;
  isEditMode?: boolean;
  resultId?: string;
}

export const AddResultsFormProvider: React.FC<AddResultsFormProviderProps> = ({ 
  children, 
  initialData,
  isEditMode = false,
  resultId
}) => {
  const { formData, setFormData, existingResultError, setExistingResultError, gradingSettings } = useAddResultsFormData(isEditMode ? resultId : undefined);
  const [subjectMarks, setSubjectMarks] = useState<Record<string, any>>({});
  
  const derivedData = useAddResultsFormDerivedData(formData, gradingSettings);
  const { isFormValid } = useAddResultsFormValidation(formData, derivedData.selectedSBAType, existingResultError, subjectMarks);
  
  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log('Initializing form with data:', initialData);
      
      // Set basic form data
      const updatedFormData = {
        ...formData,
        class_id: initialData.class_id || '',
        student_id: initialData.student_id || '',
        term: initialData.term || '',
        academic_year: initialData.academic_year || '',
        ca_type_id: initialData.ca_type_id || '',
        teacher_id: initialData.teacher_id || '',
        days_school_opened: initialData.days_school_opened?.toString() || '',
        days_present: initialData.days_present?.toString() || '',
        days_absent: initialData.days_absent?.toString() || '',
        term_begin: initialData.term_begin || '',
        term_ends: initialData.term_ends || '',
        next_term_begin: initialData.next_term_begin || '',
        teachers_comment: initialData.teachers_comment || '',
        conduct: initialData.conduct || '',
        attitude: initialData.attitude || '',
        interest: initialData.interest || '',
        heads_remarks: initialData.heads_remarks || '',
        teacher_approved: initialData.teacher_approved || false,
        admin_approved: initialData.admin_approved || false
      };
      
      setFormData(updatedFormData);
      
      // Set subject marks
      if (initialData.subject_marks) {
        const marksData: Record<string, any> = {};
        initialData.subject_marks.forEach((mark: any) => {
          if (mark.subject_id) {
            marksData[mark.subject_id] = {
              subject_id: mark.subject_id,
              ca1_score: mark.ca1_score,
              ca2_score: mark.ca2_score,
              ca3_score: mark.ca3_score,
              ca4_score: mark.ca4_score,
              exam_score: mark.exam_score,
              total_score: mark.total_score,
              grade: mark.grade,
              position: mark.position
            };
          }
        });
        setSubjectMarks(marksData);
      }
      
      // Clear any existing result errors for edit mode
      setExistingResultError(null);
    }
  }, [initialData, isEditMode]);

  const contextValue = {
    formData,
    setFormData,
    subjectMarks,
    setSubjectMarks,
    classes: derivedData.classes,
    allStudents: derivedData.allStudents,
    subjects: derivedData.subjects,
    caTypes: derivedData.caTypes,
    teachers: derivedData.teachers,
    studentsInClass: derivedData.studentsInClass,
    selectedStudent: derivedData.selectedStudent,
    selectedClass: derivedData.selectedClass,
    selectedSBAType: derivedData.selectedSBAType,
    classSubjects: derivedData.classSubjects,
    isFormValid,
    existingResultError,
    setExistingResultError,
    gradingSettings,
    assessmentConfig: null,
    gradingScales: derivedData.gradingScales,
    configLoading: derivedData.scalesLoading,
    configError: derivedData.scalesError,
    conductOptions: derivedData.conductOptions,
    attitudeOptions: derivedData.attitudeOptions,
    interestOptions: derivedData.interestOptions,
    teacherCommentOptions: derivedData.teacherCommentOptions
  };

  return (
    <AddResultsFormContext.Provider value={contextValue}>
      {children}
    </AddResultsFormContext.Provider>
  );
};
