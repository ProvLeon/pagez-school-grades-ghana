
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle, X, AlertTriangle, FileUp, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useCreateSheetOperation } from "@/hooks/useSheetOperations";
import { useExcelParser } from "@/hooks/useExcelParser";
import { supabase } from "@/lib/supabase";

export const BulkOperationsSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [operationType, setOperationType] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResult, setParseResult] = useState<any>(null);
  const { toast } = useToast();

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const createOperation = useCreateSheetOperation();
  const { parseStudentFile, isLoading: isParsing } = useExcelParser();

  const operationTypes = [
    {
      id: "student_upload",
      name: "Student Bulk Upload",
      description: "Upload multiple students from an Excel file.",
      icon: Upload,
    },
    {
      id: "results_upload",
      name: "Results Bulk Upload",
      description: "Upload student results and marks.",
      icon: FileText,
    }
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid File Type", description: "Please select an Excel file (.xlsx or .xls).", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Please select a file smaller than 10MB.", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setParseResult(null);

    if (operationType === 'student_upload') {
      try {
        const result = await parseStudentFile(file);
        setParseResult(result);
        if (result.errors.length > 0) {
          toast({ title: "Parse Warnings", description: `File parsed with ${result.errors.length} warnings.`, variant: "default" });
        } else {
          toast({ title: "File Parsed", description: `Found ${result.validRows} valid student records.` });
        }
      } catch (error) {
        toast({ title: "Parse Error", description: "Failed to parse the Excel file.", variant: "destructive" });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !operationType) {
      toast({ title: "Missing Information", description: "Please select a file and operation type.", variant: "destructive" });
      return;
    }
    if (operationType === 'student_upload' && (!parseResult || parseResult.validRows === 0)) {
      toast({ title: "No Valid Data", description: "The file contains no valid student data to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const operationData = await createOperation.mutateAsync({
        operation_type: operationType as any,
        file_name: selectedFile.name,
        status: 'pending',
        total_records: parseResult?.validRows || 0,
        metadata: { fileSize: selectedFile.size, targetClass, targetDepartment }
      });

      setUploadProgress(30);

      if (operationType === 'student_upload' && parseResult?.data) {
        const enhancedStudents = parseResult.data.map((student: any) => ({
          ...student,
          class_id: targetClass || student.class_id,
          department_id: targetDepartment || student.department_id
        }));

        setUploadProgress(50);

        const { data: result, error } = await supabase.functions.invoke('process-student-upload', {
          body: { operation_id: operationData.id, students: enhancedStudents }
        });

        setUploadProgress(90);
        if (error) throw new Error(error.message);

        setUploadProgress(100);
        if (result.success) {
          toast({ title: "Upload Successful", description: `${result.processed} students processed.` });
        } else {
          toast({ title: "Upload Completed with Errors", description: `Check history for details.`, variant: "destructive" });
        }
      }

      setSelectedFile(null);
      setOperationType("");
      setTargetClass("");
      setTargetDepartment("");
      setParseResult(null);
    } catch (error) {
      toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Operation Type</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operationTypes.map((op) => (
                <div
                  key={op.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${operationType === op.id ? 'border-primary bg-muted' : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setOperationType(op.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                      <op.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{op.name}</h3>
                      <p className="text-sm text-muted-foreground">{op.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {operationType && (
            <Card>
              <CardHeader>
                <CardTitle>2. Configure & Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetDepartment">Target Department</Label>
                    <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetClass">Target Class</Label>
                    <Select value={targetClass} onValueChange={setTargetClass}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes
                          .filter(cls => !targetDepartment || cls.department_id === targetDepartment)
                          .map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input id="file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Excel files only (.xlsx, .xls)</p>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="text-destructive">Remove</Button>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground">Processing file... Do not close this page.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>3. Review & Start</CardTitle>
            </CardHeader>
            <CardContent>
              {parseResult && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    File Parse Results
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold">{parseResult.totalRows}</p>
                      <p className="text-xs text-muted-foreground">Total Rows</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{parseResult.validRows}</p>
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{parseResult.errors.length}</p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>
                  {parseResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h6 className="font-semibold text-destructive text-sm">Errors/Warnings:</h6>
                      <div className="max-h-24 overflow-y-auto text-xs text-destructive space-y-1 mt-1">
                        {parseResult.errors.slice(0, 5).map((e: string, i: number) => <p key={i}>{e}</p>)}
                        {parseResult.errors.length > 5 && <p>...and {parseResult.errors.length - 5} more.</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading || isParsing} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Processing...' : (isParsing ? 'Parsing...' : 'Start Upload')}
              </Button>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Template Required</h4>
                    <p className="text-sm text-muted-foreground">
                      Before uploading, please download the correct template from the "Templates" tab to avoid errors.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="flex items-center gap-2 text-base">*/}
      {/*      <Info className="w-5 h-5 text-muted-foreground" />*/}
      {/*      Best Practices for Data Uploads*/}
      {/*    </CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">*/}
      {/*    <div>*/}
      {/*      <h4 className="font-semibold text-foreground mb-3">Student Registration</h4>*/}
      {/*      <ul className="space-y-3 text-sm text-muted-foreground">*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Always start with a fresh template from the "Templates" tab to ensure you have the latest format.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Verify student data, especially Ghana Card numbers and dates of birth, before uploading.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Ensure guardian contact information is complete and correctly formatted.</span>*/}
      {/*        </li>*/}
      {/*      </ul>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <h4 className="font-semibold text-foreground mb-3">Results Upload</h4>*/}
      {/*      <ul className="space-y-3 text-sm text-muted-foreground">*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Use the specific template generated for the intended class and term to prevent mismatches.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Double-check that student IDs in your file match exactly with the records in the system.</span>*/}
      {/*        </li>*/}
      {/*        <li className="flex items-start gap-3">*/}
      {/*          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />*/}
      {/*          <span>Confirm that all marks adhere to the GES assessment structure and are within the valid score range.</span>*/}
      {/*        </li>*/}
      {/*      </ul>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};
