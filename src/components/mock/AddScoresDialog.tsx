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
import { useStudentsWithMockResults, MockExamStudent } from "@/hooks/useMockExamStudents";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Info, User, CheckCircle2, AlertCircle } from "lucide-react";
import { isCoreSubject } from "@/utils/mockGradeCalculations";

// BECE Core subject patterns — English, Mathematics, Integrated Science, Social Studies
const CORE_PATTERNS = ["english", "mathematics", "science", "social studies", "social"];

interface AddScoresDialogProps {
  sessionId: string | null;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddScoresDialog({ sessionId, onSuccess, children }: AddScoresDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "scores">("select");

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<MockExamStudent | null>(null);
  const [scores, setScores] = useState<SubjectScoreInput>({});

  const { data: students = [], isLoading: studentsLoading } = useBasic9Students();
  const { data: studentsWithResults = new Set() } = useStudentsWithMockResults(sessionId);
  const { data: allSubjects = [], isLoading: subjectsLoading } = useSubjects();

  const saveScores = useSaveMockScores(sessionId);

  // Filter to JHS department only, then deduplicate by normalized name
  const jhsSubjects = useMemo(() => {
    const seen = new Set<string>();
    return allSubjects.filter(s => {
      const deptName = (s.department?.name || '').toLowerCase();
      const isJHS = deptName.includes('jhs') || deptName.includes('junior high') || deptName.includes('basic');
      if (!isJHS) return false;
      const key = s.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allSubjects]);

  // Classify into core and optional using BECE patterns
  const coreSubjects = useMemo(
    () => jhsSubjects.filter(s => isCoreSubject(s.name, CORE_PATTERNS)),
    [jhsSubjects]
  );
  const optionalSubjects = useMemo(
    () => jhsSubjects.filter(s => !isCoreSubject(s.name, CORE_PATTERNS)),
    [jhsSubjects]
  );

  const selectedStudent = useMemo(() => {
    if (selectedStudentInfo && selectedStudentInfo.id === selectedStudentId) {
      return selectedStudentInfo;
    }
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId, selectedStudentInfo]);

  const studentHasResults = selectedStudentId
    ? studentsWithResults.has(selectedStudentId)
    : false;

  // Calculate totals using subject name keys
  const coreTotal = coreSubjects.reduce((sum, s) => sum + (Number(scores[s.name]) || 0), 0);
  const optionalTotal = optionalSubjects.reduce((sum, s) => sum + (Number(scores[s.name]) || 0), 0);
  const grandTotal = coreTotal + optionalTotal;

  const hasAnyScore = Object.values(scores).some((v) => typeof v === "number" && v > 0);
  const invalidScores = Object.entries(scores).filter(
    ([, v]) => typeof v === "number" && (v < 0 || v > 100)
  );
  const isValid = sessionId && selectedStudentId && hasAnyScore && invalidScores.length === 0;

  const resetForm = () => {
    setStep("select");
    setSelectedStudentId("");
    setSelectedStudentInfo(null);
    setScores({});
  };

  const handleScoreChange = (subjectName: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setScores((prev) => ({ ...prev, [subjectName]: numValue }));
  };

  const handleProceedToScores = () => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) setSelectedStudentInfo(student);
      setStep("scores");
    }
  };

  const handleBackToSelection = () => setStep("select");

  const handleSave = async (addAnother: boolean) => {
    if (!isValid) return;
    try {
      await saveScores.mutateAsync({ studentId: selectedStudentId, scores });
      onSuccess?.();
      if (addAnother) {
        setSelectedStudentId("");
        setSelectedStudentInfo(null);
        setScores({});
        setStep("select");
      } else {
        setOpen(false);
        resetForm();
      }
    } catch {
      // Error handled in mutation
    }
  };

  const renderSubjectRow = (subjectName: string) => {
    const hasError = typeof scores[subjectName] === "number" &&
      (scores[subjectName]! < 0 || scores[subjectName]! > 100);
    return (
      <div key={subjectName} className="grid grid-cols-[1fr,100px] gap-2 items-center">
        <Label htmlFor={`score-${subjectName}`} className="text-sm">
          {subjectName}
        </Label>
        <Input
          id={`score-${subjectName}`}
          type="number"
          min={0}
          max={100}
          value={scores[subjectName] ?? ""}
          onChange={(e) => handleScoreChange(subjectName, e.target.value)}
          placeholder="0-100"
          className={cn("text-center", hasError && "border-destructive")}
        />
      </div>
    );
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
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <Label>Select Student *</Label>
              {studentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : students.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No Basic 9 students found.</AlertDescription>
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
                            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            hasResults && !isSelected && "bg-green-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4" />
                            <p className="font-medium">{student.full_name}</p>
                          </div>
                          {hasResults && (
                            <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
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

            {studentHasResults && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This student already has scores for this session. Adding new scores will update existing ones.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleProceedToScores} disabled={!selectedStudentId}>
                Continue to Scores
              </Button>
            </DialogFooter>
          </div>
        ) : (
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
                      <p className="font-semibold">{selectedStudent?.full_name}</p>
                      <Badge variant="outline" className="text-xs">BECE</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Enter the raw score (0-100) for each subject.
                  </AlertDescription>
                </Alert>

                {subjectsLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr,100px] gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <span>Subject</span>
                      <span className="text-center">Raw Score</span>
                    </div>

                    {/* Core Subjects */}
                    {coreSubjects.length > 0 && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
                          Core Subjects
                        </p>
                        {coreSubjects.map(s => renderSubjectRow(s.name))}
                      </>
                    )}

                    {/* Optional Subjects */}
                    {optionalSubjects.length > 0 && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
                          Optional Subjects
                        </p>
                        {optionalSubjects.map(s => renderSubjectRow(s.name))}
                      </>
                    )}
                  </div>
                )}

                {/* Grand Total */}
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold text-primary">{grandTotal}</p>
                </div>
              </div>
            </ScrollArea>

            {invalidScores.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some scores are out of range (0-100). Please correct them before saving.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleBackToSelection}>Back</Button>
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
