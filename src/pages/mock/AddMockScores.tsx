import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Trophy } from "lucide-react";
import { useBasic9Students } from "@/hooks/useBasic9Students";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useMockExamSessions } from "@/hooks/useMockExams";
import { useMockExamResults } from "@/hooks/useMockExamResults";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { calculateMockRawScore, calculateMockAggregate, isCoreSubject } from "@/utils/mockGradeCalculations";

// The 4 BECE core subjects — matched by name pattern
const CORE_PATTERNS = ["english", "mathematics", "science", "social studies", "social"];

export default function AddMockScores() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [studentId, setStudentId] = React.useState<string>("");
  const [scores, setScores] = React.useState<SubjectScoreInput>({});

  const { data: sessions = [] } = useMockExamSessions();
  const { data: students = [], isLoading: studentsLoading } = useBasic9Students();
  const { data: results = [] } = useMockExamResults(sessionId || null);
  const { data: allSubjects = [], isLoading: subjectsLoading } = useSubjects();
  const saveScores = useSaveMockScores(sessionId || null);

  // Classify subjects using the same logic as mockGradeCalculations
  const coreSubjects = React.useMemo(
    () => allSubjects.filter(s => isCoreSubject(s.name, CORE_PATTERNS)),
    [allSubjects]
  );
  const optionalSubjects = React.useMemo(
    () => allSubjects.filter(s => !isCoreSubject(s.name, CORE_PATTERNS)),
    [allSubjects]
  );

  // Get edit mode from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const editStudentId = searchParams.get("edit");

  // Load existing scores if in edit mode
  React.useEffect(() => {
    if (editStudentId && results.length > 0 && allSubjects.length > 0) {
      const existingResult = results.find(r => r.student_id === editStudentId);
      if (existingResult) {
        setStudentId(editStudentId);
        const existingScores: SubjectScoreInput = {};
        existingResult.subject_scores.forEach(score => {
          // Find matching subject by name in DB list
          const match = allSubjects.find(
            s => s.name.toLowerCase() === score.subject_name.toLowerCase()
          );
          if (match && score.exam_score !== null) {
            existingScores[match.name] = score.exam_score;
          }
        });
        setScores(existingScores);
      }
    }
  }, [editStudentId, results, allSubjects]);

  const currentSession = sessions.find(s => s.id === sessionId);
  const rawScore = calculateMockRawScore(scores);
  const aggregate = calculateMockAggregate(scores);

  const outOfRangeKeys = Object.entries(scores)
    .filter(([, v]) => typeof v === "number" && ((v as number) < 0 || (v as number) > 100))
    .map(([k]) => k);
  const hasAnyScore = Object.values(scores).some(v => typeof v === "number");
  const isValid = Boolean(sessionId && studentId && hasAnyScore && outOfRangeKeys.length === 0);

  const onChangeField = (subjectName: string, val: string) => {
    const n = val === "" ? undefined : Number(val);
    setScores(prev => ({ ...prev, [subjectName]: n }));
  };

  const resetForm = () => {
    setScores({});
    setStudentId("");
  };

  const handleSave = async (addAnother: boolean) => {
    if (!sessionId) {
      toast({ title: "Invalid session ID" });
      return;
    }
    if (!studentId) {
      toast({ title: "Please select a student" });
      return;
    }
    try {
      await saveScores.mutateAsync({ studentId, scores });
      if (addAnother) {
        setScores({});
      } else {
        navigate(`/mock-exams?session=${sessionId}&tab=analysis`);
      }
    } catch {
      // Error handling done in hook
    }
  };

  const handleCancel = () => navigate("/mock-exams");

  if (!sessionId || !currentSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <Button onClick={() => navigate("/mock-exams")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mock Exams
          </Button>
        </div>
      </div>
    );
  }

  const renderSubjectField = (subjectName: string) => {
    const hasError = outOfRangeKeys.includes(subjectName);
    return (
      <div key={subjectName} className="space-y-2">
        <Label
          htmlFor={`f-${subjectName}`}
          className={cn("text-sm font-medium", hasError && "text-destructive")}
        >
          {subjectName}
        </Label>
        <Input
          id={`f-${subjectName}`}
          type="number"
          min={0}
          max={100}
          value={scores[subjectName] ?? ""}
          onChange={e => onChangeField(subjectName, e.target.value)}
          placeholder="Enter score (0–100)"
          className={cn("h-12", hasError && "border-destructive")}
        />
        {hasError && (
          <p className="text-xs text-destructive">Score must be between 0–100</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60">
      <Header
        title={editStudentId ? "Edit Mock Exam Scores" : "Add Mock Exam Scores"}
        subtitle={`Session: ${currentSession.name} • ${currentSession.academic_year} • ${currentSession.term}`}
      />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick navigation */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/mock-exams")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Mock Exams
                </Button>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      Students Added
                    </div>
                    <div className="text-xl font-bold">{results.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{editStudentId ? "Editing Student Scores" : "Select Student"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={studentId} onValueChange={setStudentId} disabled={!!editStudentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={studentsLoading ? "Loading students..." : "Choose a Basic 9 student"} />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No Basic 9 students found.</div>
                  ) : (
                    students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Subject Scores */}
          {subjectsLoading ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader><CardTitle>Subjects</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(5)].map((_, j) => <Skeleton key={j} className="h-12 w-full" />)}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Core Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Core Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {coreSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No core subjects found in database.</p>
                    ) : (
                      coreSubjects.map(s => renderSubjectField(s.name))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optional Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Optional Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {optionalSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No optional subjects found in database.</p>
                    ) : (
                      optionalSubjects.map(s => renderSubjectField(s.name))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Score Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">Raw Score: {rawScore}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  <span className="text-xl font-bold">Aggregate: {aggregate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-8">
            <Button variant="outline" onClick={handleCancel} disabled={saveScores.isPending}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={!isValid || saveScores.isPending}
            >
              {saveScores.isPending ? "Saving..." : "Save & Add Another"}
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={!isValid || saveScores.isPending}
            >
              {saveScores.isPending ? "Saving..." : editStudentId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
