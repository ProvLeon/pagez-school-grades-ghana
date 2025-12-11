
import {
  useSaveGradingSettings,
  useSaveGradingScales,
  useSaveCommentOptions
} from "@/hooks/useGradingSettings";
import { toast } from "@/hooks/use-toast";
import { GradingScale, CommentOption } from "@/types/gradingSettings";
import { getAllDepartments } from "@/utils/departmentMapping";
import { validateDepartmentGradingScales } from "@/utils/gradingHelpers";
import { prepareAndValidateCommentOptions, getCommentTypeInfo } from "@/utils/commentOptionsHelpers";

// Helper function to map department keys to grading_scales table values
// The grading_scales table uses 'JHS' not 'JUNIOR HIGH'
const getDepartmentForGradingScales = (departmentKey: string): string => {
  const mapping: Record<string, string> = {
    'kg': 'KG',
    'primary': 'PRIMARY',
    'jhs': 'JHS',
    'shs': 'SHS',
    'KG': 'KG',
    'PRIMARY': 'PRIMARY',
    'JUNIOR HIGH': 'JHS',
    'SENIOR HIGH': 'SHS',
  };
  return mapping[departmentKey] || departmentKey.toUpperCase();
};

// Helper function to normalize term values (e.g., "First Term" -> "first")
const normalizeTerm = (term: string): "first" | "second" | "third" => {
  const termLower = term.toLowerCase().trim();

  if (termLower.includes('first') || termLower === '1' || termLower.includes('1st')) {
    return 'first';
  }
  if (termLower.includes('second') || termLower === '2' || termLower.includes('2nd')) {
    return 'second';
  }
  if (termLower.includes('third') || termLower === '3' || termLower.includes('3rd')) {
    return 'third';
  }

  // If already in correct format
  if (termLower === 'first' || termLower === 'second' || termLower === 'third') {
    return termLower as "first" | "second" | "third";
  }

  return 'first'; // Default fallback
};

interface SaveGradingSettingsParams {
  academicYear: string;
  term: "first" | "second" | "third";
  attendanceForTerm: string;
  termBegin: string;
  termEnds: string;
  nextTermBegin: string;
  kgGrading: GradingScale[];
  primaryGrading: GradingScale[];
  jhsGrading: GradingScale[];
  conductOptions: CommentOption[];
  attitudeOptions: CommentOption[];
  interestOptions: CommentOption[];
  teacherCommentOptions: CommentOption[];
}

