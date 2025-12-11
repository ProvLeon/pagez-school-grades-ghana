
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

interface SettingsSaveButtonProps {
  saving: boolean;
  onSave: () => void;
}

export const SettingsSaveButton: React.FC<SettingsSaveButtonProps> = ({ saving, onSave }) => {
  return (
    <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 p-4 -mx-4 sm:mx-0 sm:relative sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
      <Button 
        onClick={onSave}
        disabled={saving}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 shadow-lg w-full sm:w-auto"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            SAVING...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            SAVE SETTINGS
          </>
        )}
      </Button>
    </div>
  );
};
