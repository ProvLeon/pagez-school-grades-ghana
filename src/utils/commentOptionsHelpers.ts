
import { CommentOption } from "@/types/gradingSettings";

/** Allowed types for strict validation */
export const ALLOWED_COMMENT_TYPES = [
  "conduct",
  "attitude", 
  "interest",
  "teacher"
] as const;

export interface PreparedCommentOption {
  option_type: "conduct" | "attitude" | "interest" | "teacher";
  option_value: string;
  sort_order: number;
}

/**
 * Assemble and strictly validate comment options of all types.
 * Returns {validOptions, invalidTypes, hasBlankValue, rejectedOptions}
 */
export function prepareAndValidateCommentOptions(
  conductOptions: CommentOption[],
  attitudeOptions: CommentOption[],
  interestOptions: CommentOption[],
  teacherCommentOptions: CommentOption[]
): {
  validOptions: PreparedCommentOption[],
  invalidTypes: string[],
  hasBlankValue: boolean,
  rejectedOptions: Array<{type: string, value: string, reason: string}>
} {
  const options: PreparedCommentOption[] = [];
  const rejectedOptions: Array<{type: string, value: string, reason: string}> = [];

  // Helper function to validate and add options
  const processOptions = (
    opts: CommentOption[], 
    type: "conduct" | "attitude" | "interest" | "teacher"
  ) => {
    opts.forEach((opt, i) => {
      const trimmedValue = opt.value?.trim() || "";
      
      if (!trimmedValue) {
        rejectedOptions.push({
          type,
          value: opt.value || "(empty)",
          reason: "Blank or empty value"
        });
        return;
      }

      if (!ALLOWED_COMMENT_TYPES.includes(type)) {
        rejectedOptions.push({
          type,
          value: trimmedValue,
          reason: "Invalid option type"
        });
        return;
      }

      options.push({ 
        option_type: type, 
        option_value: trimmedValue, 
        sort_order: i 
      });
    });
  };

  // Process each type of comment option
  processOptions(conductOptions, "conduct");
  processOptions(attitudeOptions, "attitude");
  processOptions(interestOptions, "interest");
  processOptions(teacherCommentOptions, "teacher");

  // Check for invalid types and blank values
  const uniqueTypes = Array.from(new Set(options.map((o) => o.option_type)));
  const invalidTypes = uniqueTypes.filter((t) => !ALLOWED_COMMENT_TYPES.includes(t));
  const hasBlankValue = options.some((o) => !o.option_value || o.option_value.trim() === "");

  console.log("Comment options validation:", {
    totalProcessed: conductOptions.length + attitudeOptions.length + interestOptions.length + teacherCommentOptions.length,
    validOptions: options.length,
    rejectedOptions: rejectedOptions.length,
    invalidTypes,
    hasBlankValue
  });

  return { validOptions: options, invalidTypes, hasBlankValue, rejectedOptions };
}

/**
 * Get display information for allowed comment types
 */
export function getCommentTypeInfo() {
  return {
    allowedTypes: ALLOWED_COMMENT_TYPES,
    typeDescriptions: {
      conduct: "Student behavior and discipline",
      attitude: "Student attitude towards learning",
      interest: "Student interest and engagement",
      teacher: "Teacher's general comments"
    }
  };
}