export const useGradingSettingsSaver = () => {
  const saveGradingSettings = useSaveGradingSettings();
  const saveGradingScales = useSaveGradingScales();
  const saveCommentOptions = useSaveCommentOptions();

  const handleSave = async (params: SaveGradingSettingsParams) => {
    const {
      academicYear,
      term,
      attendanceForTerm,
      termBegin,
      termEnds,
      nextTermBegin,
      kgGrading,
      primaryGrading,
      jhsGrading,
      conductOptions,
      attitudeOptions,
      interestOptions,
      teacherCommentOptions
    } = params;

    console.log('Starting save process...');
    let hasErrors = false;

    try {
      // Step 1: Validate all data before saving
      // Normalize term to ensure it's in the correct format
      const normalizedTerm = normalizeTerm(term);
      console.log(`Normalized term from "${term}" to "${normalizedTerm}"`);

      const departments = getAllDepartments().map(d => ({
        ...d,
        gradingScalesDbName: getDepartmentForGradingScales(d.key), // Use JHS for grading_scales table
        scales:
          d.key === "kg" ? kgGrading :
            d.key === "primary" ? primaryGrading :
              d.key === "jhs" ? jhsGrading : []
      }));

      // Validate grading scales
      for (const dept of departments) {
        const validationErrors = validateDepartmentGradingScales(dept.scales);

        if (validationErrors.length > 0) {
          toast({
            title: `Validation Error in ${dept.displayName}`,
            description: validationErrors.join('. '),
            variant: "destructive",
          });
          hasErrors = true;
        }
      }

      if (hasErrors) return;

      // Step 2: Save academic settings first
      await saveGradingSettings.mutateAsync({
        academic_year: academicYear,
        term: normalizedTerm,
        attendance_for_term: attendanceForTerm ? Number(attendanceForTerm) : undefined,
        term_begin: termBegin || undefined,
        term_ends: termEnds || undefined,
        next_term_begin: nextTermBegin || undefined,
      });

      // Step 3: Save grading scales
      for (const dept of departments) {
        try {
          const validScales = dept.scales.filter(scale =>
            scale.grade?.trim() &&
            scale.remark?.trim() &&
            typeof scale.from === 'number' &&
            typeof scale.to === 'number' &&
            scale.from >= 0 &&
            scale.to >= 0 &&
            scale.from <= scale.to
          );

          if (validScales.length > 0) {
            console.log(`Saving grading scales for ${dept.displayName} with db name: ${dept.gradingScalesDbName}`);
            await saveGradingScales.mutateAsync({
              department: dept.gradingScalesDbName, // Use the grading_scales specific db name (JHS not JUNIOR HIGH)
              academicYear,
              term: normalizedTerm,
              scales: validScales.map(scale => ({
                from_percentage: Number(scale.from),
                to_percentage: Number(scale.to),
                grade: scale.grade.trim(),
                remark: scale.remark.trim()
              }))
            });
          }
        } catch (error) {
          hasErrors = true;
          toast({
            title: "Error",
            description: `Failed to save grading scales for ${dept.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      // Step 4: Save and validate comment options with enhanced validation
      try {
        const { validOptions, invalidTypes, hasBlankValue, rejectedOptions } =
          prepareAndValidateCommentOptions(
            conductOptions,
            attitudeOptions,
            interestOptions,
            teacherCommentOptions
          );

        // Show what types are allowed
        const { allowedTypes } = getCommentTypeInfo();

        if (rejectedOptions.length > 0) {
          console.warn("Rejected comment options:", rejectedOptions);
          toast({
            title: "Some Comment Options Were Skipped",
            description: `${rejectedOptions.length} comment option(s) were rejected due to validation errors. Check console for details.`,
          });
        }

        if (invalidTypes.length > 0 || hasBlankValue) {
          toast({
            title: "Validation Error",
            description:
              invalidTypes.length > 0
                ? `Invalid comment option type(s) detected: ${invalidTypes.join(', ')}. Allowed types: ${allowedTypes.join(', ')}.`
                : "Blank value detected in one or more comment options.",
            variant: "destructive",
          });
          console.error("Blocking save. Invalid types:", invalidTypes, "Allowed types:", allowedTypes);
          hasErrors = true;
          return;
        }

        if (validOptions.length > 0) {
          console.log("Saving valid comment options:", validOptions);
          await saveCommentOptions.mutateAsync(validOptions);
        } else {
          console.log("No valid comment options to save");
        }
      } catch (error) {
        hasErrors = true;
        console.error("Comment options save error:", error);
        toast({
          title: "Error",
          description: `Failed to save comment options: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }

      // Final success/error message
      if (hasErrors) {
        toast({
          title: "Partially Saved",
          description: "Some settings were saved, but there were errors with others. Please check the console for details.",
        });
      } else {
        toast({
          title: "Success",
          description: "All grading settings have been saved successfully!",
        });
      }

    } catch (error) {
      console.error("Save process error:", error);
      toast({
        title: "Error",
        description: `Failed to save grading settings: ${error instanceof Error ? error.message : 'Please check the console for details'}`,
        variant: "destructive",
      });
    }
  };

  const isSaving =
    saveGradingSettings.isPending ||
    saveGradingScales.isPending ||
    saveCommentOptions.isPending;

  return { handleSave, isSaving };
};
