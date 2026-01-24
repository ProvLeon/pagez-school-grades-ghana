
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SettingsGrid } from '@/components/settings/SettingsGrid';
import { SettingsLoadingState } from '@/components/settings/SettingsLoadingState';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { WalkthroughTrigger } from '@/components/walkthrough';

const Settings = () => {
  const [searchParams] = useSearchParams();
  const setupRequired = searchParams.get('setup') === 'required';

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
        {setupRequired && (
          <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              Your account is not associated with any organization explicitly yet.
              Please verify your school details below and click "Save Settings" to complete your account setup.
            </AlertDescription>
          </Alert>
        )}

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
