
import { useState, useEffect, useCallback } from 'react';
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
  const [colorSaturation, setSaturation] = useState(83);
  const [colorLightness, setLightness] = useState(47);

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
        setSaturation(hsl.s);
        setLightness(hsl.l);
      }
    }
  }, [settings]);

  const handleColorChange = (saturation: number, lightness: number) => {
    setSaturation(saturation);
    setLightness(lightness);
    const newColor = hslToHex(colorHue, saturation, lightness);
    setFormData(prev => ({ ...prev, primary_color: newColor }));
  };

  const handleHueChange = (hue: number) => {
    setColorHue(hue);
    const newColor = hslToHex(hue, colorSaturation, colorLightness);
    setFormData(prev => ({ ...prev, primary_color: newColor }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error auto-saving signature:', error);
      toast({
        title: "Error",
        description: "Failed to save signature. Please try saving settings manually.",
        variant: "destructive",
      });
    }
  }, [updateSettings, toast]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      console.log('=== SAVE SETTINGS DEBUG ===');
      console.log('Current formData:', formData);
      console.log('Logo URL being saved:', formData.logo_url);
      console.log('Signature URL being saved:', formData.headteacher_signature_url);

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
      console.log('Logo URL in result:', result?.logo_url);

      toast({
        title: "Settings Updated",
        description: "School settings have been saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
