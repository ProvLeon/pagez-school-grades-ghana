
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const SettingsHeader: React.FC = () => {
  const navigate = useNavigate();
  const [showGuides, setShowGuides] = useState(true);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your school configuration and preferences
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuides(!showGuides)}
                className="gap-2 hover:bg-accent transition-colors"
              >
                {showGuides ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showGuides ? "Hide" : "Show"} Guides
              </Button>
            </div>
          </div>

          {/* Guides Section */}
          {showGuides && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">Settings Management Guide</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="space-y-1.5">
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>School Information:</strong> Update school name, address, and contact details</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Branding:</strong> Customize logos, signatures, and color schemes</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Academic Settings:</strong> Configure terms, grading systems, and policies</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>System Preferences:</strong> Adjust notifications and user permissions</span>
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span><strong>Caution:</strong> Changes to settings may affect the entire system</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span><strong>Backup:</strong> Always backup settings before making major changes</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Testing:</strong> Test changes in a development environment first</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Documentation:</strong> Keep records of all configuration changes</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};
