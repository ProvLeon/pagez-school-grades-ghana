
import { useState } from "react";
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
import { ExtendedTeacher } from "@/hooks/useTeachers";

interface TeacherPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: ExtendedTeacher | null;
  onPasswordUpdate: (password: string) => void;
}

const TeacherPasswordDialog = ({
  open,
  onOpenChange,
  teacher,
  onPasswordUpdate
}: TeacherPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordUpdate = () => {
    onPasswordUpdate(newPassword);
    setNewPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for <strong>{teacher?.full_name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePasswordUpdate} className="bg-blue-500 hover:bg-blue-600 text-white">
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherPasswordDialog;
