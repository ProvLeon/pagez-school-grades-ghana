
import { useState, useEffect } from "react";
import { useCheckExistingResult } from "@/hooks/useResults";
import { useGradingSettings } from "@/hooks/useGradingSettings";
import { useAuth } from "@/contexts/AuthContext";

export interface FormData {
  class_id: string;
  student_id: string;
  term: "first" | "second" | "third" | "";
  ca_type_id: string;
  teacher_id: string;
  academic_year: string;
  days_school_opened: string;
  days_present: string;
  days_absent: string;
  term_begin: string;
  term_ends: string;
  next_term_begin: string;
  teachers_comment: string;
  conduct?: string;
  attitude?: string;
  interest?: string;
  heads_remarks?: string;
  teacher_approved: boolean;
  admin_approved: boolean;
}

export const useAddResultsFormData = (excludeResultId?: string) => {
  const { isTeacher, teacherRecord } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    class_id: "",
    student_id: "",
    term: "" as "first" | "second" | "third" | "",
    ca_type_id: "",
    teacher_id: isTeacher && teacherRecord ? teacherRecord.id : "",
    academic_year: "2024/2025",
    days_school_opened: "",
    days_present: "",
    days_absent: "",
    term_begin: "",
    term_ends: "",
    next_term_begin: "",
    teachers_comment: "",
    conduct: "",
    attitude: "",
    interest: "",
    heads_remarks: "",
    teacher_approved: isTeacher ? true : false,
    admin_approved: isTeacher ? true : false,
  });

  const [existingResultError, setExistingResultError] = useState<string | null>(null);
  const { data: gradingSettings } = useGradingSettings();
  const checkExistingResult = useCheckExistingResult();

  // Auto-populate form data from grading settings and teacher info
  useEffect(() => {
    if (gradingSettings) {
      setFormData(prev => ({
        ...prev,
        academic_year: gradingSettings.academic_year,
        term: gradingSettings.term,
        term_begin: gradingSettings.term_begin || "",
        term_ends: gradingSettings.term_ends || "",
        next_term_begin: gradingSettings.next_term_begin || "",
        days_school_opened: gradingSettings.attendance_for_term?.toString() || ""
      }));
    }
  }, [gradingSettings]);

  // Auto-populate teacher ID for teachers
  useEffect(() => {
    if (isTeacher && teacherRecord && !formData.teacher_id) {
      setFormData(prev => ({
        ...prev,
        teacher_id: teacherRecord.id,
        teacher_approved: true,
        admin_approved: true,
      }));
    }
  }, [isTeacher, teacherRecord, formData.teacher_id]);

  // Check for existing result when student, term, or academic year changes
  useEffect(() => {
    if (formData.student_id && formData.term && formData.academic_year) {
      checkExistingResult.mutate({
        student_id: formData.student_id,
        term: formData.term,
        academic_year: formData.academic_year,
        exclude_result_id: excludeResultId
      }, {
        onSuccess: (existingResult) => {
          if (existingResult) {
            setExistingResultError(`A result already exists for this student in ${formData.term} term of ${formData.academic_year}. Please choose a different student or term.`);
          } else {
            setExistingResultError(null);
          }
        },
        onError: () => {
          setExistingResultError(null);
        }
      });
    } else {
      setExistingResultError(null);
    }
  }, [formData.student_id, formData.term, formData.academic_year, excludeResultId]);

  return {
    formData,
    setFormData,
    existingResultError,
    setExistingResultError,
    gradingSettings
  };
};
