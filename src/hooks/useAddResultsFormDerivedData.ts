
import { useMemo } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useCATypes } from "@/hooks/useCATypes";
import { useTeachers } from "@/hooks/useTeachers";
import { useGradingScales, useCommentOptions } from "@/hooks/useGradingSettings";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { useAuth } from "@/contexts/AuthContext";
import { FormData } from "@/hooks/useAddResultsFormData";
import {
  defaultConductOptions,
  defaultAttitudeOptions,
  defaultInterestOptions,
  defaultTeacherCommentOptions
} from "@/data/defaults";

import { GradingSettings } from "@/hooks/useGradingSettings";

export const useAddResultsFormDerivedData = (formData: FormData, gradingSettings: GradingSettings | null | undefined) => {
  const { isTeacher } = useAuth();
  const { getAccessibleClassIds, assignments } = useCanAccessClass();

  // Data hooks
  const { data: allClasses = [] } = useClasses();
  const { data: allStudents = [] } = useStudents();
  const { data: subjects = [] } = useSubjects();
  const { data: caTypes = [] } = useCATypes();
  const { data: teachers = [] } = useTeachers();
  const { data: commentOptions = [] } = useCommentOptions();

  // Filter classes for teachers to only show assigned classes
  const classes = useMemo(() => {
    if (!isTeacher) return allClasses;

    const accessibleClassIds = getAccessibleClassIds();
    return allClasses.filter(cls => accessibleClassIds.includes(cls.id));
  }, [isTeacher, allClasses, getAccessibleClassIds]);

  // Derived data calculations
  const studentsInClass = useMemo(() =>
    formData.class_id
      ? allStudents.filter(student => student.class_id === formData.class_id)
      : []
    , [formData.class_id, allStudents]);

  const selectedStudent = useMemo(() =>
    formData.student_id
      ? allStudents.find(student => student.id === formData.student_id)
      : null
    , [formData.student_id, allStudents]);

  const selectedClass = useMemo(() =>
    formData.class_id
      ? classes.find(cls => cls.id === formData.class_id)
      : null
    , [formData.class_id, classes]);

  const classSubjects = useMemo(() => {
    if (!formData.class_id) return [];

    // For teachers, filter subjects based on their assignments
    if (isTeacher && assignments.length > 0) {
      const teacherSubjects = assignments
        .filter(assignment => assignment.class_id === formData.class_id)
        .map(assignment => assignment.subject)
        .filter(Boolean);

      return teacherSubjects;
    }

    // For admins, show all subjects in the department
    return selectedClass?.department_id
      ? subjects.filter(subject => subject.department_id === selectedClass.department_id)
      : [];
  }, [formData.class_id, isTeacher, assignments, selectedClass?.department_id, subjects]);

  // Standardized department mapping to match database constraints
  const getDepartmentKey = (departmentName: string) => {
    const lowerCaseDeptName = departmentName.toLowerCase().trim();
    const mapping: Record<string, string> = {
      'kg': 'KG',
      'kindergarten': 'KG',
      'primary': 'PRIMARY',
      'p': 'PRIMARY',
      'pri': 'PRIMARY',
      'jhs': 'JUNIOR HIGH',
      'junior high school': 'JUNIOR HIGH',
      'junior high': 'JUNIOR HIGH',
      'j.h.s': 'JUNIOR HIGH',
      'shs': 'SENIOR HIGH',
      'senior high school': 'SENIOR HIGH',
      'senior high': 'SENIOR HIGH',
      's.h.s': 'SENIOR HIGH',
    };
    // Check for legacy JHS/SHS uppercase values
    const upperDept = departmentName.toUpperCase().trim();
    if (upperDept === 'JHS') return 'JUNIOR HIGH';
    if (upperDept === 'SHS') return 'SENIOR HIGH';
    return mapping[lowerCaseDeptName] || upperDept;
  };

  const departmentKey = useMemo(() => {
    if (!selectedClass?.department?.name) return null;
    return getDepartmentKey(selectedClass.department.name);
  }, [selectedClass?.department?.name]);

  const academicYear = gradingSettings?.academic_year || formData.academic_year;
  const term = gradingSettings?.term || formData.term;

  const { data: gradingScales = [], isLoading: scalesLoading, error: scalesError } = useGradingScales(
    departmentKey,
    academicYear,
    term
  );

  const selectedSBAType = useMemo(() => {
    if (!formData.ca_type_id || !caTypes.length) return null;
    const foundType = caTypes.find(type => type.id === formData.ca_type_id);
    if (!foundType) return null;

    return {
      id: foundType.id,
      name: foundType.name,
      configuration: foundType.configuration,
      description: foundType.description,
    };
  }, [formData.ca_type_id, caTypes]);

  const conductOptions = useMemo(() => {
    const opts = commentOptions.filter((opt) => opt.option_type === "conduct");
    return opts.length > 0
      ? opts.map((opt) => ({ id: opt.id, value: opt.option_value }))
      : defaultConductOptions;
  }, [commentOptions]);

  const attitudeOptions = useMemo(() => {
    const opts = commentOptions.filter((opt) => opt.option_type === "attitude");
    return opts.length > 0
      ? opts.map((opt) => ({ id: opt.id, value: opt.option_value }))
      : defaultAttitudeOptions;
  }, [commentOptions]);

  const interestOptions = useMemo(() => {
    const opts = commentOptions.filter((opt) => opt.option_type === "interest");
    return opts.length > 0
      ? opts.map((opt) => ({ id: opt.id, value: opt.option_value }))
      : defaultInterestOptions;
  }, [commentOptions]);

  const teacherCommentOptions = useMemo(() => {
    const opts = commentOptions.filter((opt) => opt.option_type === "teacher");
    return opts.length > 0
      ? opts.map((opt) => ({ id: opt.id, value: opt.option_value }))
      : defaultTeacherCommentOptions;
  }, [commentOptions]);

  return {
    classes,
    allStudents,
    subjects,
    caTypes,
    teachers,
    studentsInClass,
    selectedStudent,
    selectedClass,
    classSubjects,
    selectedSBAType,
    gradingScales,
    scalesLoading,
    scalesError,
    conductOptions,
    attitudeOptions,
    interestOptions,
    teacherCommentOptions
  };
};
