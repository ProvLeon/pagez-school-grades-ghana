
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Users, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useStudents } from "@/hooks/useStudents";
import { useResults } from "@/hooks/useResults";
import { useReportCards } from "@/hooks/useReportCards";
import { useToast } from "@/hooks/use-toast";

export const IndividualReportsSection = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024/2025");
  const [selectedStudent, setSelectedStudent] = useState("");
  const { toast } = useToast();
  
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: students = [] } = useStudents({ 
    class_id: selectedClass || undefined,
    has_left: false 
  });
  const { data: results = [] } = useResults();
  const { isGenerating, generateSingleReport, generateBulkReports } = useReportCards();

  const terms = [
    { id: "first", name: "First Term" },
    { id: "second", name: "Second Term" },
    { id: "third", name: "Third Term" }
  ];

  const academicYears = [
    "2024/2025",
    "2023/2024",
    "2022/2023"
  ];

  const getStudentResults = () => {
    if (!selectedClass || !selectedTerm || !selectedYear) return [];
    
    return results.filter(result => 
      result.class_id === selectedClass &&
      result.term === selectedTerm &&
      result.academic_year === selectedYear
    );
  };

  const handleGenerateSingleReport = async () => {
    if (!selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student to generate their report card",
        variant: "destructive"
      });
      return;
    }

    const studentResult = results.find(result => 
      result.student_id === selectedStudent &&
      result.term === selectedTerm &&
      result.academic_year === selectedYear
    );

    if (!studentResult) {
      toast({
        title: "No Results Found",
        description: "No results found for the selected student and term",
        variant: "destructive"
      });
      return;
    }

    await generateSingleReport(studentResult.id);
  };

  const handleGenerateBulkReports = async () => {
    if (!selectedClass || !selectedTerm || !selectedYear) {
      toast({
        title: "Selection Required",
        description: "Please select class, term, and academic year",
        variant: "destructive"
      });
      return;
    }

    await generateBulkReports(selectedClass, selectedTerm, selectedYear);
  };

  const studentResults = getStudentResults();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Configuration Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Individual Report Cards Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="academicYear" className="text-sm">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term" className="text-sm">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department" className="text-sm">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class" className="text-sm">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter(cls => !selectedDepartment || cls.department_id === selectedDepartment)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Selection for Individual Report */}
          {selectedClass && selectedTerm && selectedYear && (
            <div className="border-t pt-4 sm:pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Individual Report */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Generate Individual Report</h4>
                  <div>
                    <Label htmlFor="student" className="text-sm">Select Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name} ({student.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleGenerateSingleReport}
                    disabled={!selectedStudent || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Report Card
                      </>
                    )}
                  </Button>
                </div>

                {/* Bulk Reports */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Generate Class Reports</h4>
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm">Class Summary</span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Students with results: {studentResults.length}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Total students: {students.length}
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateBulkReports}
                    disabled={studentResults.length === 0 || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate All Reports ({studentResults.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            🇬🇭 <span>GES-Compliant Report Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Included Information</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>• School logo and letterhead</li>
                <li>• Student photo and basic information</li>
                <li>• Subject-wise CA and exam scores</li>
                <li>• Grading scale and position rankings</li>
                <li>• Attendance and behavior assessment</li>
                <li>• Teacher and headteacher comments</li>
                <li>• Promotion status and next term dates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">GES Compliance</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>• Approved Ghana Education Service format</li>
                <li>• SBA integration (50% CA + 50% Exam)</li>
                <li>• Proper grading scale implementation</li>
                <li>• Signature areas for authentication</li>
                <li>• Termly academic calendar alignment</li>
                <li>• Professional PDF output quality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
