
import { GradingScale } from "@/types/gradingSettings";

// Helper function to validate grading scales
export const validateGradingScale = (scale: GradingScale): string[] => {
  const errors: string[] = [];
  
  if (!scale.grade?.trim()) {
    errors.push("Grade is required");
  }
  
  if (!scale.remark?.trim()) {
    errors.push("Remark is required");
  }
  
  if (typeof scale.from !== 'number' || scale.from < 0 || scale.from > 100) {
    errors.push("From percentage must be between 0 and 100");
  }
  
  if (typeof scale.to !== 'number' || scale.to < 0 || scale.to > 100) {
    errors.push("To percentage must be between 0 and 100");
  }
  
  if (scale.from > scale.to) {
    errors.push("From percentage cannot be greater than to percentage");
  }
  
  return errors;
};

// Helper function to validate department overlaps
export const validateGradingScales = (scales: GradingScale[]): string[] => {
  const errors: string[] = [];
  
  // Check for overlapping ranges
  const sortedScales = [...scales].sort((a, b) => a.from - b.from);
  
  for (let i = 0; i < sortedScales.length - 1; i++) {
    const current = sortedScales[i];
    const next = sortedScales[i + 1];
    
    if (current.to >= next.from) {
      errors.push(`Overlapping ranges: ${current.from}-${current.to}% and ${next.from}-${next.to}%`);
    }
  }
  
  return errors;
};
