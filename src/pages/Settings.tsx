
import React from 'react';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SettingsGrid } from '@/components/settings/SettingsGrid';
import { SettingsLoadingState } from '@/components/settings/SettingsLoadingState';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { WalkthroughTrigger } from '@/components/walkthrough';

const Settings = () => {
  const {
    loading,
    saving,
    formData,
    colorHue,
    colorSaturation,
    colorLightness,
    handleInputChange,
    handleLogoChange,
    handleSignatureChange,
    handleColorChange,
    handleHueChange,
    handleSaveSettings
  } = useSettingsForm();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Settings" subtitle="Loading settings..." />
        <main className="container mx-auto px-4 py-6">
          <SettingsLoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Settings" subtitle="Manage school information and theme settings" />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <SettingsGrid
          formData={formData}
          colorHue={colorHue}
          colorSaturation={colorSaturation}
          colorLightness={colorLightness}
          onInputChange={handleInputChange}
          onLogoChange={handleLogoChange}
          onSignatureChange={handleSignatureChange}
          onColorChange={handleColorChange}
          onHueChange={handleHueChange}
        />
        <div className="flex items-center justify-between">
          <WalkthroughTrigger variant="button" />
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
