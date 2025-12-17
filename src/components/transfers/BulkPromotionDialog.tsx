import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpCircle,
  Info,
  Search,
} from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import {
  useBulkPromotion,
  mapClassesToProgression,
  getPromotionSuggestion,
  shouldGraduate,
  PromotionResult,
  CLASS_PROGRESSION_ORDER,
} from "@/hooks/usePromotions";
import { cn } from "@/lib/utils";

interface BulkPromotionDialogProps {
  trigger: React.ReactNode;
}

export function BulkPromotionDialog({ trigger }: BulkPromotionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "review" | "results">("select");
  const [selectedFromClass, setSelectedFromClass] = useState("");
  const [selectedToClass, setSelectedToClass] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [reason, setReason] = useState("Annual promotion to next class");
  const [autoComplete, setAutoComplete] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [promotionResults, setPromotionResults] = useState<PromotionResult[]>([]);

  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents({
    class_id: selectedFromClass || undefined,
    has_left: false,
  });

  const bulkPromotion = useBulkPromotion();

  // Map classes to progression
  const mappedClasses = useMemo(() => mapClassesToProgression(classes), [classes]);

  // Get promotion suggestion when from class changes
  const promotionSuggestion = useMemo(() => {
    if (!selectedFromClass) return null;
    const fromClass = classes.find((c) => c.id === selectedFromClass);
    if (!fromClass) return null;

    const fromClassMapping = mappedClasses.find((c) => c.id === selectedFromClass);
    return getPromotionSuggestion(
      fromClass.name,
      mappedClasses,
      fromClassMapping?.department_id
    );
  }, [selectedFromClass, classes, mappedClasses]);

  // Auto-select destination class based on suggestion
  useEffect(() => {
    if (promotionSuggestion?.nextClass) {
      setSelectedToClass(promotionSuggestion.nextClass.id);
    } else if (promotionSuggestion?.isGraduation) {
      setSelectedToClass("__graduation__");
    } else {
      setSelectedToClass("");
    }
  }, [promotionSuggestion]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(lower) ||
        s.student_id.toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  // Get from class name
  const fromClassName = useMemo(() => {
    return classes.find((c) => c.id === selectedFromClass)?.name || "";
  }, [selectedFromClass, classes]);

  // Get to class name
  const toClassName = useMemo(() => {
    if (selectedToClass === "__graduation__") return "Graduation";
    return classes.find((c) => c.id === selectedToClass)?.name || "";
  }, [selectedToClass, classes]);

  // Check if it's a graduation
  const isGraduation = selectedToClass === "__graduation__";

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // Handle student selection
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle promotion
  const handlePromote = async () => {
    const results = await bulkPromotion.mutateAsync({
      fromClassId: selectedFromClass,
      toClassId: isGraduation ? null : selectedToClass,
      studentIds: selectedStudentIds,
      academicYear,
      reason,
      autoComplete,
    });

    setPromotionResults(results);
    setStep("results");
  };

  // Reset dialog
  const handleReset = () => {
    setStep("select");
    setSelectedFromClass("");
    setSelectedToClass("");
    setSelectedStudentIds([]);
    setSearchTerm("");
    setPromotionResults([]);
    setReason("Annual promotion to next class");
    setAutoComplete(true);
  };

  // Handle close
  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    setIsOpen(open);
  };

  // Can proceed to review
  const canProceedToReview =
    selectedFromClass &&
    (selectedToClass || isGraduation) &&
    selectedStudentIds.length > 0;

  // Get result statistics
  const resultStats = useMemo(() => {
    return {
      promoted: promotionResults.filter((r) => r.status === "promoted").length,
      graduated: promotionResults.filter((r) => r.status === "graduated").length,
      errors: promotionResults.filter((r) => r.status === "error").length,
      skipped: promotionResults.filter((r) => r.status === "skipped").length,
    };
  }, [promotionResults]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-primary" />
            Bulk Student Promotion
          </DialogTitle>
          <DialogDescription>
            Promote multiple students to the next class or graduate them
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2">
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
              step === "select"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className="font-medium">1</span>
            <span>Select</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
              step === "review"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className="font-medium">2</span>
            <span>Review</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
              step === "results"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className="font-medium">3</span>
            <span>Results</span>
          </div>
        </div>

        <Separator />

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {step === "select" && (
            <div className="space-y-4 h-full overflow-auto py-4">
              {/* Class Progression Info */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Ghana Education Service Progression
                </AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  {CLASS_PROGRESSION_ORDER.slice(0, -1).join(" → ")} → Graduation
                </AlertDescription>
              </Alert>

              {/* From Class Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromClass">
                    From Class <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedFromClass}
                    onValueChange={(v) => {
                      setSelectedFromClass(v);
                      setSelectedStudentIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mappedClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                          {cls.progressionIndex >= 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Level {cls.progressionIndex + 1})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toClass">
                    To Class <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedToClass}
                    onValueChange={setSelectedToClass}
                    disabled={!selectedFromClass}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedFromClass
                            ? "Select destination"
                            : "Select source class first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {shouldGraduate(fromClassName) && (
                        <SelectItem value="__graduation__">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Graduation
                          </div>
                        </SelectItem>
                      )}
                      {mappedClasses
                        .filter((cls) => cls.id !== selectedFromClass)
                        .map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {promotionSuggestion && (
                    <p
                      className={cn(
                        "text-xs",
                        promotionSuggestion.isGraduation
                          ? "text-orange-600"
                          : promotionSuggestion.nextClass
                            ? "text-green-600"
                            : "text-amber-600"
                      )}
                    >
                      {promotionSuggestion.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Year and Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Annual promotion"
                  />
                </div>
              </div>

              {/* Auto Complete Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoComplete"
                  checked={autoComplete}
                  onCheckedChange={(checked) =>
                    setAutoComplete(checked as boolean)
                  }
                />
                <Label htmlFor="autoComplete" className="text-sm cursor-pointer">
                  Complete promotions immediately (skip approval process)
                </Label>
              </div>

              {/* Student Selection */}
              {selectedFromClass && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      Select Students{" "}
                      <span className="text-muted-foreground">
                        ({selectedStudentIds.length} of {students.length} selected)
                      </span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedStudentIds.length === filteredStudents.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Student List */}
                  <ScrollArea className="h-[200px] border rounded-lg p-2">
                    {filteredStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Users className="w-8 h-8 mb-2" />
                        <p className="text-sm">No students in this class</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                              selectedStudentIds.includes(student.id)
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                            )}
                            onClick={() => handleStudentToggle(student.id)}
                          >
                            <Checkbox
                              checked={selectedStudentIds.includes(student.id)}
                              onCheckedChange={() =>
                                handleStudentToggle(student.id)
                              }
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.student_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4 py-4">
              <Alert
                className={
                  isGraduation
                    ? "bg-orange-50 border-orange-200"
                    : "bg-green-50 border-green-200"
                }
              >
                {isGraduation ? (
                  <GraduationCap className="h-4 w-4 text-orange-600" />
                ) : (
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertTitle
                  className={isGraduation ? "text-orange-800" : "text-green-800"}
                >
                  {isGraduation ? "Graduation Confirmation" : "Promotion Confirmation"}
                </AlertTitle>
                <AlertDescription
                  className={isGraduation ? "text-orange-700" : "text-green-700"}
                >
                  {isGraduation
                    ? `${selectedStudentIds.length} student(s) will be marked as graduated and removed from active enrollment.`
                    : `${selectedStudentIds.length} student(s) will be promoted from ${fromClassName} to ${toClassName}.`}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">From Class</p>
                  <p className="font-semibold">{fromClassName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">To Class</p>
                  <p className="font-semibold flex items-center gap-1">
                    {isGraduation && <GraduationCap className="w-4 h-4" />}
                    {toClassName}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Academic Year</p>
                  <p className="font-semibold">{academicYear}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-semibold">{selectedStudentIds.length}</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground text-sm">Reason</p>
                <p className="font-medium">{reason}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground text-sm">Process Type</p>
                <p className="font-medium">
                  {autoComplete
                    ? "Immediate (transfers will be completed instantly)"
                    : "Pending Approval (transfers will require approval)"}
                </p>
              </div>

              <ScrollArea className="h-[150px] border rounded-lg p-2">
                <div className="space-y-1">
                  {students
                    .filter((s) => selectedStudentIds.includes(s.id))
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {student.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({student.student_id})
                        </span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === "results" && (
            <div className="space-y-4 py-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {resultStats.promoted}
                  </p>
                  <p className="text-xs text-green-600">Promoted</p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-700">
                    {resultStats.graduated}
                  </p>
                  <p className="text-xs text-orange-600">Graduated</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700">
                    {resultStats.skipped}
                  </p>
                  <p className="text-xs text-yellow-600">Skipped</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {resultStats.errors}
                  </p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {/* Results List */}
              <ScrollArea className="h-[250px] border rounded-lg p-2">
                <div className="space-y-2">
                  {promotionResults.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        result.status === "promoted" && "bg-green-50",
                        result.status === "graduated" && "bg-orange-50",
                        result.status === "skipped" && "bg-yellow-50",
                        result.status === "error" && "bg-red-50"
                      )}
                    >
                      {result.status === "promoted" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {result.status === "graduated" && (
                        <GraduationCap className="w-5 h-5 text-orange-600" />
                      )}
                      {result.status === "skipped" && (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.studentId} • {result.fromClass} → {result.toClass}
                        </p>
                        {result.message && (
                          <p
                            className={cn(
                              "text-xs mt-1",
                              result.status === "error"
                                ? "text-red-600"
                                : "text-muted-foreground"
                            )}
                          >
                            {result.message}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          result.status === "promoted" || result.status === "graduated"
                            ? "default"
                            : result.status === "skipped"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {step === "select" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("review")} disabled={!canProceedToReview}>
                Review Promotion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                onClick={handlePromote}
                disabled={bulkPromotion.isPending}
                className={isGraduation ? "bg-orange-600 hover:bg-orange-700" : ""}
              >
                {bulkPromotion.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isGraduation ? (
                  <>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Graduate {selectedStudentIds.length} Students
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Promote {selectedStudentIds.length} Students
                  </>
                )}
              </Button>
            </>
          )}

          {step === "results" && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Promote More Students
              </Button>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkPromotionDialog;
