
import React from 'react';
import { Loader2 } from 'lucide-react';
import { SettingsLayout } from './SettingsLayout';
import { SettingsHeader } from './SettingsHeader';

export const SettingsLoadingState: React.FC = () => {
  return (
    <SettingsLayout>
      <SettingsHeader />
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <div className="text-lg font-medium">Loading settings...</div>
        </div>
      </div>
    </SettingsLayout>
  );
};
