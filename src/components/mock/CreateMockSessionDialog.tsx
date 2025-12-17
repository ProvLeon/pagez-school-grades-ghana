import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Info, GraduationCap } from "lucide-react";
import { useCreateMockExamSession } from "@/hooks/useMockExams";
import {
  useMockExamDepartments,
  useMockExamClasses,
  getExamTypeName,
} from "@/hooks/useMockExamDepartments";
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
  const [year, setYear] = useState("2024/2025");
  const [term, setTerm] = useState("Term 1");
  const [date, setDate] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

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
    setYear("2024/2025");
    setTerm("Term 1");
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
    const result = await createSession.mutateAsync({
      name: name.trim(),
      academic_year: year,
      term,
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

              {/* Academic Year and Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Input
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024/2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department Filter - JHS/SHS only */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Department (JHS / SHS)
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
                    <SelectValue placeholder="All JHS & SHS departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All JHS & SHS</SelectItem>
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
                  Mock exams are only available for Junior High (BECE) and Senior High (WASSCE) students
                </p>
                {departments.length === 0 && !departmentsLoading && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No JHS or SHS departments found. Please ensure your school has Junior High or Senior High departments set up.
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
                  <strong>Mock Exams</strong> are for JHS (BECE) and SHS (WASSCE) students only.
                  After creating the session, you can add scores for students from the selected classes.
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
