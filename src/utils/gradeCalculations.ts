
import { CAType } from "@/hooks/useCATypes";
import { GradingScale } from "@/hooks/useGradingSettings";

export interface SubjectScore {
  subject_id: string;
  subject_name: string;
  ca1_score?: number;
  ca2_score?: number;
  ca3_score?: number;
  ca4_score?: number;
  exam_score?: number;
  total_score?: number;
  grade?: string;
}

export const calculateTotalScore = (scores: SubjectScore, caConfig: CAType | undefined) => {
  if (!caConfig) return 0;

  const config = caConfig.configuration || {};
  let total = 0;

  const clamp = (val: number | undefined, min: number, max: number) => {
    const n = typeof val === 'number' ? val : 0;
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(n, min), max);
  };

  // Single CA mode (e.g., 50/50, 70/30, 60/40): CA raw score out of max CA (e.g., 30, 40, 50)
  if (config.ca) {
    // Use the actual CA score provided, do not convert/scale
    const caRaw = clamp(scores.ca1_score, 0, config.ca);
    total += caRaw;
  }

  // Split CA components (e.g., 60/10/10/10/10):
  // Each CAi raw score is capped at its own weight (e.g., max 10),
  // Use the actual CAi score provided, do not convert/scale
  if (config.ca1) {
    const max = config.ca1;
    const raw = clamp(scores.ca1_score, 0, max);
    total += raw;
  }
  if (config.ca2) {
    const max = config.ca2;
    const raw = clamp(scores.ca2_score, 0, max);
    total += raw;
  }
  if (config.ca3) {
    const max = config.ca3;
    const raw = clamp(scores.ca3_score, 0, max);
    total += raw;
  }
  if (config.ca4) {
    const max = config.ca4;
    const raw = clamp(scores.ca4_score, 0, max);
    total += raw;
  }

  // Exam is always out of 100
  if (config.exam) {
    const examRaw = clamp(scores.exam_score, 0, 100);
    total += (examRaw * config.exam) / 100;
  }

  return Math.round(total * 100) / 100;
};

export const getGradeFromScale = (score: number, gradingScales: GradingScale[]) => {
  if (!gradingScales || gradingScales.length === 0) {
    return getGrade(score); // fallback to default grading
  }

  for (const scale of gradingScales) {
    if (score >= scale.from_percentage && score <= scale.to_percentage) {
      return scale.grade;
    }
  }

  return 'F'; // default if no scale matches
};

export const getGrade = (score: number) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};
