import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, BookOpen, X, Plus, GraduationCap } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useBulkCreateTeacherAssignments, CreateTeacherAssignmentData } from "@/hooks/useTeacherAssignments";

interface TeacherAssignmentDialogProps {
  teacherId: string;
  teacherName: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SelectedAssignment {
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
}

const TeacherAssignmentDialog = ({
  teacherId,
  teacherName,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: TeacherAssignmentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => { })) : setInternalOpen;

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [isPrimaryTeacher, setIsPrimaryTeacher] = useState(false);
  const [assignments, setAssignments] = useState<SelectedAssignment[]>([]);

  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const bulkCreateAssignment = useBulkCreateTeacherAssignments();

  // Get class and subject names for display
  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);
  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);

  // Check if assignment already exists in the list
  const isDuplicateAssignment = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId) return false;
    return assignments.some(a => a.class_id === selectedClassId && a.subject_id === selectedSubjectId);
  }, [assignments, selectedClassId, selectedSubjectId]);

  const handleAddAssignment = () => {
    if (!selectedClassId || !selectedSubjectId || isDuplicateAssignment) return;

    const newAssignment: SelectedAssignment = {
      class_id: selectedClassId,
      class_name: selectedClass?.name || '',
      subject_id: selectedSubjectId,
      subject_name: selectedSubject?.name || '',
    };

    setAssignments(prev => [...prev, newAssignment]);
    setSelectedClassId("");
    setSelectedSubjectId("");
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assignments.length === 0) return;

    const assignmentData: CreateTeacherAssignmentData[] = assignments.map(a => ({
      teacher_id: teacherId,
      class_id: a.class_id,
      subject_id: a.subject_id,
      academic_year: academicYear,
      is_primary_teacher: isPrimaryTeacher,
    }));

    try {
      await bulkCreateAssignment.mutateAsync(assignmentData);
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Assignment creation error:', error);
    }
  };

  const resetForm = () => {
    setSelectedClassId("");
    setSelectedSubjectId("");
    setAcademicYear("2024/2025");
    setIsPrimaryTeacher(false);
    setAssignments([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const triggerButton = children || (
    <Button size="sm" className="bg-primary text-white">
      <UserCheck className="w-4 h-4 mr-1" />
      Assign
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Assign Teacher to Classes
            </DialogTitle>
            <DialogDescription>
              Assign <strong>{teacherName}</strong> to teach subjects in specific classes.
              You can add multiple class-subject combinations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            {/* Add Assignment Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-sm font-medium text-muted-foreground">Add Class & Subject</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Class</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger className="border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} {subject.code && `(${subject.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAssignment}
                disabled={!selectedClassId || !selectedSubjectId || isDuplicateAssignment}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isDuplicateAssignment ? "Already Added" : "Add to List"}
              </Button>
            </div>

            {/* Selected Assignments List */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Assignments to Create ({assignments.length})
              </Label>

              {assignments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border rounded-lg bg-muted/20 p-4">
                  No assignments added yet. Select a class and subject above.
                </div>
              ) : (
                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="space-y-2">
                    {assignments.map((assignment, index) => (
                      <div
                        key={`${assignment.class_id}-${assignment.subject_id}`}
                        className="flex items-center justify-between p-2 bg-background border rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {assignment.class_name}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary" className="font-normal">
                            {assignment.subject_name}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Settings Section */}
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="border-primary/20 focus:border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2022/2023">2022/2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_primary"
                      checked={isPrimaryTeacher}
                      onCheckedChange={(checked) => setIsPrimaryTeacher(checked as boolean)}
                    />
                    <Label htmlFor="is_primary" className="text-sm">
                      Class Teacher
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bulkCreateAssignment.isPending || assignments.length === 0}
              className="bg-primary text-white"
            >
              {bulkCreateAssignment.isPending
                ? "Creating..."
                : `Create ${assignments.length} Assignment${assignments.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAssignmentDialog;
