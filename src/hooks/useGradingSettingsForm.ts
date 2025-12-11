
import { useAcademicSettingsManager } from "./useAcademicSettingsManager";
import { useGradingScalesManager } from "./useGradingScalesManager";
import { useCommentOptionsManager } from "./useCommentOptionsManager";
import { useGradingSettingsSaver } from "./useGradingSettingsSaver";

export const useGradingSettingsForm = () => {
  const academicSettings = useAcademicSettingsManager();
  const gradingScales = useGradingScalesManager();
  const commentOptions = useCommentOptionsManager();
  const { handleSave: saveSettings, isSaving } = useGradingSettingsSaver();

  const handleSave = async () => {
    await saveSettings({
      ...academicSettings,
      ...gradingScales,
      ...commentOptions
    });
  };

  return {
    // Academic settings
    ...academicSettings,
    
    // Grading scales
    ...gradingScales,
    
    // Comment options
    ...commentOptions,
    
    // Actions
    handleSave,
    
    // Loading states
    isSaving
  };
};
