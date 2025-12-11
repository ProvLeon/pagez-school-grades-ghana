
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LogoUpload } from '@/components/LogoUpload';
import { InteractiveColorPicker } from '@/components/InteractiveColorPicker';
import { Palette, Image, PenTool } from 'lucide-react';
const SignatureUpload = React.lazy(() => import('@/components/SignatureUpload'));

interface ThemeBrandingFormProps {
  logoUrl?: string | null;
  signatureUrl?: string | null;
  primaryColor: string;
  colorHue: number;
  colorSaturation: number;
  colorLightness: number;
  onLogoChange: (logoUrl: string | null) => void;
  onSignatureChange: (signatureUrl: string | null) => void;
  onColorChange: (saturation: number, lightness: number) => void;
  onHueChange: (hue: number) => void;
}

export const ThemeBrandingForm: React.FC<ThemeBrandingFormProps> = ({
  logoUrl,
  signatureUrl,
  primaryColor,
  colorHue,
  colorSaturation,
  colorLightness,
  onLogoChange,
  onSignatureChange,
  onColorChange,
  onHueChange
}) => {
  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            School Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            currentLogoUrl={logoUrl}
            onLogoChange={onLogoChange}
          />
        </CardContent>
      </Card>

      {/* Signature Upload */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Headteacher Signature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SignatureUpload
              currentSignatureUrl={signatureUrl}
              onSignatureChange={onSignatureChange}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Color Picker Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose Primary Color
              </Label>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <InteractiveColorPicker
                  hue={colorHue}
                  saturation={colorSaturation}
                  lightness={colorLightness}
                  onColorChange={onColorChange}
                  onHueChange={onHueChange}
                />
              </div>
            </div>

            {/* Color Preview Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Color Preview
              </Label>

              {/* Current Color Display */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl border-4 border-white shadow-lg ring-2 ring-gray-200 dark:ring-gray-600"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Primary Color</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1">
                      {primaryColor}
                    </p>
                  </div>
                </div>

                {/* Color Variations */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Color Variations
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div
                        className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                        style={{
                          backgroundColor: `hsl(${colorHue}, ${colorSaturation}%, ${Math.min(colorLightness + 20, 90)}%)`
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Light</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Primary</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-600"
                        style={{
                          backgroundColor: `hsl(${colorHue}, ${colorSaturation}%, ${Math.max(colorLightness - 20, 10)}%)`
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Dark</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
