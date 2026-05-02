import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Info, GraduationCap, Calendar } from "lucide-react";
import { useCreateMockExamSession } from "@/hooks/useMockExams";
import {
  useMockExamDepartments,
  useMockExamClasses,
  getExamTypeName,
} from "@/hooks/useMockExamDepartments";
import { useGradingSettings } from "@/hooks/useGradingSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: (sessionId: string) => void;
}

export function CreateMockSessionDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);



  // Get academic year and term from grading settings
  const { data: gradingSettings } = useGradingSettings();
  const academicYear = gradingSettings?.academic_year || "2024/2025";
  const term = gradingSettings?.term ? `Term ${gradingSettings.term === 'first' ? '1' : gradingSettings.term === 'second' ? '2' : '3'}` : "Term 1";

  // Only JHS and SHS departments for mock exams
  const { departments, isLoading: departmentsLoading } = useMockExamDepartments();
  const { classes: allClasses, isLoading: classesLoading } = useMockExamClasses();
  const createSession = useCreateMockExamSession();

  // Filter classes by selected department
  const filteredClasses = useMemo(() => {
    if (!selectedDepartmentId || selectedDepartmentId === "all") {
      return allClasses;
    }
    return allClasses.filter((c) => c.department_id === selectedDepartmentId);
  }, [allClasses, selectedDepartmentId]);

  // Get department name for display
  const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId);

  // Auto-select Basic 9 class when dialog opens
  useEffect(() => {
    if (open && allClasses && allClasses.length > 0) {
      // Find Basic 9/JHS 3 class
      const basic9Class = allClasses.find(
        (cls) =>
          cls.name.toLowerCase().includes("basic 9") ||
          cls.name.toLowerCase().includes("jhs 3") ||
          cls.name.toLowerCase().includes("jhs3") ||
          cls.name.toLowerCase().includes("b9")
      );
      if (basic9Class) {
        setSelectedClassIds([basic9Class.id]);
        // Also auto-select the Basic 9 department
        setSelectedDepartmentId(basic9Class.department_id || "");
      }
    }
  }, [open, allClasses]);

  // Toggle class selection
  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  // Select all classes in current filter
  const selectAllClasses = () => {
    setSelectedClassIds(filteredClasses.map((c) => c.id));
  };

  // Clear all selected classes
  const clearAllClasses = () => {
    setSelectedClassIds([]);
  };

  const resetForm = () => {
    setName("");
    setDate("");
    setPublished(false);
    setSelectedDepartmentId("");
    setSelectedClassIds([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Create session with metadata about target classes
    // Note: Since the mock_exam_sessions table doesn't have class columns,
    // we'll store the session and the class context will come from results
    // Academic year and term are pulled from grading settings
    const result = await createSession.mutateAsync({
      name: name.trim(),
      academic_year: academicYear,
      term: term,
      exam_date: date || null,
      is_published: published,
      status: "draft",
    });

    setOpen(false);
    resetForm();
    onSuccess?.(result.id);
  };

  const isValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Mock Exam Session</DialogTitle>
          <DialogDescription>
            Set up a new mock examination session for your students
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {/* Session Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Session Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., BECE Mocks - March 2024 or WASSCE Mocks"
                  required
                />
              </div>

              {/* Academic Year and Term - Display only (from Grading Settings) */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Academic Period (from Grading Settings)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Year</p>
                    <p className="font-medium">{academicYear}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Term</p>
                    <p className="font-medium">{term}</p>
                  </div>
                </div>
              </div>

              {/* Department Filter - JHS/Basic 9 only */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Department
                </Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(value) => {
                    setSelectedDepartmentId(value);
                    setSelectedClassIds([]); // Clear class selections when department changes
                  }}
                  disabled={departmentsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select JHS/Basic 9 department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                        <Badge variant="outline" className="ml-2">
                          {getExamTypeName(dept.examType)}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Mock exams are for Basic 9 (JHS 3) students only
                </p>
                {departments.length === 0 && !departmentsLoading && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No Basic 9 or JHS departments found. Please ensure your school has a Basic 9/Junior High department set up.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Target Classes (Optional)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllClasses}
                      disabled={filteredClasses.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllClasses}
                      disabled={selectedClassIds.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {classesLoading ? (
                  <div className="text-sm text-muted-foreground p-4 text-center">
                    Loading JHS & SHS classes...
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No JHS or SHS classes found{selectedDepartmentId && selectedDepartmentId !== "all" ? " in this department" : ""}. Mock exams require Junior High or Senior High classes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {filteredClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={selectedClassIds.includes(cls.id)}
                          onCheckedChange={() => toggleClass(cls.id)}
                        />
                        <label
                          htmlFor={`class-${cls.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {cls.name}
                        </label>
                        {cls.department?.name && (
                          <Badge variant="outline" className="text-xs">
                            {cls.department.name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedClassIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedClassIds.length} class{selectedClassIds.length !== 1 ? "es" : ""} selected
                  </p>
                )}
              </div>

              {/* Exam Date and Published */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="date">Exam Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label>Published</Label>
                    <p className="text-xs text-muted-foreground">Make visible to viewers</p>
                  </div>
                  <Switch checked={published} onCheckedChange={setPublished} />
                </div>
              </div>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <GraduationCap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mock Exams</strong> are for Basic 9 (JHS 3) students.
                  After creating the session, you can add scores directly from the student list.
                </AlertDescription>
              </Alert>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || createSession.isPending}>
              {createSession.isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
