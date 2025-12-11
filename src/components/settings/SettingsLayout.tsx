
import React, { ReactNode } from 'react';

interface SettingsLayoutProps {
  children: ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {children}
    </div>
  );
};
