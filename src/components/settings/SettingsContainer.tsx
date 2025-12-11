
import React, { ReactNode } from 'react';

interface SettingsContainerProps {
  children: ReactNode;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {children}
    </div>
  );
};
