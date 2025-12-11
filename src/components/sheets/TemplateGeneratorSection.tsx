import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Users, GraduationCap, UserCheck, Calendar, Download, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/use-toast";
import { useCreateSheetTemplate } from "@/hooks/useSheetTemplates";
import { TemplateService } from "@/services/templateService";

export const TemplateGeneratorSection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const { toast } = useToast();

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: students = [] } = useStudents({
    class_id: selectedClass || undefined,
    has_left: false
  });
  const { data: subjects = [] } = useSubjects();
  const createTemplate = useCreateSheetTemplate();

  const templateTypes = [
    {
      id: "student_registration",
      name: "Student Registration",
      description: "Bulk upload new students.",
      icon: Users,
    },
    {
      id: "results_entry",
      name: "Results Entry",
      description: "Upload student marks and grades.",
      icon: GraduationCap,
    },
    {
      id: "attendance",
      name: "Attendance",
      description: "Track daily student attendance.",
      icon: UserCheck,
    },
    {
      id: "teacher_assignment",
      name: "Teacher Assignment",
      description: "Assign teachers to subjects.",
      icon: Calendar,
    }
  ];

  const getSelectedClassName = () => classes.find(c => c.id === selectedClass)?.name;
  const getSelectedDepartmentName = () => departments.find(d => d.id === selectedDepartment)?.name;

  const getFilteredSubjects = () => {
    if (selectedDepartment) {
      return subjects.filter(s => s.department_id === selectedDepartment);
    }
    return subjects;
  };

  const handleDownloadTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template type to download.",
        variant: "destructive"
      });
      return;
    }

    const className = getSelectedClassName();
    const departmentName = getSelectedDepartmentName();
    const templateType = templateTypes.find(t => t.id === selectedTemplate);

    try {
      switch (selectedTemplate) {
        case 'student_registration':
          TemplateService.generateStudentRegistrationTemplate(className, departmentName, parseInt(studentCount) || 50);
          break;
        case 'results_entry':
          TemplateService.generateResultsEntryTemplate(className, departmentName, students, getFilteredSubjects());
          break;
        case 'attendance':
          TemplateService.generateAttendanceTemplate(className, students);
          break;
        default:
          toast({
            title: "Template Not Available",
            description: "This template type is not yet implemented.",
            variant: "destructive"
          });
          return;
      }

      createTemplate.mutate({
        name: `${templateType?.name} - ${className || 'All Classes'}`,
        type: selectedTemplate as any,
        description: `Generated for ${departmentName || 'All Depts'} - ${className || 'All Classes'}`,
        department_id: selectedDepartment || undefined,
        class_id: selectedClass || undefined,
        template_config: { generatedAt: new Date().toISOString() }
      });

      toast({
        title: "Template Downloaded",
        description: `${templateType?.name} has been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate the template. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Template Type</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateTypes.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTemplate === template.id
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                      <template.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>2. Configure Options</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes
                        .filter(cls => !selectedDepartment || cls.department_id === selectedDepartment)
                        .map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplate === 'student_registration' && (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="studentCount">Expected Student Count</Label>
                    <Input
                      id="studentCount"
                      type="number"
                      placeholder="e.g., 50"
                      value={studentCount}
                      onChange={(e) => setStudentCount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>3. Download</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                  <h5 className="font-semibold text-foreground">Summary</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li><strong>Type:</strong> {templateTypes.find(t => t.id === selectedTemplate)?.name || 'Not selected'}</li>
                    {selectedDepartment && <li><strong>Dept:</strong> {getSelectedDepartmentName()}</li>}
                    {selectedClass && <li><strong>Class:</strong> {getSelectedClassName()} ({students.length} students)</li>}
                    {selectedTemplate === 'results_entry' && selectedDepartment && (
                      <li><strong>Subjects:</strong> {getFilteredSubjects().length} subjects</li>
                    )}
                    {selectedTemplate === 'student_registration' && studentCount && (
                      <li><strong>Rows:</strong> {studentCount} student rows</li>
                    )}
                  </ul>
                </div>
                <Button
                  onClick={handleDownloadTemplate}
                  className="w-full"
                  disabled={!selectedTemplate || createTemplate.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {createTemplate.isPending ? 'Generating...' : 'Download Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="flex items-center gap-2 text-base">*/}
      {/*      <Info className="w-5 h-5 text-muted-foreground" />*/}
      {/*      About Our Templates*/}
      {/*    </CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">*/}
      {/*    <div>*/}
      {/*      <h4 className="font-semibold text-foreground mb-3">Ghana-Specific Features</h4>*/}
      {/*      <ul className="space-y-3 text-sm text-muted-foreground">*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Templates include fields for Ghana Card numbers and region-aware addresses.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>The results entry template is aligned with the official GES assessment structure.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Phone number fields are pre-formatted for the +233 country code.</span>*/}
      {/*        </li>*/}
      {/*      </ul>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <h4 className="font-semibold text-foreground mb-3">General Benefits</h4>*/}
      {/*      <ul className="space-y-3 text-sm text-muted-foreground">*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Reduces errors by pre-filling class lists and subject details where applicable.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Includes built-in data validation and dropdown lists to ensure data integrity.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Standardized formatting prevents common errors during the bulk upload process.</span>*/}
      {/*        </li>*/}
      {/*      </ul>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};
