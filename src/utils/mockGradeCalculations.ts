// Mock exam grade and calculation utilities

/**
 * Calculate grade from score using the mock exam formula
 * Score >= 80 = Grade 1, >= 70 = Grade 2, etc.
 */
export const calculateMockGrade = (score: number): number => {
  if (score >= 80) return 1;
  if (score >= 70) return 2;
  if (score >= 65) return 3;
  if (score >= 60) return 4;
  if (score >= 55) return 5;
  if (score >= 50) return 6;
  if (score >= 45) return 7;
  if (score >= 35) return 8;
  return 9;
};

/**
 * Calculate total raw score for mock exams (sum of all subject scores)
 * Returns the sum of all entered subject scores
 */
export const calculateMockTotalScore = (scores: Record<string, number | undefined>): number => {
  let total = 0;
  let count = 0;

  for (const key of Object.keys(scores)) {
    const score = scores[key];
    if (typeof score === 'number' && !isNaN(score) && score > 0) {
      total += Math.max(0, Math.min(100, score));
      count++;
    }
  }

  return total;
};

/**
 * Calculate average percentage score for mock exams
 * Returns the average of all entered subject scores (0-100)
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
 * Calculate aggregate for mock exams
 * - Core subjects: Mathematics, English, Social Studies, Science
 * - Plus any two best optional subjects
 */
export const calculateMockAggregate = (scores: Record<string, number | undefined>): number => {
  const coreSubjects = ['mathematics', 'english', 'social', 'science'];
  const optionalSubjects = ['career_technology', 'rme', 'ict', 'creative_arts', 'gh_language', 'french'];

  let aggregate = 0;

  // Add grades for core subjects
  for (const subject of coreSubjects) {
    const score = scores[subject];
    if (typeof score === 'number' && !isNaN(score)) {
      const clampedScore = Math.max(0, Math.min(100, score));
      aggregate += calculateMockGrade(clampedScore);
    } else {
      // If core subject is missing, assign worst grade
      aggregate += 9;
    }
  }

  // Get best two optional subjects
  const optionalGrades: number[] = [];
  for (const subject of optionalSubjects) {
    const score = scores[subject];
    if (typeof score === 'number' && !isNaN(score)) {
      const clampedScore = Math.max(0, Math.min(100, score));
      optionalGrades.push(calculateMockGrade(clampedScore));
    }
  }

  // Sort optional grades (best grades are lowest numbers)
  optionalGrades.sort((a, b) => a - b);

  // Add best two optional grades (or assign worst grades if not enough)
  if (optionalGrades.length >= 2) {
    aggregate += optionalGrades[0] + optionalGrades[1];
  } else if (optionalGrades.length === 1) {
    aggregate += optionalGrades[0] + 9; // One best + one worst
  } else {
    aggregate += 18; // Two worst grades (9 + 9)
  }

  return aggregate;
};

/**
 * Get subject keys that are core subjects for mock exams
 */
export const getCoreSubjects = (): string[] => {
  return ['mathematics', 'english', 'social', 'science'];
};

/**
 * Get subject keys that are optional subjects for mock exams
 */
export const getOptionalSubjects = (): string[] => {
  return ['career_technology', 'rme', 'ict', 'creative_arts', 'gh_language', 'french'];
};
