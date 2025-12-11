/**
 * Grading Settings Types
 *
 * These types define the structure for grading scales, comment options,
 * and other settings used throughout the student results system.
 */

/**
 * Represents a single grade range in the grading scale
 * @example { id: "1", from: 80, to: 100, grade: "A", remark: "Excellent" }
 */
export interface GradingScale {
  id: string;
  /** The minimum score for this grade (inclusive) */
  from: number;
  /** The maximum score for this grade (inclusive) */
  to: number;
  /** The letter grade (e.g., "A", "B+", "C") */
  grade: string;
  /** The remark/description for this grade (e.g., "Excellent", "Very Good") */
  remark: string;
}

/**
 * Represents a comment option for dropdowns
 * Used for conduct, attitude, interest, and teacher comments
 */
export interface CommentOption {
  id: string;
  /** The display value of the comment */
  value: string;
  /** Optional sort order for display */
  sort_order?: number;
}

/**
 * Department types supported by the grading system
 */
export type Department = "kg" | "primary" | "jhs" | "shs";

/**
 * Types of comments available in the system
 */
export type CommentType = "conduct" | "attitude" | "interest" | "teacher";

/**
 * Assessment component types
 */
export type AssessmentComponent =
  | "ca1"
  | "ca2"
  | "ca3"
  | "ca4"
  | "ca"
  | "class_work"
  | "homework"
  | "project"
  | "exam";

/**
 * Configuration for assessment types (SBA types)
 */
export interface AssessmentConfiguration {
  id: string;
  name: string;
  description?: string;
  /** Key-value pairs of component names and their max scores */
  configuration: Record<string, number>;
  /** Whether this configuration is active */
  is_active?: boolean;
}

/**
 * Term/Semester options
 */
export type Term = "first" | "second" | "third";

/**
 * Gender options
 */
export type Gender = "male" | "female";

/**
 * Student status
 */
export type StudentStatus = "active" | "inactive" | "transferred" | "graduated";

/**
 * Grading settings for a specific department/level
 */
export interface DepartmentGradingSettings {
  department: Department;
  grading_scales: GradingScale[];
  pass_mark: number;
  has_exam: boolean;
  ca_weight?: number;
  exam_weight?: number;
}

/**
 * Complete grading settings object
 */
export interface GradingSettings {
  departments: DepartmentGradingSettings[];
  comment_options: {
    conduct: CommentOption[];
    attitude: CommentOption[];
    interest: CommentOption[];
    teacher: CommentOption[];
  };
  assessment_types: AssessmentConfiguration[];
}

/**
 * Subject mark entry
 */
export interface SubjectMark {
  subject_id: string;
  subject_name?: string;
  scores: Record<string, number | null>;
  total_score?: number;
  grade?: string;
  remark?: string;
}

/**
 * Result form data
 */
export interface ResultFormData {
  student_id: string;
  class_id: string;
  term: Term;
  academic_year: string;
  assessment_type_id?: string;
  teacher_id?: string;
  days_school_opened?: number;
  days_present?: number;
  days_absent?: number;
  term_begin?: string;
  term_ends?: string;
  next_term_begin?: string;
  conduct?: string;
  attitude?: string;
  interest?: string;
  teachers_comment?: string;
  head_teachers_comment?: string;
  is_public?: boolean;
}

/**
 * Calculate grade from score using grading scales
 */
export function calculateGrade(
  score: number,
  gradingScales: GradingScale[]
): { grade: string; remark: string } | null {
  for (const scale of gradingScales) {
    if (score >= scale.from && score <= scale.to) {
      return { grade: scale.grade, remark: scale.remark };
    }
  }
  return null;
}

/**
 * Calculate total score from component scores
 */
export function calculateTotalScore(
  scores: Record<string, number | null>,
  configuration: Record<string, number>
): number {
  let total = 0;
  for (const [key, value] of Object.entries(scores)) {
    if (value !== null && configuration[key]) {
      total += value;
    }
  }
  return total;
}

/**
 * Validate score against max value
 */
export function isValidScore(score: number, maxScore: number): boolean {
  return score >= 0 && score <= maxScore;
}
