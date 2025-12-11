import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trophy, BarChart3, Users, FileSpreadsheet, GraduationCap, ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { IndividualReportsSection } from "./IndividualReportsSection";

export const ReportsExportSection = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024/2025");
  const { toast } = useToast();

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();

  const reportTypes = [
    { id: "individual_reports", name: "Individual Report Cards", description: "GES-compliant report cards.", icon: GraduationCap, badge: "PDF" },
    { id: "class_results", name: "Class Broadsheet", description: "Results overview for a class.", icon: FileSpreadsheet, badge: "Excel" },
    { id: "department_results", name: "Department Summary", description: "Performance summary.", icon: BarChart3, badge: "PDF" },
    { id: "student_performance", name: "Student Performance", description: "Detailed performance analysis.", icon: FileText, badge: "PDF" },
    { id: "position_list", name: "Position Rankings", description: "Class and department rankings.", icon: Trophy, badge: "Excel" },
    { id: "attendance_summary", name: "Attendance Summary", description: "Termly attendance report.", icon: Users, badge: "PDF" }
  ];

  const terms = ["First Term", "Second Term", "Third Term"];
  const academicYears = ["2024/2025", "2023/2024", "2022/2023"];

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({ title: "Report Type Required", description: "Please select a report type.", variant: "destructive" });
      return;
    }
    toast({ title: "Report Generated", description: `${reportTypes.find(r => r.id === selectedReport)?.name} is being prepared.` });
  };

  if (selectedReport === "individual_reports") {
    return (
      <div>
        <Button variant="outline" onClick={() => setSelectedReport("")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Report Types
        </Button>
        <IndividualReportsSection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Report Type</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReport === report.id ? 'border-primary bg-muted' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                      <report.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{report.name}</h3>
                        <Badge variant="outline">{report.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>2. Configure & Download</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Academic Year</Label>
                  <Select value={selectedYear} onValuechange={setSelectedYear}>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>{academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                    <SelectContent>{terms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                    <SelectContent>
                      {classes
                        .filter(c => !selectedDepartment || c.department_id === selectedDepartment)
                        .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerateReport} className="w-full" disabled={!selectedReport}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="flex items-center gap-2 text-base">*/}
      {/*      <Info className="w-5 h-5 text-muted-foreground" />*/}
      {/*      How to Export Reports*/}
      {/*    </CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <p className="text-sm text-muted-foreground leading-relaxed">*/}
      {/*      To generate a report, first select the desired type from the list. Use the configuration options to filter by academic year, term, department, or class as needed. Once you have made your selections, click the "Generate Report" button to begin the download. For individual student report cards, selecting that option will open a dedicated section with more detailed controls.*/}
      {/*    </p>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};