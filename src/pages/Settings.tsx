import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogoUpload } from '@/components/LogoUpload';
import { InteractiveColorPicker } from '@/components/InteractiveColorPicker';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Save,
  AlertCircle,
  School,
  MapPin,
  Quote,
  Phone,
  Navigation,
  User,
  Palette,
  Image,
  PenTool,
  CheckCircle2,
  Settings as SettingsIcon,
  Building2,
  Sparkles,
  Loader2,
  CreditCard
} from "lucide-react";
import { SettingsLoadingState } from '@/components/settings/SettingsLoadingState';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { WalkthroughTrigger } from '@/components/walkthrough';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
const SignatureUpload = React.lazy(() => import('@/components/SignatureUpload'));
import { BillingAdminSettings } from '@/components/settings/BillingAdminSettings';

type SettingsTab = 'school' | 'branding' | 'billing';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [setupRequired, setSetupRequired] = useState(searchParams.get('setup') === 'required');
  const [activeTab, setActiveTab] = useState<SettingsTab>('school');

  // Function to clear setup required state and URL param after successful save
  const clearSetupRequired = useCallback(() => {
    setSetupRequired(false);
    if (searchParams.get('setup') === 'required') {
      searchParams.delete('setup');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const {
    loading,
    saving,
    isDirty,
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

  // Auto-clear setup required if organization/settings are already complete
  React.useEffect(() => {
    if (!loading && formData.school_name && formData.location) {
      // Settings are already complete, clear any setup required state
      clearSetupRequired();
    }
  }, [loading, formData.school_name, formData.location, clearSetupRequired]);

  // Check completion status for each section
  const schoolInfoComplete = Boolean(
    formData.school_name &&
    formData.location
  );

  const brandingComplete = Boolean(
    formData.logo_url || formData.primary_color
  );

  const tabs = [
    {
      id: 'school' as SettingsTab,
      label: 'School Information',
      icon: Building2,
      description: 'Basic details & contact',
      complete: schoolInfoComplete
    },
    {
      id: 'branding' as SettingsTab,
      label: 'Branding & Theme',
      icon: Palette,
      description: 'Logo, signature & colors',
      complete: brandingComplete
    }
  ];

  if (isAdmin) {
    tabs.push({
      id: 'billing' as SettingsTab,
      label: 'Billing',
      icon: CreditCard,
      description: 'Subscription & billing',
      complete: true
    });
  }

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
      <Header
        title="Settings"
        subtitle="Manage your school's information and customize the appearance"
      />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Setup Alert */}
        {setupRequired && (
          <Alert variant="destructive" className="mb-6 bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertTitle className="font-semibold">Setup Required</AlertTitle>
            <AlertDescription>
              Your account is not fully configured yet. Please verify your school details below and click "Save Settings" to complete setup.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Tab Navigation */}
          <aside className="lg:w-72 shrink-0">
            <Card className="sticky top-24 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Quick Navigation</CardTitle>
                    <CardDescription className="text-xs">Jump to a section</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav data-tour="settings-nav" className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <tab.icon className={cn(
                        "w-5 h-5 shrink-0",
                        activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          activeTab === tab.id ? "text-primary-foreground" : ""
                        )}>
                          {tab.label}
                        </p>
                        <p className={cn(
                          "text-xs truncate",
                          activeTab === tab.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {tab.description}
                        </p>
                      </div>
                      {tab.complete && (
                        <CheckCircle2 className={cn(
                          "w-4 h-4 shrink-0",
                          activeTab === tab.id ? "text-primary-foreground" : "text-green-500"
                        )} />
                      )}
                    </button>
                  ))}
                </nav>

                <Separator className="my-4" />

                {/* Walkthrough Trigger */}
                <div data-tour="settings-restart-tour" className="space-y-3">
                  <WalkthroughTrigger variant="button" />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div data-tour="settings-content" className="flex-1 space-y-6">
            {/* School Information Tab */}
            {activeTab === 'school' && (
              <div className="space-y-6 animate-fade-in">
                {/* School Details Card */}
                <Card className="shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <School className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">School Details</CardTitle>
                        <CardDescription>
                          Update your school's name, motto, and leadership information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school_name" className="text-sm font-medium flex items-center gap-2">
                          <School className="w-3.5 h-3.5 text-muted-foreground" />
                          School Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="school_name"
                          value={formData.school_name}
                          onChange={(e) => handleInputChange('school_name', e.target.value)}
                          placeholder="Enter your school name"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headteacher_name" className="text-sm font-medium flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Headteacher Name
                        </Label>
                        <Input
                          id="headteacher_name"
                          value={formData.headteacher_name}
                          onChange={(e) => handleInputChange('headteacher_name', e.target.value)}
                          placeholder="Enter headteacher's full name"
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motto" className="text-sm font-medium flex items-center gap-2">
                        <Quote className="w-3.5 h-3.5 text-muted-foreground" />
                        School Motto
                      </Label>
                      <Input
                        id="motto"
                        value={formData.motto}
                        onChange={(e) => handleInputChange('motto', e.target.value)}
                        placeholder="Enter your school's motto or slogan"
                        className="h-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact & Location Card */}
                <Card className="shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Contact & Location</CardTitle>
                        <CardDescription>
                          How students and parents can reach and find your school
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                          <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
                          City / Region <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Accra, Greater Accra"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_1" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        Full Address
                      </Label>
                      <Input
                        id="address_1"
                        value={formData.address_1}
                        onChange={(e) => handleInputChange('address_1', e.target.value)}
                        placeholder="Street address, P.O. Box, or landmark"
                        className="h-10"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fade-in">
                <BillingAdminSettings />
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6 animate-fade-in">
                {/* Logo & Signature Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* School Logo Card */}
                  <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <Image className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">School Logo</CardTitle>
                          <CardDescription className="text-xs">
                            Displayed on reports and documents
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LogoUpload
                        currentLogoUrl={formData.logo_url}
                        onLogoChange={handleLogoChange}
                      />
                    </CardContent>
                  </Card>

                  {/* Headteacher Signature Card */}
                  <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <PenTool className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Headteacher Signature</CardTitle>
                          <CardDescription className="text-xs">
                            Used on official report sheets
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Suspense fallback={
                        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      }>
                        <SignatureUpload
                          currentSignatureUrl={formData.headteacher_signature_url}
                          onSignatureChange={handleSignatureChange}
                        />
                      </Suspense>
                    </CardContent>
                  </Card>
                </div>

                {/* Theme Colors Card */}
                <Card className="shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Report Theme Color
                            <Badge variant="secondary" className="text-xs font-normal">
                              <Sparkles className="w-3 h-3 mr-1" />
                              For Reports Only
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Choose a brand color for your school's report sheets and exported documents
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <InteractiveColorPicker
                      hue={colorHue}
                      saturation={colorSaturation}
                      lightness={colorLightness}
                      onColorChange={handleColorChange}
                      onHueChange={handleHueChange}
                    />

                    {/* Color Preview Info */}
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg shadow-inner shrink-0"
                          style={{ backgroundColor: formData.primary_color || `hsl(${colorHue}, ${colorSaturation}%, ${colorLightness}%)` }}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Preview</p>
                          <p className="text-xs text-muted-foreground">
                            This color will be used for headers, borders, and accents on student report sheets
                            and exported PDFs. The main application will continue using the default blue theme.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Bar — only shown when there are unsaved changes outside the billing tab */}
            {activeTab !== 'billing' && isDirty && (
              <Card className="shadow-sm border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={cn(
                        "w-4 h-4",
                        schoolInfoComplete && brandingComplete ? "text-green-500" : "text-muted-foreground/50"
                      )} />
                      <span>
                        {schoolInfoComplete && brandingComplete
                          ? "All sections complete"
                          : "Complete required fields to save"}
                      </span>
                    </div>
                    <Button
                      onClick={async () => {
                        await handleSaveSettings();
                        clearSetupRequired();
                      }}
                      disabled={saving || !formData.school_name}
                      size="lg"
                      className="gap-2 min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
