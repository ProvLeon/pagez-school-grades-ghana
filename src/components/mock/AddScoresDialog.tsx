import React, { useState, useMemo } from "react";
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
import { useBasic9Students } from "@/hooks/useBasic9Students";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSubjectsForExamType,
  getExamTypeName,
  MockExamType,
} from "@/hooks/useMockExamDepartments";
import { useStudentsWithMockResults, MockExamStudent } from "@/hooks/useMockExamStudents";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Info, User, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [examType] = useState<MockExamType>("bece"); // Only BECE for Basic 9

  // Store selected student info to persist across re-renders when on scores step
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<MockExamStudent | null>(null);

  // Scores state
  const [scores, setScores] = useState<SubjectScoreInput>({});

  // Data hooks - only Basic 9 students
  const { data: students = [], isLoading: studentsLoading } = useBasic9Students();
  const { data: studentsWithResults = new Set() } = useStudentsWithMockResults(sessionId);

  const saveScores = useSaveMockScores(sessionId);

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
    setSelectedStudentId("");
    setSelectedStudentInfo(null);
    setScores({});
  };

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
        // Keep student list visible, clear student and scores
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Add Scores</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Mock Exam Scores</DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Select a Basic 9 student to add mock exam scores"
              : `Enter scores for ${selectedStudent?.full_name}`}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          // STEP 1: Student Selection (Basic 9 only)
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <Label>Select Student *</Label>
              {studentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No Basic 9 students found.
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
                            <User className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{student.full_name}</p>
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

            {/* All Subjects - Simplified View */}
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Enter the raw score (0-100) for each subject. All subjects are displayed in order.
                  </AlertDescription>
                </Alert>

                {/* Subject Input Grid - All subjects in one view */}
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr,100px] gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                    <span>Subject</span>
                    <span className="text-center">Raw Score</span>
                  </div>

                  {/* Core Subjects First */}
                  {subjectConfig.core.map((subj) => (
                    <div key={subj.key} className="grid grid-cols-[1fr,100px] gap-2 items-center">
                      <Label htmlFor={`score-${subj.key}`} className="text-sm">
                        {subj.name}
                      </Label>
                      <Input
                        id={`score-${subj.key}`}
                        type="number"
                        min={0}
                        max={100}
                        value={scores[subj.key] ?? ""}
                        onChange={(e) => handleScoreChange(subj.key, e.target.value)}
                        placeholder="0-100"
                        className={cn(
                          "text-center",
                          typeof scores[subj.key] === "number" && (scores[subj.key]! < 0 || scores[subj.key]! > 100) && "border-destructive"
                        )}
                      />
                    </div>
                  ))}

                  {/* Elective Subjects */}
                  {subjectConfig.electives.map((subj) => (
                    <div key={subj.key} className="grid grid-cols-[1fr,100px] gap-2 items-center">
                      <Label htmlFor={`score-${subj.key}`} className="text-sm">
                        {subj.name}
                      </Label>
                      <Input
                        id={`score-${subj.key}`}
                        type="number"
                        min={0}
                        max={100}
                        value={scores[subj.key] ?? ""}
                        onChange={(e) => handleScoreChange(subj.key, e.target.value)}
                        placeholder="0-100"
                        className={cn(
                          "text-center",
                          typeof scores[subj.key] === "number" && (scores[subj.key]! < 0 || scores[subj.key]! > 100) && "border-destructive"
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Grand Total Only */}
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Raw Score</p>
                  <p className="text-2xl font-bold text-primary">{grandTotal}</p>
                </div>
              </div>
            </ScrollArea>

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
