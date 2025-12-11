import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Trophy } from "lucide-react";
import { useBasic9Students } from "@/hooks/useBasic9Students";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useMockExamSessions } from "@/hooks/useMockExams";
import { useMockExamResults } from "@/hooks/useMockExamResults";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { calculateMockRawScore, calculateMockAggregate } from "@/utils/mockGradeCalculations";

const SUBJECT_FIELDS = [
  { key: "english", label: "English", category: "core" },
  { key: "mathematics", label: "Mathematics", category: "core" },
  { key: "science", label: "Science", category: "core" },
  { key: "social", label: "Social Studies", category: "core" },
  { key: "career_technology", label: "Career Technology", category: "core" },
  { key: "rme", label: "RME", category: "optional" },
  { key: "ict", label: "Computing", category: "optional" },
  { key: "creative_arts", label: "Creative Arts", category: "optional" },
  { key: "gh_language", label: "Ghanaian Language", category: "optional" },
  { key: "french", label: "French", category: "optional" },
] as const;

type FieldKey = typeof SUBJECT_FIELDS[number]["key"];

export default function AddMockScores() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [studentId, setStudentId] = React.useState<string>("");
  const [scores, setScores] = React.useState<SubjectScoreInput>({});
  
  const { data: sessions = [] } = useMockExamSessions();
  const { data: students = [], isLoading } = useBasic9Students();
  const { data: results = [] } = useMockExamResults(sessionId || null);
  const saveScores = useSaveMockScores(sessionId || null);

  // Get edit mode from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const editStudentId = searchParams.get('edit');
  
  // Load existing scores if in edit mode
  React.useEffect(() => {
    if (editStudentId && results.length > 0) {
      const existingResult = results.find(r => r.student_id === editStudentId);
      if (existingResult) {
        setStudentId(editStudentId);
        // Convert subject scores to the expected format
        const existingScores: SubjectScoreInput = {};
        existingResult.subject_scores.forEach(score => {
          // Map subject names to field keys
          const subjectName = score.subject_name.toLowerCase();
          let fieldKey: string | null = null;
          
          if (subjectName.includes('english')) fieldKey = 'english';
          else if (subjectName.includes('mathematics') || subjectName.includes('maths')) fieldKey = 'mathematics';
          else if (subjectName.includes('science')) fieldKey = 'science';
          else if (subjectName.includes('social')) fieldKey = 'social';
          else if (subjectName.includes('career')) fieldKey = 'career_technology';
          else if (subjectName.includes('rme') || subjectName.includes('religious')) fieldKey = 'rme';
          else if (subjectName.includes('ict') || subjectName.includes('computing')) fieldKey = 'ict';
          else if (subjectName.includes('creative') || subjectName.includes('arts')) fieldKey = 'creative_arts';
          else if (subjectName.includes('ghanaian') || subjectName.includes('language')) fieldKey = 'gh_language';
          else if (subjectName.includes('french')) fieldKey = 'french';
          
          if (fieldKey && score.exam_score !== null) {
            existingScores[fieldKey] = score.exam_score;
          }
        });
        setScores(existingScores);
      }
    }
  }, [editStudentId, results]);

  const currentSession = sessions.find(s => s.id === sessionId);
  const rawScore = calculateMockRawScore(scores);
  const aggregate = calculateMockAggregate(scores);

  const entries = Object.entries(scores) as [FieldKey, number | undefined][];
  const hasAnyScore = entries.some(([, v]) => typeof v === "number");
  const outOfRangeKeys = entries
    .filter(([, v]) => typeof v === "number" && ((v as number) < 0 || (v as number) > 100))
    .map(([k]) => k);
  const isValid = Boolean(sessionId && studentId && hasAnyScore && outOfRangeKeys.length === 0);

  const onChangeField = (key: FieldKey, val: string) => {
    const n = val === "" ? undefined : Number(val);
    setScores((prev) => ({ ...prev, [key]: n }));
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
        navigate("/mock-exams");
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    navigate("/mock-exams");
  };

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
          {/* Student Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>{editStudentId ? "Editing Student Scores" : "Select Student"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={studentId} onValueChange={setStudentId} disabled={!!editStudentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoading ? "Loading students..." : "Choose a Basic 9 student"} />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No Basic 9 students found.</div>
                  ) : (
                    students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Scores Input - Two columns with 5 subjects each */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* First Column - 5 Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {SUBJECT_FIELDS.slice(0, 5).map((f) => {
                    const hasError = outOfRangeKeys.includes(f.key);
                    return (
                      <div key={f.key} className="space-y-2">
                        <Label 
                          htmlFor={`f-${f.key}`} 
                          className={cn("text-sm font-medium", hasError && "text-destructive")}
                        >
                          {f.label}
                        </Label>
                        <Input
                          id={`f-${f.key}`}
                          type="number"
                          min={0}
                          max={100}
                          value={scores[f.key] ?? ""}
                          onChange={(e) => onChangeField(f.key, e.target.value)}
                          placeholder="Enter score (0-100)"
                          className={cn("h-12", hasError && "border-destructive")}
                        />
                        {hasError && (
                          <p className="text-xs text-destructive">Score must be between 0-100</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Second Column - Remaining 5 Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {SUBJECT_FIELDS.slice(5).map((f) => {
                    const hasError = outOfRangeKeys.includes(f.key);
                    return (
                      <div key={f.key} className="space-y-2">
                        <Label 
                          htmlFor={`f-${f.key}`} 
                          className={cn("text-sm font-medium", hasError && "text-destructive")}
                        >
                          {f.label}
                        </Label>
                        <Input
                          id={`f-${f.key}`}
                          type="number"
                          min={0}
                          max={100}
                          value={scores[f.key] ?? ""}
                          onChange={(e) => onChangeField(f.key, e.target.value)}
                          placeholder="Enter score (0-100)"
                          className={cn("h-12", hasError && "border-destructive")}
                        />
                        {hasError && (
                          <p className="text-xs text-destructive">Score must be between 0-100</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Summary Display */}
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
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={saveScores.isPending}
            >
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