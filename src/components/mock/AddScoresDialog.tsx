import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMockExamDepartments,
  useMockExamClasses,
  getSubjectsForExamType,
  getExamTypeName,
  MockExamType,
} from "@/hooks/useMockExamDepartments";
import { useMockExamStudentsByClass, useStudentsWithMockResults, MockExamStudent } from "@/hooks/useMockExamStudents";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Info, User, BookOpen, CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";

interface AddScoresDialogProps {
  sessionId: string | null;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddScoresDialog({ sessionId, onSuccess, children }: AddScoresDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "scores">("select");

  // Selection state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [examType, setExamType] = useState<MockExamType>("bece");

  // Store selected student info to persist across re-renders when on scores step
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<MockExamStudent | null>(null);

  // Scores state
  const [scores, setScores] = useState<SubjectScoreInput>({});

  // Data hooks - only JHS and SHS departments
  const { departments: mockDepartments, isLoading: departmentsLoading } = useMockExamDepartments();
  const { classes: allMockClasses, getClassExamType, isLoading: classesLoading } = useMockExamClasses();

  const { data: students = [], isLoading: studentsLoading } = useMockExamStudentsByClass(
    selectedClassId && selectedClassId !== "" ? selectedClassId : null
  );
  const { data: studentsWithResults = new Set() } = useStudentsWithMockResults(sessionId);

  const saveScores = useSaveMockScores(sessionId);

  // Filter classes by selected department
  const filteredClasses = useMemo(() => {
    if (!selectedDepartmentId || selectedDepartmentId === "all") {
      return allMockClasses;
    }
    return allMockClasses.filter((c) => c.department_id === selectedDepartmentId);
  }, [allMockClasses, selectedDepartmentId]);

  // Get selected student info - use stored info if available (for step 2), otherwise find from students array
  const selectedStudent = useMemo(() => {
    if (selectedStudentInfo && selectedStudentInfo.id === selectedStudentId) {
      return selectedStudentInfo;
    }
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId, selectedStudentInfo]);

  // Check if student already has results
  const studentHasResults = selectedStudentId
    ? studentsWithResults.has(selectedStudentId)
    : false;

  // Get subjects based on exam type
  const subjectConfig = useMemo(() => getSubjectsForExamType(examType), [examType]);

  // Calculate totals
  const coreTotal = subjectConfig.core.reduce(
    (sum, subj) => sum + (Number(scores[subj.key]) || 0),
    0
  );
  const electiveTotal = subjectConfig.electives.reduce(
    (sum, subj) => sum + (Number(scores[subj.key]) || 0),
    0
  );
  const grandTotal = coreTotal + electiveTotal;

  // Count subjects with scores
  const coreCount = subjectConfig.core.filter(
    (subj) => typeof scores[subj.key] === "number" && scores[subj.key]! > 0
  ).length;
  const electiveCount = subjectConfig.electives.filter(
    (subj) => typeof scores[subj.key] === "number" && scores[subj.key]! > 0
  ).length;

  // Validation
  const hasAnyScore = Object.values(scores).some(
    (v) => typeof v === "number" && v > 0
  );
  const invalidScores = Object.entries(scores).filter(
    ([, v]) => typeof v === "number" && (v < 0 || v > 100)
  );
  const isValid =
    sessionId &&
    selectedStudentId &&
    hasAnyScore &&
    invalidScores.length === 0;

  // Reset form
  const resetForm = () => {
    setStep("select");
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setSelectedStudentId("");
    setSelectedStudentInfo(null);
    setScores({});
    setExamType("bece");
  };

  // Update exam type when class changes
  // Note: getClassExamType is now memoized with useCallback, so it's safe to include
  // Only run this on select step to avoid clearing data when on scores step
  useEffect(() => {
    if (step !== "select") return;

    if (selectedClassId) {
      const detectedExamType = getClassExamType(selectedClassId);
      if (detectedExamType) {
        setExamType(detectedExamType);
      }
    }
    setSelectedStudentId("");
    setSelectedStudentInfo(null);
    setScores({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, step]);

  // Reset class when department changes
  useEffect(() => {
    if (step !== "select") return;
    setSelectedClassId("");
  }, [selectedDepartmentId, step]);

  // Handle score change
  const handleScoreChange = (key: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setScores((prev) => ({ ...prev, [key]: numValue }));
  };

  // Proceed to scores step
  const handleProceedToScores = () => {
    if (selectedStudentId) {
      // Store the selected student info before moving to step 2
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        setSelectedStudentInfo(student);
      }
      setStep("scores");
    }
  };

  // Go back to selection
  const handleBackToSelection = () => {
    setStep("select");
  };

  // Save scores
  const handleSave = async (addAnother: boolean) => {
    if (!isValid) return;

    try {
      await saveScores.mutateAsync({
        studentId: selectedStudentId,
        scores,
      });

      onSuccess?.();

      if (addAnother) {
        // Keep class selected, clear student and scores
        setSelectedStudentId("");
        setSelectedStudentInfo(null);
        setScores({});
        setStep("select");
      } else {
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Render subject input field
  const renderSubjectInput = (subj: { key: string; name: string }, isCore: boolean) => {
    const value = scores[subj.key];
    const hasError = typeof value === "number" && (value < 0 || value > 100);

    return (
      <div key={subj.key} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`score-${subj.key}`}
            className={cn("text-sm", hasError && "text-destructive")}
          >
            {subj.name}
          </Label>
          {isCore && (
            <Badge variant="secondary" className="text-xs">
              Core
            </Badge>
          )}
        </div>
        <Input
          id={`score-${subj.key}`}
          type="number"
          min={0}
          max={100}
          value={value ?? ""}
          onChange={(e) => handleScoreChange(subj.key, e.target.value)}
          placeholder="0-100"
          className={cn(hasError && "border-destructive")}
        />
        {hasError && (
          <p className="text-xs text-destructive">Score must be 0-100</p>
        )}
      </div>
    );
  };

  const selectedDept = mockDepartments.find((d) => d.id === selectedDepartmentId);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button disabled={!sessionId}>Add Scores</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {step === "select" ? "Select Student" : `Enter ${getExamTypeName(examType)} Scores`}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Choose a JHS or SHS class and student to add mock exam scores"
              : `Adding ${getExamTypeName(examType)} scores for ${selectedStudent?.full_name || "student"}`}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          // STEP 1: Student Selection
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Department Filter (JHS/SHS only) */}
            <div className="space-y-2">
              <Label>Department (JHS / SHS)</Label>
              <Select
                value={selectedDepartmentId}
                onValueChange={setSelectedDepartmentId}
                disabled={departmentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All JHS & SHS</SelectItem>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {getExamTypeName(dept.examType)}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mockDepartments.length === 0 && !departmentsLoading && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No JHS or SHS departments found. Mock exams are only for Junior High and Senior High students.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <Label>Select Class *</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={classesLoading || filteredClasses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClasses.map((cls) => {
                    const clsExamType = getClassExamType(cls.id);
                    return (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                        {clsExamType && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {getExamTypeName(clsExamType)}
                          </Badge>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {filteredClasses.length === 0 && !classesLoading && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No classes found in JHS or SHS departments.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Exam Type Indicator */}
            {selectedClassId && (
              <Alert className={examType === "wassce" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}>
                <GraduationCap className="h-4 w-4" />
                <AlertDescription>
                  <strong>{getExamTypeName(examType)}</strong> mock exam format will be used.
                  {examType === "bece"
                    ? " 4 core subjects + best 2 electives for aggregate calculation."
                    : " 4 core subjects + 4 elective subjects."}
                </AlertDescription>
              </Alert>
            )}

            {/* Student Selection */}
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <Label>Select Student *</Label>
              {!selectedClassId ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please select a class first to see available students.
                  </AlertDescription>
                </Alert>
              ) : studentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No students found in this class.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="flex-1 border rounded-md">
                  <div className="p-2 space-y-1">
                    {students.map((student) => {
                      const hasResults = studentsWithResults.has(student.id);
                      const isSelected = selectedStudentId === student.id;

                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => setSelectedStudentId(student.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-md text-left transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted",
                            hasResults && !isSelected && "bg-green-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <User
                              className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              {(student.student_id || student.no_on_roll) && (
                                <p
                                  className={cn(
                                    "text-xs",
                                    isSelected
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {student.no_on_roll || student.student_id}
                                </p>
                              )}
                            </div>
                          </div>
                          {hasResults && (
                            <Badge
                              variant={isSelected ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Has Scores
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Student has existing results warning */}
            {studentHasResults && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This student already has scores for this session. Adding new
                  scores will update existing ones.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToScores}
                disabled={!selectedStudentId}
              >
                Continue to Scores
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // STEP 2: Enter Scores
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Student Info Card */}
            <Card className="mb-4">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {selectedStudent?.full_name}
                      </p>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>
                          {selectedStudent?.class_name}
                          {(selectedStudent?.no_on_roll || selectedStudent?.student_id) &&
                            ` • ${selectedStudent.no_on_roll || selectedStudent.student_id}`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getExamTypeName(examType)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToSelection}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scores Tabs */}
            <Tabs defaultValue="core" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="core" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Core Subjects ({coreCount}/{subjectConfig.coreCount})
                </TabsTrigger>
                <TabsTrigger value="electives" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  {examType === "bece" ? "Electives" : "Electives"} ({electiveCount})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="core" className="mt-0 space-y-4 pr-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {examType === "bece"
                        ? "All 4 core subjects are required for BECE aggregate calculation."
                        : "All 4 core subjects are required for WASSCE."}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjectConfig.core.map((subj) =>
                      renderSubjectInput(subj, true)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="electives" className="mt-0 space-y-4 pr-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {examType === "bece"
                        ? "Best 2 elective subjects will be used for aggregate calculation."
                        : "Enter scores for the student's 4 elective subjects based on their program."}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjectConfig.electives.map((subj) =>
                      renderSubjectInput(subj, false)
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Score Summary */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Core Total</p>
                  <p className="text-xl font-bold">{coreTotal}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Electives Total</p>
                  <p className="text-xl font-bold">{electiveTotal}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-xl font-bold text-primary">{grandTotal}</p>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {invalidScores.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some scores are out of range (0-100). Please correct them
                  before saving.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleBackToSelection}>
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={!isValid || saveScores.isPending}
              >
                Save & Add Another
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={!isValid || saveScores.isPending}
              >
                {saveScores.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
