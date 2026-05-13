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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
  User,
  Lock,
  Phone,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import TeacherAssignmentDialog from "./TeacherAssignmentDialog";
import { CreateTeacherData } from "@/hooks/useTeachers";
import { cn } from "@/lib/utils";

interface CreatedTeacher {
  id: string;
  full_name: string;
}

interface AddTeacherDialogProps {
  onAddTeacher: (teacherData: CreateTeacherData) => Promise<CreatedTeacher | undefined>;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const AddTeacherDialog = ({ onAddTeacher, trigger, children }: AddTeacherDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department_id: "",
    username: "",
    password: "",
  });

  // Post-creation prompt state
  const [showAssignPrompt, setShowAssignPrompt] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<CreatedTeacher | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  const { data: departments = [] } = useDepartments();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
      username: "",
      password: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all mandatory fields (Name, Email, and Password).",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long for security.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Auto-generate username from email prefix if not provided
    const finalFormData = {
      ...formData,
      username: formData.username.trim() || formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    };

    try {
      const result = await onAddTeacher(finalFormData);

      if (result?.id) {
        setOpen(false);
        setCreatedTeacher({
          id: result.id,
          full_name: formData.full_name,
        });
        setShowAssignPrompt(true);
        resetForm();
      }
    } catch (error) {
      console.error('Teacher creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignNow = () => {
    setShowAssignPrompt(false);
    setShowAssignmentDialog(true);
  };

  const handleAssignLater = () => {
    setShowAssignPrompt(false);
    setCreatedTeacher(null);
  };

  const handleAssignmentDialogClose = (isOpen: boolean) => {
    setShowAssignmentDialog(isOpen);
    if (!isOpen) {
      setCreatedTeacher(null);
    }
  };

  const triggerButton = trigger || children || (
    <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
      <Plus className="w-4 h-4 mr-2" />
      Add New Teacher
    </Button>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">Add New Teacher</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Setup a new teacher account. They will use their email and password to log in.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full_name" className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@example.com"
                  className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                  required
                />
                <p className="text-[10px] text-muted-foreground px-1 italic">
                  This will be the primary login credential.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  placeholder="Optional unique ID"
                  className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+233..."
                  className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Department
                </Label>
                <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                  <SelectTrigger className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all">
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

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white order-1 sm:order-2 shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Teacher Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post-creation prompt to assign teacher */}
      <AlertDialog open={showAssignPrompt} onOpenChange={setShowAssignPrompt}>
        <AlertDialogContent className="border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
              <UserCheck className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Teacher Created Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <span className="font-bold text-foreground">{createdTeacher?.full_name}</span> has been successfully onboarded.
              Would you like to assign classes and subjects to them now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleAssignLater} className="border-muted-foreground/20">
              Skip for Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAssignNow} className="bg-primary hover:bg-primary/90 text-white">
              Assign Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assignment dialog for the newly created teacher */}
      {createdTeacher && (
        <TeacherAssignmentDialog
          teacherId={createdTeacher.id}
          teacherName={createdTeacher.full_name}
          open={showAssignmentDialog}
          onOpenChange={handleAssignmentDialogClose}
        />
      )}
    </>
  );
};

export default AddTeacherDialog;
