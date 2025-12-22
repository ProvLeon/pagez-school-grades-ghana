import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/hooks/useSchoolSettings';
import { hexToHsl, hslToHex } from '@/utils/colorUtils';

export const useSettingsForm = () => {
  const {
    settings,
    loading,
    updateSettings
  } = useSchoolSettings();

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    school_name: '',
    location: '',
    address_1: '',
    phone: '',
    motto: '',
    headteacher_name: '',
    primary_color: '#e11d48',
    logo_url: null as string | null,
    headteacher_signature_url: null as string | null
  });

  // Color picker state
  const [colorHue, setColorHue] = useState(348);
  const [colorSaturation, setColorSaturation] = useState(83);
  const [colorLightness, setColorLightness] = useState(47);

  // Refs to track current color values (avoids stale closure issues)
  const colorHueRef = useRef(colorHue);
  const colorSaturationRef = useRef(colorSaturation);
  const colorLightnessRef = useRef(colorLightness);

  // Keep refs in sync with state
  useEffect(() => {
    colorHueRef.current = colorHue;
  }, [colorHue]);

  useEffect(() => {
    colorSaturationRef.current = colorSaturation;
  }, [colorSaturation]);

  useEffect(() => {
    colorLightnessRef.current = colorLightness;
  }, [colorLightness]);

  // Load settings into form when available
  useEffect(() => {
    if (settings) {
      console.log('Loading settings into form:', settings);
      setFormData({
        school_name: settings.school_name || '',
        location: settings.location || '',
        address_1: settings.address_1 || '',
        phone: settings.phone || '',
        motto: settings.motto || '',
        headteacher_name: settings.headteacher_name || '',
        primary_color: settings.primary_color || '#e11d48',
        logo_url: settings.logo_url || null,
        headteacher_signature_url: settings.headteacher_signature_url || null
      });

      // Convert hex to HSL for color picker
      if (settings.primary_color) {
        const hsl = hexToHsl(settings.primary_color);
        setColorHue(hsl.h);
        setColorSaturation(hsl.s);
        setColorLightness(hsl.l);
        // Also update refs immediately
        colorHueRef.current = hsl.h;
        colorSaturationRef.current = hsl.s;
        colorLightnessRef.current = hsl.l;
      }
    }
  }, [settings]);

  const handleColorChange = useCallback((saturation: number, lightness: number) => {
    setColorSaturation(saturation);
    setColorLightness(lightness);
    // Update refs immediately for use in handleHueChange
    colorSaturationRef.current = saturation;
    colorLightnessRef.current = lightness;
    // Use ref for hue to get the latest value
    const newColor = hslToHex(colorHueRef.current, saturation, lightness);
    setFormData(prev => ({ ...prev, primary_color: newColor }));
  }, []);

  const handleHueChange = useCallback((hue: number) => {
    setColorHue(hue);
    // Update ref immediately
    colorHueRef.current = hue;
    // Use refs to get the latest saturation and lightness values
    const newColor = hslToHex(hue, colorSaturationRef.current, colorLightnessRef.current);
    setFormData(prev => ({ ...prev, primary_color: newColor }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogoChange = useCallback(async (logoUrl: string | null) => {
    console.log('Logo URL changed to:', logoUrl);
    setFormData(prev => ({ ...prev, logo_url: logoUrl }));

    // Auto-save logo URL to database immediately after upload
    try {
      console.log('Auto-saving logo URL to database...');
      await updateSettings({ logo_url: logoUrl });
      toast({
        title: "Logo Updated",
        description: logoUrl ? "School logo has been saved" : "School logo has been removed",
      });
    } catch (error) {
      console.error('Error auto-saving logo:', error);
      toast({
        title: "Error",
        description: "Failed to save logo. Please try saving settings manually.",
        variant: "destructive",
      });
    }
  }, [updateSettings, toast]);

  const handleSignatureChange = useCallback(async (signatureUrl: string | null) => {
    console.log('Signature URL changed to:', signatureUrl);
    setFormData(prev => ({ ...prev, headteacher_signature_url: signatureUrl }));

    // Auto-save signature URL to database immediately after upload
    try {
      console.log('Auto-saving signature URL to database...');
      await updateSettings({ headteacher_signature_url: signatureUrl });
      toast({
        title: "Signature Updated",
        description: signatureUrl ? "Headteacher signature has been saved" : "Signature has been removed",
      });
    } catch (error) {
      console.error('Error auto-saving signature:', error);
      toast({
        title: "Error",
        description: "Failed to save signature. Please try saving settings manually.",
        variant: "destructive",
      });
    }
  }, [updateSettings, toast]);

  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      console.log('=== SAVE SETTINGS DEBUG ===');
      console.log('Current formData:', formData);
      console.log('Primary color being saved:', formData.primary_color);

      // Prepare the update data
      const updateData = {
        school_name: formData.school_name,
        location: formData.location || null,
        address_1: formData.address_1 || null,
        phone: formData.phone || null,
        motto: formData.motto || null,
        headteacher_name: formData.headteacher_name || null,
        primary_color: formData.primary_color,
        logo_url: formData.logo_url,
        headteacher_signature_url: formData.headteacher_signature_url
      };

      console.log('Update data being sent:', updateData);

      const result = await updateSettings(updateData);

      console.log('Update result:', result);

      toast({
        title: "Settings Updated",
        description: "School settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [formData, updateSettings, toast]);

  return {
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
  };
};
