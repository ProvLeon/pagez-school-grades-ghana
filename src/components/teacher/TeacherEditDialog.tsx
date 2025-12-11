
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExtendedTeacher } from "@/hooks/useTeachers";
import { useDepartments } from "@/hooks/useDepartments";

interface TeacherEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: ExtendedTeacher | null;
  onUpdateTeacher: (teacher: ExtendedTeacher) => void;
}

const TeacherEditDialog = ({
  open,
  onOpenChange,
  teacher,
  onUpdateTeacher
}: TeacherEditDialogProps) => {
  const [editedTeacher, setEditedTeacher] = useState<ExtendedTeacher | null>(teacher);
  const { data: departments = [] } = useDepartments();

  // Update local state when teacher prop changes
  useEffect(() => {
    setEditedTeacher(teacher);
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTeacher) {
      onUpdateTeacher(editedTeacher);
    }
  };

  if (!editedTeacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] ">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editedTeacher.full_name}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, full_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editedTeacher.username || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editedTeacher.email || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editedTeacher.phone || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                value={editedTeacher.department_id || ""}
                onValueChange={(value) => setEditedTeacher({ ...editedTeacher, department_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className=" text-white">
              Update Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherEditDialog;
