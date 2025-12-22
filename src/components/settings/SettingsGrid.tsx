import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoUpload } from '@/components/LogoUpload';
import { InteractiveColorPicker } from '@/components/InteractiveColorPicker';
import { School, MapPin, Quote, Phone, Navigation, User, Palette, Image, PenTool } from 'lucide-react';
import { Suspense } from 'react';
const SignatureUpload = React.lazy(() => import('@/components/SignatureUpload'));

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
    <div className="grid gap-4 md:gap-6">
      {/* Top Row - School Info on left, Logo & Signature stacked on right */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr,320px]">
        {/* School Information - Main content */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              School Information
            </CardTitle>
            <CardDescription>Update your school's essential details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="school_name" className="text-sm">School Name *</Label>
                  <div className="relative">
                    <School className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="school_name"
                      value={formData.school_name}
                      onChange={(e) => onInputChange('school_name', e.target.value)}
                      placeholder="Enter school name"
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="headteacher_name" className="text-sm">Headteacher Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="headteacher_name"
                      value={formData.headteacher_name}
                      onChange={(e) => onInputChange('headteacher_name', e.target.value)}
                      placeholder="Enter headteacher's name"
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="motto" className="text-sm">School Motto</Label>
                <div className="relative">
                  <Quote className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="motto"
                    value={formData.motto}
                    onChange={(e) => onInputChange('motto', e.target.value)}
                    placeholder="Enter school motto"
                    className="pl-10 h-9"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact & Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm">Location/City</Label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => onInputChange('location', e.target.value)}
                      placeholder="e.g., Accra, Ghana"
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => onInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address_1" className="text-sm">Address</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address_1"
                    value={formData.address_1}
                    onChange={(e) => onInputChange('address_1', e.target.value)}
                    placeholder="School address"
                    className="pl-10 h-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Logo & Signature stacked */}
        <div className="space-y-4 md:space-y-6">
          {/* School Logo */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                School Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LogoUpload
                currentLogoUrl={formData.logo_url}
                onLogoChange={onLogoChange}
              />
            </CardContent>
          </Card>

          {/* Headteacher Signature */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                Headteacher Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                <SignatureUpload
                  currentSignatureUrl={formData.headteacher_signature_url}
                  onSignatureChange={onSignatureChange}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Theme Colors full width */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme Colors
          </CardTitle>
          <CardDescription>Customize your school's brand color used throughout the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveColorPicker
            hue={colorHue}
            saturation={colorSaturation}
            lightness={colorLightness}
            onColorChange={onColorChange}
            onHueChange={onHueChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
