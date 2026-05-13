import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, KeyRound, User, BookOpen, ShieldCheck, AlertTriangle } from "lucide-react";
import { ExtendedTeacher } from "@/hooks/useTeachers";
import { TeacherAssignment } from "@/hooks/useTeacherAssignments";

interface TeacherPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: ExtendedTeacher | null;
  assignments?: TeacherAssignment[];
  onPasswordUpdate: (password: string) => Promise<void> | void;
}

const getPasswordStrength = (password: string): { label: string; color: string; width: string; icon: React.ReactNode } => {
  if (password.length === 0) return { label: "", color: "bg-muted", width: "0%", icon: null };
  if (password.length < 6)   return { label: "Too short", color: "bg-destructive", width: "20%", icon: <AlertTriangle className="w-3 h-3" /> };
  if (password.length < 8)   return { label: "Weak", color: "bg-orange-400", width: "40%", icon: <AlertTriangle className="w-3 h-3" /> };
  const hasUpper = /[A-Z]/.test(password);
  const hasNum   = /[0-9]/.test(password);
  const hasSpec  = /[^A-Za-z0-9]/.test(password);
  const score    = [hasUpper, hasNum, hasSpec].filter(Boolean).length;
  if (score === 0) return { label: "Fair",   color: "bg-yellow-400", width: "50%",  icon: null };
  if (score === 1) return { label: "Good",   color: "bg-blue-400",   width: "70%",  icon: null };
  if (score === 2) return { label: "Strong", color: "bg-green-400",  width: "88%",  icon: <ShieldCheck className="w-3 h-3" /> };
  return               { label: "Very Strong", color: "bg-green-600", width: "100%", icon: <ShieldCheck className="w-3 h-3" /> };
};

const TeacherPasswordDialog = ({
  open,
  onOpenChange,
  teacher,
  assignments = [],
  onPasswordUpdate,
}: TeacherPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignments for this teacher
  const teacherAssignments = assignments.filter(a => a.teacher_id === teacher?.id);
  const primaryAssignment  = teacherAssignments.find(a => a.is_primary_teacher);
  const assignedClass      = primaryAssignment?.class?.name
    ?? teacherAssignments[0]?.class?.name
    ?? null;
  const assignedDept       = primaryAssignment?.class?.department?.name
    ?? teacherAssignments[0]?.class?.department?.name
    ?? null;

  const strength = getPasswordStrength(newPassword);

  // Fix: Radix UI sometimes leaves `pointer-events:none` + `data-scroll-locked`
  // on document.body when a dialog is closed programmatically, making the page
  // unresponsive. Strip those attributes whenever the dialog unmounts or closes.
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-scroll-locked");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (newPassword.length < 6) return;
    setIsSubmitting(true);
    try {
      await onPasswordUpdate(newPassword);
      setNewPassword("");
      setShowPassword(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setNewPassword("");
      setShowPassword(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-white text-lg font-semibold">
                Reset Password
              </DialogTitle>
            </div>
            <p className="text-slate-400 text-sm pl-1">
              Set a new login password for this teacher account.
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Teacher info card */}
          {teacher && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                  {teacher.full_name?.charAt(0).toUpperCase() ?? "T"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {teacher.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {teacher.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {assignedClass ? (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal">
                    <BookOpen className="w-3 h-3" />
                    {assignedClass}
                    {assignedDept && ` · ${assignedDept}`}
                    {primaryAssignment && (
                      <span className="ml-1 text-primary font-medium">(Class Teacher)</span>
                    )}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs font-normal text-muted-foreground">
                    <User className="w-3 h-3" />
                    No class assigned
                  </Badge>
                )}

                {teacherAssignments.length > 1 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{teacherAssignments.length - 1} more subject{teacherAssignments.length - 1 > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <div className={`flex items-center gap-1 text-xs transition-colors ${
                  strength.label === "Too short" ? "text-destructive" :
                  strength.label === "Weak"      ? "text-orange-500"  :
                  strength.label === "Strong" || strength.label === "Very Strong" ? "text-green-600" :
                  "text-muted-foreground"
                }`}>
                  {strength.icon}
                  <span>{strength.label}</span>
                  {newPassword.length < 6 && (
                    <span className="ml-1 text-muted-foreground">
                      — minimum 6 characters required
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-5 gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={newPassword.length < 6 || isSubmitting}
            className="gap-2"
          >
            <KeyRound className="w-4 h-4" />
            {isSubmitting ? "Resetting…" : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherPasswordDialog;
