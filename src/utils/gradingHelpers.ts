
import { GradingScale } from "@/types/gradingSettings";
import { validateGradingScale, validateGradingScales } from "@/utils/gradingValidation";

/**
 * Validate grading scales for a department, return array of error messages.
 */
export function validateDepartmentGradingScales(
  departmentScales: GradingScale[]
): string[] {
  let errors: string[] = [];
  departmentScales.forEach((scale) => {
    errors = errors.concat(validateGradingScale(scale));
  });
  errors = errors.concat(validateGradingScales(departmentScales));
  return errors;
}

