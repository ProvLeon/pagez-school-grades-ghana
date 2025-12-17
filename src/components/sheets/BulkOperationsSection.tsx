import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  AlertTriangle,
  FileUp,
  Info,
  Users,
  GraduationCap,
  Download,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  XCircle
} from "lucide-react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useCATypes } from "@/hooks/useCATypes";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects, SubjectWithDepartment } from "@/hooks/useSubjects";
import { useExcelParser, ParseResult } from "@/hooks/useExcelParser";
import { useResultsExcelParser, ResultsParseResult } from "@/hooks/useResultsExcelParser";
import { useBulkStudentImport, BulkImportProgress } from "@/hooks/useBulkStudentImport";
import { useBulkResultsImport, BulkResultsImportProgress } from "@/hooks/useBulkResultsImport";
import { TemplateService } from "@/services/templateService";
import { cn } from "@/lib/utils";

type OperationType = "students" | "results";

export const BulkOperationsSection = () => {
  const [activeOperation, setActiveOperation] = useState<OperationType>("students");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetClass, setTargetClass] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [selectedCAType, setSelectedCAType] = useState("");

  // Parse results
  const [studentParseResult, setStudentParseResult] = useState<ParseResult | null>(null);
  const [resultsParseResult, setResultsParseResult] = useState<ResultsParseResult | null>(null);

  // Import progress
  const [importProgress, setImportProgress] = useState<BulkImportProgress | BulkResultsImportProgress | null>(null);

  const { toast } = useToast();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: caTypes = [] } = useCATypes();
  const { data: students = [] } = useStudents({
    class_id: targetClass || undefined,
    has_left: false
  });
  const { data: subjects = [] } = useSubjects();

  // Filter subjects by department for results template
  const getFilteredSubjects = (): SubjectWithDepartment[] => {
    if (targetDepartment) {
      return subjects.filter((s) => s.department_id === targetDepartment);
    }
    return subjects;
  };

  const { parseStudentFile, isLoading: isParsingStudents } = useExcelParser();
  const { parseResultsFile, isLoading: isParsingResults } = useResultsExcelParser();
  const { importStudents, isImporting: isImportingStudents, resetProgress: resetStudentProgress } = useBulkStudentImport();
  const { importResults, isImporting: isImportingResults, resetProgress: resetResultsProgress } = useBulkResultsImport();

  const isParsing = isParsingStudents || isParsingResults;
  const isImporting = isImportingStudents || isImportingResults;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an Excel file (.xlsx or .xls).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setStudentParseResult(null);
    setResultsParseResult(null);
    setImportProgress(null);

    try {
      if (activeOperation === 'students') {
        const result = await parseStudentFile(file);
        setStudentParseResult(result);

        if (result.errors.length > 0) {
          toast({
            title: "File Parsed with Warnings",
            description: `Found ${result.validRows} valid records with ${result.errors.length} issues.`,
            variant: "default"
          });
        } else {
          toast({
            title: "File Parsed Successfully",
            description: `Found ${result.validRows} valid student records ready to import.`
          });
        }
      } else {
        const result = await parseResultsFile(file);
        setResultsParseResult(result);

        if (result.errors.length > 0 || result.warnings.length > 0) {
          toast({
            title: "File Parsed with Issues",
            description: `Found ${result.validRows} valid records. ${result.errors.length} errors, ${result.warnings.length} warnings.`,
            variant: "default"
          });
        } else {
          toast({
            title: "File Parsed Successfully",
            description: `Found ${result.validRows} results for ${result.subjectsFound.length} subjects.`
          });
        }
      }
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse the Excel file. Please check the file format.",
        variant: "destructive"
      });
    }
  }, [activeOperation, parseStudentFile, parseResultsFile, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isParsing || isImporting
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    if (activeOperation === 'students' && studentParseResult?.data) {
      await importStudents.mutateAsync({
        students: studentParseResult.data,
        classId: targetClass || undefined,
        departmentId: targetDepartment || undefined,
        onProgress: setImportProgress
      });
    } else if (activeOperation === 'results' && resultsParseResult?.data) {
      await importResults.mutateAsync({
        results: resultsParseResult.data,
        classId: targetClass || undefined,
        caTypeId: selectedCAType || undefined,
        onProgress: setImportProgress
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStudentParseResult(null);
    setResultsParseResult(null);
    setImportProgress(null);
    setTargetClass("");
    setTargetDepartment("");
    setSelectedCAType("");
    resetStudentProgress();
    resetResultsProgress();
  };

  const handleDownloadTemplate = () => {
    try {
      if (activeOperation === 'students') {
        const className = classes.find(c => c.id === targetClass)?.name;
        const deptName = departments.find(d => d.id === targetDepartment)?.name;
        TemplateService.generateStudentRegistrationTemplate(className, deptName, 50);
        toast({
          title: "Template Downloaded",
          description: "Student registration template has been downloaded."
        });
      } else {
        // Results template - generate directly instead of redirecting
        const className = classes.find(c => c.id === targetClass)?.name;
        const deptName = departments.find(d => d.id === targetDepartment)?.name;
        const filteredSubjects = getFilteredSubjects();

        if (filteredSubjects.length === 0) {
          toast({
            title: "No Subjects Found",
            description: "Please select a department with subjects, or ensure subjects are configured in the system.",
            variant: "destructive"
          });
          return;
        }

        TemplateService.generateResultsEntryTemplate(className, deptName, students, filteredSubjects);
        toast({
          title: "Template Downloaded",
          description: `Results entry template with ${filteredSubjects.length} subjects has been downloaded.`
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate template.",
        variant: "destructive"
      });
    }
  };

  const currentParseResult = activeOperation === 'students' ? studentParseResult : resultsParseResult;
  const hasValidData = activeOperation === 'students'
    ? (studentParseResult?.validRows || 0) > 0
    : (resultsParseResult?.validRows || 0) > 0;

  const getProgressPercentage = () => {
    if (!importProgress) return 0;
    return Math.round((importProgress.current / importProgress.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Operation Type Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Bulk Data Import</CardTitle>
          <CardDescription>
            Import multiple records at once using Excel templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeOperation} onValueChange={(v) => {
            setActiveOperation(v as OperationType);
            handleReset();
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Student Registration
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Results Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-0">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Student Bulk Registration</AlertTitle>
                <AlertDescription>
                  Upload an Excel file with student details to register multiple students at once.
                  Download the template first to ensure your data is in the correct format.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="results" className="mt-0">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Results Bulk Entry</AlertTitle>
                <AlertDescription>
                  Upload student results and marks from an Excel file. Students must already exist in the system.
                  Select your department and class below to download a template with the correct subjects.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Download Template */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <CardTitle className="text-base">
                  {activeOperation === 'students' ? 'Download Template' : 'Select Class & Download Template'}
                </CardTitle>
              </div>
              {activeOperation === 'results' && (
                <p className="text-sm text-muted-foreground mt-1 ml-8">
                  Select department and class to generate a template with the correct subjects
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* For Results: Show selectors first */}
              {activeOperation === 'results' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                  <div>
                    <Label htmlFor="templateDepartment" className="text-sm font-medium">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select value={targetDepartment || ""} onValueChange={(v) => {
                      setTargetDepartment(v);
                      setTargetClass(""); // Reset class when department changes
                    }}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="templateClass" className="text-sm font-medium">
                      Class <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={targetClass || ""}
                      onValueChange={(v) => setTargetClass(v)}
                      disabled={!targetDepartment}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={targetDepartment ? "Select class" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes
                          .filter(cls => cls.department_id === targetDepartment)
                          .map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show subject count when selections are made */}
                  {targetDepartment && targetClass && (
                    <div className="col-span-full">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-muted-foreground">
                          Template will include <span className="font-medium text-foreground">{getFilteredSubjects().length} subjects</span> and <span className="font-medium text-foreground">{students.length} students</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template Download Section */}
              <div className={cn(
                "flex items-center justify-between p-4 border rounded-lg",
                activeOperation === 'results' && (!targetDepartment || !targetClass)
                  ? "bg-muted/10 opacity-60"
                  : "bg-muted/30"
              )}>
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-10 h-10 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {activeOperation === 'students' ? 'Student Registration Template' : 'Results Entry Template'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeOperation === 'students'
                        ? 'Excel file with pre-formatted columns and instructions'
                        : targetDepartment && targetClass
                          ? `Template for ${classes.find(c => c.id === targetClass)?.name || 'selected class'}`
                          : 'Select department and class above to generate'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                  disabled={activeOperation === 'results' && (!targetDepartment || !targetClass)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Configure Options (for students) / Additional Options (for results) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <CardTitle className="text-base">
                  {activeOperation === 'students' ? 'Configure Options (Optional)' : 'Additional Options'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOperation === 'students' && (
                  <>
                    <div>
                      <Label htmlFor="targetDepartment">Department</Label>
                      <Select value={targetDepartment || "__all__"} onValueChange={(v) => setTargetDepartment(v === "__all__" ? "" : v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="targetClass">Class</Label>
                      <Select value={targetClass || "__all__"} onValueChange={(v) => setTargetClass(v === "__all__" ? "" : v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Classes</SelectItem>
                          {classes
                            .filter(cls => !targetDepartment || cls.department_id === targetDepartment)
                            .map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {activeOperation === 'results' && (
                  <div>
                    <Label htmlFor="caType">Assessment Type (SBA)</Label>
                    <Select value={selectedCAType || "__auto__"} onValueChange={(v) => setSelectedCAType(v === "__auto__" ? "" : v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__auto__">Auto-detect from file</SelectItem>
                        {caTypes.map((caType) => (
                          <SelectItem key={caType.id} value={caType.id}>{caType.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      The system will try to detect the assessment type from your file
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Upload File */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <CardTitle className="text-base">Upload Your File</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <input {...getInputProps()} />
                  <FileUp className={cn(
                    "w-12 h-12 mx-auto mb-4",
                    isDragActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {isDragActive ? (
                    <p className="text-primary font-medium">Drop the file here...</p>
                  ) : (
                    <>
                      <p className="font-medium text-foreground mb-1">
                        Drag and drop your Excel file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Select File
                      </Button>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: .xlsx, .xls (max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {!isImporting && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Parsing indicator */}
                  {isParsing && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-700 dark:text-blue-400">
                        Parsing file...
                      </span>
                    </div>
                  )}

                  {/* Import Progress */}
                  {isImporting && importProgress && (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{importProgress.message}</span>
                        <span className="text-muted-foreground">
                          {importProgress.current} / {importProgress.total}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-2" />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {importProgress.phase}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getProgressPercentage()}% complete
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Parse Results & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  4
                </div>
                <CardTitle className="text-base">Review & Import</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parse Results Summary */}
              {currentParseResult && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <h5 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    File Analysis
                  </h5>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-background rounded-md">
                      <p className="text-2xl font-bold text-foreground">
                        {currentParseResult.totalRows}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-2xl font-bold text-green-600">
                        {currentParseResult.validRows}
                      </p>
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <p className="text-2xl font-bold text-red-600">
                        {currentParseResult.errors.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>

                  {/* Results-specific info */}
                  {activeOperation === 'results' && resultsParseResult?.subjectsFound.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Subjects detected:</p>
                      <div className="flex flex-wrap gap-1">
                        {resultsParseResult.subjectsFound.slice(0, 5).map((subject, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {resultsParseResult.subjectsFound.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{resultsParseResult.subjectsFound.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Errors/Warnings */}
                  {currentParseResult.errors.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Issues Found
                      </p>
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {currentParseResult.errors.slice(0, 10).map((error, i) => (
                            <p key={i} className="text-xs text-destructive/80">
                              {error}
                            </p>
                          ))}
                          {currentParseResult.errors.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                              ...and {currentParseResult.errors.length - 10} more
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={!selectedFile || !hasValidData || isImporting || isParsing}
                className="w-full gap-2"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Start Import
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Import Results */}
              {importProgress?.phase === 'complete' && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-400">
                    Import Complete
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-500">
                    Successfully processed {importProgress.current} records.
                    Check the History tab for details.
                  </AlertDescription>
                </Alert>
              )}

              {/* Help Text */}
              {!selectedFile && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">How it works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Download the template</li>
                        <li>Fill in your data</li>
                        <li>Upload the completed file</li>
                        <li>Review and confirm import</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Best Practices for Data Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Student Registration
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Always start with a fresh template to ensure correct format</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Student IDs must be unique - duplicates will be skipped</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Phone numbers should include country code (+233)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Use DD/MM/YYYY format for dates</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Results Entry
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Students must already exist in the system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Use the template from Templates tab for correct subjects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Scores must be between 0 and 100</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>Existing results will be updated, not duplicated</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
