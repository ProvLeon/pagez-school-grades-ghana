
import { useState } from "react";
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
import { UserCheck, BookOpen } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useCreateTeacherAssignment, CreateTeacherAssignmentData } from "@/hooks/useTeacherAssignments";

interface TeacherAssignmentDialogProps {
  teacherId: string;
  teacherName: string;
  children?: React.ReactNode;
}

const TeacherAssignmentDialog = ({ teacherId, teacherName, children }: TeacherAssignmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherAssignmentData>({
    teacher_id: teacherId,
    class_id: "",
    subject_id: "",
    academic_year: "2024/2025",
    is_primary_teacher: false,
  });

  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const createAssignment = useCreateTeacherAssignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.class_id || !formData.subject_id) {
      return;
    }

    try {
      await createAssignment.mutateAsync(formData);
      setOpen(false);
      setFormData({
        teacher_id: teacherId,
        class_id: "",
        subject_id: "",
        academic_year: "2024/2025",
        is_primary_teacher: false,
      });
    } catch (error) {
      console.error('Assignment creation error:', error);
    }
  };

  const triggerButton = children || (
    <Button size="sm" className="bg-primary text-white">
      <UserCheck className="w-4 h-4 mr-1" />
      Assign
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Assign Teacher to Class
            </DialogTitle>
            <DialogDescription>
              Assign <strong>{teacherName}</strong> to teach a subject in a specific class.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-primary font-medium">Class *</Label>
              <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                <SelectTrigger className="border-primary/20 focus:border-primary/40 ring-primary/40 focus:ring-1 focus:ring-offset-0 focus:ring-primary/40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.department?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">Subject *</Label>
              <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                <SelectTrigger className="border-primary/20 focus:border-primary/40 ring-primary/40 focus:ring-1 focus:ring-offset-0 focus:ring-primary/40">
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

            <div className="space-y-2">
              <Label className="text-primary font-medium">Academic Year</Label>
              <Select value={formData.academic_year} onValueChange={(value) => setFormData({ ...formData, academic_year: value })}>
                <SelectTrigger className="border-primary/20 focus:border-primary/40 ring-primary/40 focus:ring-1 focus:ring-offset-0 focus:ring-primary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2022/2023">2022/2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={formData.is_primary_teacher}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary_teacher: checked as boolean })}
              />
              <Label htmlFor="is_primary" className="text-sm text-primary">
                Set as Primary/Class Teacher
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-primary/20 text-primary hover:bg-primary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAssignment.isPending || !formData.class_id || !formData.subject_id}
              className="bg-primary text-white"
            >
              {createAssignment.isPending ? "Assigning..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAssignmentDialog;
