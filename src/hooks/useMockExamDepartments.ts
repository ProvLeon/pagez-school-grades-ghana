import { useMemo, useCallback } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useClasses } from "@/hooks/useClasses";

// Department names that are eligible for mock exams
const MOCK_EXAM_DEPARTMENT_PATTERNS = [
  "junior high",
  "jhs",
  "j.h.s",
  "senior high",
  "shs",
  "s.h.s",
];

// Exam types based on department
export type MockExamType = "bece" | "wassce";

export interface MockExamDepartment {
  id: string;
  name: string;
  examType: MockExamType;
}

/**
 * Determines if a department name is eligible for mock exams (JHS or SHS)
 */
export const isMockExamEligibleDepartment = (departmentName: string): boolean => {
  const lowerName = departmentName.toLowerCase().trim();
  return MOCK_EXAM_DEPARTMENT_PATTERNS.some(
    (pattern) => lowerName.includes(pattern) || lowerName === pattern
  );
};

/**
 * Determines the exam type based on department name
 */
export const getExamType = (departmentName: string): MockExamType => {
  const lowerName = departmentName.toLowerCase().trim();
  if (
    lowerName.includes("senior") ||
    lowerName.includes("shs") ||
    lowerName === "s.h.s"
  ) {
    return "wassce";
  }
  return "bece"; // Default to BECE for JHS
};

/**
 * Get display name for exam type
 */
export const getExamTypeName = (examType: MockExamType): string => {
  return examType === "wassce" ? "WASSCE" : "BECE";
};

/**
 * Hook to get departments eligible for mock exams (JHS and SHS only)
 */
export const useMockExamDepartments = () => {
  const { data: allDepartments = [], isLoading, error } = useDepartments();

  const mockExamDepartments = useMemo((): MockExamDepartment[] => {
    return allDepartments
      .filter((dept) => isMockExamEligibleDepartment(dept.name))
      .map((dept) => ({
        id: dept.id,
        name: dept.name,
        examType: getExamType(dept.name),
      }));
  }, [allDepartments]);

  // Separate JHS and SHS departments
  const jhsDepartments = useMemo(() => {
    return mockExamDepartments.filter((d) => d.examType === "bece");
  }, [mockExamDepartments]);

  const shsDepartments = useMemo(() => {
    return mockExamDepartments.filter((d) => d.examType === "wassce");
  }, [mockExamDepartments]);

  return {
    departments: mockExamDepartments,
    jhsDepartments,
    shsDepartments,
    isLoading,
    error,
  };
};

/**
 * Hook to get classes eligible for mock exams (classes in JHS or SHS departments)
 */
export const useMockExamClasses = () => {
  const { data: allClasses = [], isLoading: classesLoading } = useClasses();
  const { departments: mockDepartments, isLoading: deptsLoading } = useMockExamDepartments();

  const isLoading = classesLoading || deptsLoading;

  const mockExamClasses = useMemo(() => {
    const eligibleDeptIds = new Set(mockDepartments.map((d) => d.id));
    return allClasses.filter((cls) => cls.department_id && eligibleDeptIds.has(cls.department_id));
  }, [allClasses, mockDepartments]);

  // Get classes grouped by exam type
  const beceClasses = useMemo(() => {
    const jhsDeptIds = new Set(
      mockDepartments.filter((d) => d.examType === "bece").map((d) => d.id)
    );
    return allClasses.filter((cls) => cls.department_id && jhsDeptIds.has(cls.department_id));
  }, [allClasses, mockDepartments]);

  const wassceClasses = useMemo(() => {
    const shsDeptIds = new Set(
      mockDepartments.filter((d) => d.examType === "wassce").map((d) => d.id)
    );
    return allClasses.filter((cls) => cls.department_id && shsDeptIds.has(cls.department_id));
  }, [allClasses, mockDepartments]);

  // Helper to get exam type for a class - memoized to prevent infinite re-renders
  const getClassExamType = useCallback((classId: string): MockExamType | null => {
    const cls = allClasses.find((c) => c.id === classId);
    if (!cls?.department_id) return null;

    const dept = mockDepartments.find((d) => d.id === cls.department_id);
    return dept?.examType || null;
  }, [allClasses, mockDepartments]);

  return {
    classes: mockExamClasses,
    beceClasses,
    wassceClasses,
    getClassExamType,
    isLoading,
  };
};

