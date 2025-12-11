import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBasic9Students } from "@/hooks/useBasic9Students";
import { useSaveMockScores, SubjectScoreInput } from "@/hooks/useSaveMockScores";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddScoresDialogProps {
  sessionId: string | null;
  resultsCount?: number;
  onSaved?: () => void;
  trigger?: React.ReactNode;
}

const SUBJECT_FIELDS = [
  { key: "english", label: "English", category: "core" },
  { key: "mathematics", label: "Mathematics", category: "core" },
  { key: "science", label: "Science", category: "core" },
  { key: "social", label: "Social Studies", category: "core" },
  { key: "career_technology", label: "Career Technology", category: "optional" },
  { key: "rme", label: "Rel. & Moral Edu.", category: "optional" },
  { key: "ict", label: "ICT", category: "optional" },
  { key: "creative_arts", label: "Creative Arts", category: "optional" },
  { key: "gh_language", label: "Ghanaian Language", category: "optional" },
  { key: "french", label: "French", category: "optional" },
  { key: "arabic", label: "Arabic", category: "optional" },
] as const;

type FieldKey = typeof SUBJECT_FIELDS[number]["key"];

export function AddScoresDialog({ sessionId, resultsCount = 0, onSaved, trigger }: AddScoresDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [studentId, setStudentId] = React.useState<string>("");
  const [scores, setScores] = React.useState<SubjectScoreInput>({});
  const { data: students = [], isLoading } = useBasic9Students();
  const saveScores = useSaveMockScores(sessionId);

  const total = Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0);

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

  const handleSave = async (closeAfter: boolean) => {
    if (!sessionId) {
      toast({ title: "Select a session first" });
      return;
    }
    if (!studentId) {
      toast({ title: "Select a student" });
      return;
    }

    await saveScores.mutateAsync({ studentId, scores });
    onSaved?.();

    if (closeAfter) {
      setOpen(false);
      resetForm();
    } else {
      // keep dialog open, clear fields but keep student focus
      setScores({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={!sessionId}>Add scores</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Mock Exam Scores</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id="student" className="w-full">
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
          </div>

          {/* Core Subjects */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Core Subjects</h3>
            <div className="grid grid-cols-2 gap-4">
              {SUBJECT_FIELDS.filter(f => f.category === "core").map((f) => {
                const hasError = outOfRangeKeys.includes(f.key);
                return (
                  <div key={f.key} className="space-y-2">
                    <Label 
                      htmlFor={`f-${f.key}`} 
                      className={cn("text-sm", hasError && "text-destructive")}
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
                      placeholder="0-100"
                      className={cn(hasError && "border-destructive")}
                    />
                    {hasError && (
                      <p className="text-xs text-destructive">Score must be between 0-100</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Subjects */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Optional Subjects</h3>
            <div className="grid grid-cols-2 gap-4">
              {SUBJECT_FIELDS.filter(f => f.category === "optional").map((f) => {
                const hasError = outOfRangeKeys.includes(f.key);
                return (
                  <div key={f.key} className="space-y-2">
                    <Label 
                      htmlFor={`f-${f.key}`} 
                      className={cn("text-sm", hasError && "text-destructive")}
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
                      placeholder="0-100"
                      className={cn(hasError && "border-destructive")}
                    />
                    {hasError && (
                      <p className="text-xs text-destructive">Score must be between 0-100</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Score */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <span className="text-lg font-semibold">Total Score: {total}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)} 
            disabled={!isValid || saveScores.isPending}
          >
            Save & Add Another
          </Button>
          <Button 
            onClick={() => handleSave(true)} 
            disabled={!isValid || saveScores.isPending}
          >
            Save
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            disabled={saveScores.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
