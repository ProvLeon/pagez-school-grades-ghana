
import React from 'react';
import { SchoolInformationForm } from './SchoolInformationForm';
import { ThemeBrandingForm } from './ThemeBrandingForm';

interface SettingsGridProps {
  formData: {
    school_name: string;
    location: string;
    address_1: string;
    phone: string;
    motto: string;
    headteacher_name: string;
    primary_color: string;
    logo_url: string | null;
    headteacher_signature_url: string | null;
  };
  colorHue: number;
  colorSaturation: number;
  colorLightness: number;
  onInputChange: (field: string, value: string) => void;
  onLogoChange: (logoUrl: string | null) => void;
  onSignatureChange: (signatureUrl: string | null) => void;
  onColorChange: (saturation: number, lightness: number) => void;
  onHueChange: (hue: number) => void;
}

export const SettingsGrid: React.FC<SettingsGridProps> = ({
  formData,
  colorHue,
  colorSaturation,
  colorLightness,
  onInputChange,
  onLogoChange,
  onSignatureChange,
  onColorChange,
  onHueChange
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* School Information Column */}
      <div className="space-y-6">
        <SchoolInformationForm
          formData={formData}
          onInputChange={onInputChange}
        />
      </div>

      {/* Theme & Branding Column */}
      <div className="space-y-6">
        <ThemeBrandingForm
          logoUrl={formData.logo_url}
          signatureUrl={formData.headteacher_signature_url}
          primaryColor={formData.primary_color}
          colorHue={colorHue}
          colorSaturation={colorSaturation}
          colorLightness={colorLightness}
          onLogoChange={onLogoChange}
          onSignatureChange={onSignatureChange}
          onColorChange={onColorChange}
          onHueChange={onHueChange}
        />
      </div>
    </div>
  );
};