// BECE Core Subjects (4 required)
export const BECE_CORE_SUBJECTS = [
  { key: "english", name: "English Language" },
  { key: "mathematics", name: "Mathematics" },
  { key: "science", name: "Integrated Science" },
  { key: "social", name: "Social Studies" },
];

// BECE Optional Subjects (best 2 used)
export const BECE_OPTIONAL_SUBJECTS = [
  { key: "rme", name: "Religious & Moral Education" },
  { key: "french", name: "French" },
  { key: "gh_language", name: "Ghanaian Language" },
  { key: "ict", name: "ICT / Computing" },
  { key: "career_technology", name: "Career Technology" },
  { key: "creative_arts", name: "Creative Arts" },
  { key: "arabic", name: "Arabic" },
];

// WASSCE Core Subjects (required)
export const WASSCE_CORE_SUBJECTS = [
  { key: "english", name: "English Language" },
  { key: "mathematics", name: "Core Mathematics" },
  { key: "science", name: "Integrated Science" },
  { key: "social", name: "Social Studies" },
];

// WASSCE Elective Subjects (student chooses based on program)
export const WASSCE_ELECTIVE_SUBJECTS = [
  // General Arts
  { key: "literature", name: "Literature in English", programs: ["arts"] },
  { key: "government", name: "Government", programs: ["arts"] },
  { key: "economics", name: "Economics", programs: ["arts", "business"] },
  { key: "geography", name: "Geography", programs: ["arts", "science"] },
  { key: "history", name: "History", programs: ["arts"] },
  { key: "french", name: "French", programs: ["arts"] },
  { key: "religious_studies", name: "Christian/Islamic Religious Studies", programs: ["arts"] },

  // Business
  { key: "accounting", name: "Financial Accounting", programs: ["business"] },
  { key: "business_mgt", name: "Business Management", programs: ["business"] },
  { key: "cost_accounting", name: "Cost Accounting", programs: ["business"] },

  // Science
  { key: "elective_math", name: "Elective Mathematics", programs: ["science"] },
  { key: "physics", name: "Physics", programs: ["science"] },
  { key: "chemistry", name: "Chemistry", programs: ["science"] },
  { key: "biology", name: "Biology", programs: ["science"] },

  // Home Economics
  { key: "food_nutrition", name: "Food & Nutrition", programs: ["home_ec"] },
  { key: "management_in_living", name: "Management in Living", programs: ["home_ec"] },
  { key: "textiles", name: "Textiles", programs: ["home_ec"] },

  // Visual Arts
  { key: "graphic_design", name: "Graphic Design", programs: ["visual_arts"] },
  { key: "picture_making", name: "Picture Making", programs: ["visual_arts"] },
  { key: "sculpture", name: "Sculpture", programs: ["visual_arts"] },
  { key: "ceramics", name: "Ceramics", programs: ["visual_arts"] },

  // Technical / Vocational
  { key: "auto_mechanics", name: "Auto Mechanics", programs: ["technical"] },
  { key: "building_construction", name: "Building Construction", programs: ["technical"] },
  { key: "electronics", name: "Electronics", programs: ["technical"] },
  { key: "metalwork", name: "Metalwork", programs: ["technical"] },
  { key: "woodwork", name: "Woodwork", programs: ["technical"] },

  // Agriculture
  { key: "animal_husbandry", name: "Animal Husbandry", programs: ["agric"] },
  { key: "crop_husbandry", name: "Crop Husbandry", programs: ["agric"] },
  { key: "agric_science", name: "General Agriculture", programs: ["agric"] },
];

/**
 * Get subjects for a specific exam type
 */
export const getSubjectsForExamType = (examType: MockExamType) => {
  if (examType === "wassce") {
    return {
      core: WASSCE_CORE_SUBJECTS,
      electives: WASSCE_ELECTIVE_SUBJECTS,
      coreCount: 4,
      electiveCount: 4, // WASSCE requires 4 electives
    };
  }
  return {
    core: BECE_CORE_SUBJECTS,
    electives: BECE_OPTIONAL_SUBJECTS,
    coreCount: 4,
    electiveCount: 2, // BECE uses best 2 electives
  };
};

/**
 * Get all subject keys for an exam type
 */
export const getAllSubjectKeys = (examType: MockExamType): string[] => {
  const { core, electives } = getSubjectsForExamType(examType);
  return [...core.map((s) => s.key), ...electives.map((s) => s.key)];
};
