import { useState } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGeneratorSection } from "@/components/sheets/TemplateGeneratorSection";
import { BulkOperationsSection } from "@/components/sheets/BulkOperationsSection";
import { ReportsExportSection } from "@/components/sheets/ReportsExportSection";
import { SheetOperationsHistory } from "@/components/sheets/SheetOperationsHistory";
// import { SheetsStatsCards } from "@/components/sheets/SheetsStatsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Upload,
  Download,
  History,
  Info,
  CheckCircle2,
  ArrowRight,
  Users,
  GraduationCap,
  FileText
} from "lucide-react";

const ManageSheets = () => {
  const [activeTab, setActiveTab] = useState("bulk-ops");

  const workflowSteps = [
    {
      step: 1,
      title: "Download Template",
      description: "Get a pre-formatted Excel template",
      icon: FileSpreadsheet,
    },
    {
      step: 2,
      title: "Fill Data",
      description: "Enter student or results data offline",
      icon: FileText,
    },
    {
      step: 3,
      title: "Upload & Import",
      description: "Upload and bulk import records",
      icon: Upload,
    },
    {
      step: 4,
      title: "Review & Export",
      description: "Generate reports and broadsheets",
      icon: Download,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Sheet Management"
        subtitle="Bulk import students and results, generate templates, and export reports"
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Workflow Overview */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Quick Workflow</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Bulk Operations Made Easy
              </Badge>
            </div>
            <CardDescription>
              Follow these steps to bulk import students or results using Excel files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((item, index) => (
                <div
                  key={item.step}
                  className="relative flex items-start gap-3 p-3 rounded-lg bg-background border"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {/*<SheetsStatsCards />*/}

        {/* Main Tabs */}
        <Tabs defaultValue="bulk-ops" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="bulk-ops"
              className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Import</span>
              <span className="sm:hidden">Import</span>
            </TabsTrigger>
            {/*<TabsTrigger
              value="templates"
              className="gap-2 py-2.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Templates
            </TabsTrigger>*/}
            <TabsTrigger
              value="reports"
              className="gap-2 py-2.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Reports & Export</span>
              <span className="sm:hidden">Export</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="gap-2 py-2.5"
            >
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bulk-ops" className="mt-6">
            <BulkOperationsSection />
          </TabsContent>

          {/*<TabsContent value="templates" className="mt-6">
            <TemplateGeneratorSection />
          </TabsContent>*/}

          <TabsContent value="reports" className="mt-6">
            <ReportsExportSection />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <SheetOperationsHistory />
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              What You Can Do Here
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Bulk Student Registration</h4>
                  <p className="text-sm text-muted-foreground">
                    Import dozens or hundreds of students at once using an Excel template.
                    Perfect for new academic year enrollments.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Bulk Results Entry</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload student marks and grades from Excel.
                    Teachers can fill scores offline and upload when ready.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Report Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Export broadsheets, report cards, and analytics.
                    Generate professional PDF reports for printing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageSheets;
