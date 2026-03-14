// Mock exam grade and calculation utilities

// Default core subject name patterns (matches any subject whose lowercased name contains these)
const DEFAULT_CORE_PATTERNS = ['english', 'mathematics', 'science', 'social studies', 'social'];

/**
 * Determine if a subject name is a core subject.
 * Uses the provided coreNames list (from the DB/dynamic form) or falls back to defaults.
 */
export const isCoreSubject = (
  name: string,
  coreNames?: string[]
): boolean => {
  const lower = name.toLowerCase();
  const patterns = coreNames
    ? coreNames.map(n => n.toLowerCase())
    : DEFAULT_CORE_PATTERNS;
  return patterns.some(p => lower.includes(p) || p.includes(lower));
};

/**
 * Calculate grade from score using the mock exam formula
 * Score >= 80 = Grade 1, >= 70 = Grade 2, etc.
 */
export const calculateMockGrade = (score: number): number => {
  if (score >= 80) return 1;
  if (score >= 70) return 2;
  if (score >= 60) return 3;
  if (score >= 55) return 4;
  if (score >= 50) return 5;
  if (score >= 45) return 6;
  if (score >= 40) return 7;
  if (score >= 35) return 8;
  return 9;
};

/**
 * Calculate total raw score for mock exams (sum of all subject scores)
 */
export const calculateMockTotalScore = (scores: Record<string, number | undefined>): number => {
  let total = 0;
  for (const key of Object.keys(scores)) {
    const score = scores[key];
    if (typeof score === 'number' && !isNaN(score) && score > 0) {
      total += Math.max(0, Math.min(100, score));
    }
  }
  return total;
};

/**
 * Calculate average percentage score for mock exams
 */
export const calculateMockRawScore = (scores: Record<string, number | undefined>): number => {
  let total = 0;
  let count = 0;
  for (const key of Object.keys(scores)) {
    const score = scores[key];
    if (typeof score === 'number' && !isNaN(score) && score > 0) {
      total += Math.max(0, Math.min(100, score));
      count++;
    }
  }
  if (count === 0) return 0;
  return Math.round(total / count);
};

/**
 * Calculate aggregate for mock exams.
 * Now works dynamically: keys in `scores` are subject NAMES (from DB).
 * Core subjects: English, Mathematics, Integrated Science, Social Studies.
 * Plus the two best optional subjects by grade (lowest grade number is best).
 *
 * @param scores - Record<subjectName, score>
 * @param coreNames - Optional override list of core subject names (defaults to standard 4)
 */
export const calculateMockAggregate = (
  scores: Record<string, number | undefined>,
  coreNames?: string[]
): number => {
  let aggregate = 0;
  const coreGrades: number[] = [];
  const optionalGrades: number[] = [];

  for (const subjectName of Object.keys(scores)) {
    const score = scores[subjectName];
    const numericScore = typeof score === 'number' && !isNaN(score)
      ? Math.max(0, Math.min(100, score))
      : null;

    const grade = numericScore !== null ? calculateMockGrade(numericScore) : 9;

    if (isCoreSubject(subjectName, coreNames)) {
      coreGrades.push(grade);
    } else {
      if (numericScore !== null) {
        optionalGrades.push(grade);
      }
    }
  }

  // Pad missing core subjects with grade 9 (worst)
  const CORE_COUNT = 4;
  while (coreGrades.length < CORE_COUNT) {
    coreGrades.push(9);
  }

  aggregate = coreGrades.reduce((sum, g) => sum + g, 0);

  // Best two optional subjects (lowest numbers = best)
  optionalGrades.sort((a, b) => a - b);
  if (optionalGrades.length >= 2) {
    aggregate += optionalGrades[0] + optionalGrades[1];
  } else if (optionalGrades.length === 1) {
    aggregate += optionalGrades[0] + 9;
  } else {
    aggregate += 18;
  }

  return aggregate;
};

/**
 * Get default core subject name patterns
 */
export const getCoreSubjectPatterns = (): string[] => DEFAULT_CORE_PATTERNS;
