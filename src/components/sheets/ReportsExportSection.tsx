import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileText,
  Trophy,
  BarChart3,
  Users,
  FileSpreadsheet,
  GraduationCap,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  School
} from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { IndividualReportsSection } from "./IndividualReportsSection";
import { ExportService, NoDataError } from "@/services/exportService";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline";
  color: string;
  bgColor: string;
}

export const ReportsExportSection = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024/2025");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();

  const reportTypes: ReportType[] = [
    {
      id: "individual_reports",
      name: "Individual Report Cards",
      description: "Generate GES-compliant report cards for individual students with grades, comments, and signatures.",
      icon: GraduationCap,
      badge: "PDF",
      badgeVariant: "default",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      id: "class_results",
      name: "Class Broadsheet",
      description: "Complete results overview for a class including all subjects, scores, positions, and attendance.",
      icon: FileSpreadsheet,
      badge: "Excel",
      badgeVariant: "secondary",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    {
      id: "position_list",
      name: "Position Rankings",
      description: "Class and department rankings showing student positions based on overall performance.",
      icon: Trophy,
      badge: "Excel",
      badgeVariant: "secondary",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30"
    },
    {
      id: "department_results",
      name: "Department Summary",
      description: "Aggregated performance summary for an entire department with statistics and charts.",
      icon: BarChart3,
      badge: "PDF",
      badgeVariant: "default",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      id: "student_performance",
      name: "Performance Analysis",
      description: "Detailed performance analysis with top performers, improvement areas, and subject breakdown.",
      icon: FileText,
      badge: "Excel",
      badgeVariant: "secondary",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30"
    },
    {
      id: "attendance_summary",
      name: "Attendance Summary",
      description: "Termly attendance report showing presence, absence, and attendance rates for all students.",
      icon: Users,
      badge: "Excel",
      badgeVariant: "secondary",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/30"
    }
  ];

  const terms = [
    { value: "first", label: "First Term" },
    { value: "second", label: "Second Term" },
    { value: "third", label: "Third Term" }
  ];

  const academicYears = ["2024/2025", "2023/2024", "2022/2023"];

  const filteredClasses = selectedDepartment
    ? classes.filter(c => c.department_id === selectedDepartment)
    : classes;

  const selectedReportType = reportTypes.find(r => r.id === selectedReport);

  const canGenerate = selectedReport && selectedTerm && selectedYear;

  const handleGenerateReport = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing Information",
        description: "Please select a report type, term, and academic year.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const filters = {
        academicYear: selectedYear,
        term: terms.find(t => t.value === selectedTerm)?.label || selectedTerm,
        classId: selectedClass || undefined,
        departmentId: selectedDepartment || undefined
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      switch (selectedReport) {
        case "class_results":
          await ExportService.generateClassBroadsheet(filters);
          break;

        case "position_list":
          await ExportService.generatePositionRankings(filters);
          break;

        case "department_results": {
          const deptSummary = await ExportService.generateDepartmentSummary(filters);
          // For now, export as Excel (PDF generation would require jsPDF)
          const deptData = [
            ['Department Summary Report'],
            [''],
            ['Department:', deptSummary.summary.departmentName],
            ['Total Students:', deptSummary.summary.totalStudents],
            ['Average Score:', deptSummary.summary.averageScore],
            ['Pass Rate:', `${deptSummary.summary.passRate}%`],
            [''],
            ['Grade Distribution:'],
            ['Grade', 'Count', 'Percentage'],
            ...deptSummary.summary.gradeDistribution.map(g => [g.grade, g.count, `${g.percentage}%`]),
            [''],
            ['Class Performance:'],
            ['Class', 'Average', 'Pass Rate'],
            ...deptSummary.summary.classPerformance.map(c => [c.className, c.average, `${c.passRate}%`])
          ];
          ExportService.exportToExcel(
            deptData,
            'Department Summary',
            `Department_Summary_${filters.term.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            { columnWidths: [20, 15, 15] }
          );
          break;
        }

        case "student_performance": {
          const perfData = await ExportService.generateStudentPerformance(filters);
          const perfExport = [
            ['Student Performance Analysis'],
            [''],
            ['Academic Year:', filters.academicYear, '', 'Term:', filters.term],
            [''],
            ['TOP PERFORMERS'],
            ['Rank', 'Student ID', 'Name', 'Class', 'Average', 'Grade'],
            ...perfData.analysis.topPerformers.map((s, i) => [
              i + 1, s.student_id, s.student_name, s.class_name, s.average, s.grade
            ]),
            [''],
            ['NEEDS IMPROVEMENT'],
            ['Rank', 'Student ID', 'Name', 'Class', 'Average', 'Grade'],
            ...perfData.analysis.needsImprovement.map((s, i) => [
              i + 1, s.student_id, s.student_name, s.class_name, s.average, s.grade
            ]),
            [''],
            ['SUBJECT ANALYSIS'],
            ['Subject', 'Average', 'Highest', 'Lowest', 'Pass Rate'],
            ...perfData.analysis.subjectAnalysis.map(s => [
              s.subject, s.averageScore, s.highestScore, s.lowestScore, `${s.passRate}%`
            ])
          ];
          ExportService.exportToExcel(
            perfExport,
            'Performance Analysis',
            `Performance_Analysis_${filters.term.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            { columnWidths: [8, 12, 25, 15, 10, 8] }
          );
          break;
        }

        case "attendance_summary": {
          const attData = await ExportService.generateAttendanceSummary(filters);
          const attExport = [
            ['Attendance Summary Report'],
            [''],
            ['Academic Year:', filters.academicYear, '', 'Term:', filters.term],
            [''],
            ['SUMMARY'],
            ['Total Students:', attData.summary.totalStudents],
            ['Average Attendance:', `${attData.summary.averageAttendance}%`],
            ['Perfect Attendance:', attData.summary.perfectAttendance],
            ['Below 80% Threshold:', attData.summary.belowThreshold],
            [''],
            ['STUDENT DETAILS'],
            ['Student ID', 'Name', 'Class', 'Days Present', 'Days Absent', 'Days Opened', 'Attendance Rate'],
            ...attData.students.map(s => [
              s.studentId, s.studentName, s.className, s.daysPresent, s.daysAbsent, s.daysOpened, `${s.attendanceRate}%`
            ])
          ];
          ExportService.exportToExcel(
            attExport,
            'Attendance Summary',
            `Attendance_Summary_${filters.term.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            { columnWidths: [12, 25, 15, 12, 12, 12, 15] }
          );
          break;
        }

        default:
          throw new Error('Unknown report type');
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const reportName = selectedReportType?.name || 'Report';
      setLastGenerated(reportName);

      toast({
        title: "Report Generated Successfully",
        description: `${reportName} has been downloaded.`,
      });

    } catch (error: unknown) {
      console.error('Error generating report:', error);

      // Handle "no data" scenarios differently from actual errors
      if (error instanceof NoDataError) {
        toast({
          title: "No Data Available",
          description: error.message,
        });
      } else if (error instanceof Error) {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate report. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate report. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  const handleResetFilters = () => {
    setSelectedClass("");
    setSelectedDepartment("");
    setSelectedTerm("");
    setSelectedYear("2024/2025");
  };

  // Show Individual Reports section if selected
  if (selectedReport === "individual_reports") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedReport("")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report Types
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Individual Report Cards</h2>
            <p className="text-sm text-muted-foreground">
              Generate PDF report cards for individual students
            </p>
          </div>
        </div>
        <IndividualReportsSection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Select Report Type
              </CardTitle>
              <CardDescription>
                Choose the type of report you want to generate
              </CardDescription>
            </div>
            {selectedReportType && (
              <Badge variant={selectedReportType.badgeVariant} className="text-sm">
                {selectedReportType.badge} Format
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:border-primary/50",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2.5 rounded-lg shrink-0",
                      report.bgColor
                    )}>
                      <Icon className={cn("w-5 h-5", report.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {report.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-2 text-[10px] px-1.5 py-0"
                      >
                        {report.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-primary" />
                Configure Report Filters
              </CardTitle>
              <CardDescription>
                Narrow down the data to include in your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Year */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Academic Year <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <Label htmlFor="term" className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Term <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger id="term">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map(term => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Department
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={(value) => {
                      setSelectedDepartment(value === "__all__" ? "" : value);
                      setSelectedClass(""); // Reset class when department changes
                    }}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <Label htmlFor="class" className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-muted-foreground" />
                    Class
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    value={selectedClass}
                    onValueChange={(value) => setSelectedClass(value === "__all__" ? "" : value)}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Classes</SelectItem>
                      {filteredClasses.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reset button */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-muted-foreground"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="w-4 h-4 text-primary" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Report Summary */}
              {selectedReportType ? (
                (() => {
                  const ReportIcon = selectedReportType.icon;
                  return (
                    <div className={cn(
                      "p-3 rounded-lg border",
                      selectedReportType.bgColor
                    )}>
                      <div className="flex items-center gap-2">
                        <ReportIcon className={cn("w-4 h-4", selectedReportType.color)} />
                        <span className="font-medium text-sm">{selectedReportType.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedReportType.badge} format
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="p-3 rounded-lg border border-dashed bg-muted/50 text-center">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Select a report type to continue
                  </p>
                </div>
              )}

              {/* Filter Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium">{selectedYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term:</span>
                  <span className="font-medium">
                    {terms.find(t => t.value === selectedTerm)?.label || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">
                    {departments.find(d => d.id === selectedDepartment)?.name || 'All'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">
                    {classes.find(c => c.id === selectedClass)?.name || 'All'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generating...</span>
                    <span className="font-medium">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={!canGenerate || isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate & Download
                  </>
                )}
              </Button>

              {/* Last Generated */}
              {lastGenerated && !isGenerating && (
                <div className="flex items-center gap-2 text-xs text-green-600 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Last: {lastGenerated}</span>
                </div>
              )}

              {/* Requirements Notice */}
              {!canGenerate && (
                <p className="text-xs text-muted-foreground text-center">
                  <span className="text-destructive">*</span> Required fields must be selected
                </p>
              )}

              {/* Data Requirements Info */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 text-xs font-medium">Data Required</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs">
                  Reports are generated from student results. Ensure results have been entered for the selected term and year.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Need Help?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select a report type from the grid above, configure your filters (academic year and term are required),
                then click "Generate & Download" to create your report. Excel files can be opened in Microsoft Excel
                or Google Sheets. PDF reports are print-ready for physical distribution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
