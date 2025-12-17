import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUpdateStudent, Student } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  Users,
  MapPin,
  Camera,
  Loader2,
  Trash2,
  Save,
  X,
  Calendar,
  Mail,
  Phone,
  Hash,
  Building,
  BookOpen,
} from "lucide-react";

interface EditStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const EditStudentDialog = ({
  student,
  open,
  onOpenChange,
}: EditStudentDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    class_id: "",
    department_id: "",
    academic_year: "",
    photo_url: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    address: "",
    has_left: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("basic");

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const updateStudent = useUpdateStudent();

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id || "",
        full_name: student.full_name || "",
        email: student.email || "",
        gender: student.gender || "",
        date_of_birth: student.date_of_birth || "",
        class_id: student.class_id || "",
        department_id: student.department_id || "",
        academic_year: student.academic_year || "",
        photo_url: student.photo_url || "",
        guardian_name: student.guardian_name || "",
        guardian_phone: student.guardian_phone || "",
        guardian_email: student.guardian_email || "",
        address: student.address || "",
        has_left: student.has_left || false,
      });
      setActiveSection("basic");
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const updateData = {
      ...formData,
      gender:
        formData.gender === ""
          ? undefined
          : (formData.gender as "male" | "female"),
    };

    updateStudent.mutate(
      { id: student.id, ...updateData },
      {
        onSuccess: () => {
          toast({ title: "Student updated successfully" });
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: "Failed to update student",
            variant: "destructive",
          });
        },
      }
    );
  };

  const uploadPhoto = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select JPG, PNG, or WebP",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select a file under 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      if (formData.photo_url) {
        const oldPath = formData.photo_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("student-photos").remove([oldPath]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `student-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("student-photos").getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      toast({ title: "Photo uploaded" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!formData.photo_url) return;
    try {
      const fileName = formData.photo_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("student-photos").remove([fileName]);
      }
      setFormData((prev) => ({ ...prev, photo_url: "" }));
      toast({ title: "Photo removed" });
    } catch (error) {
      toast({ title: "Failed to remove photo", variant: "destructive" });
    }
  };

  const filteredClasses = classes.filter(
    (cls) => !formData.department_id || cls.department_id === formData.department_id
  );

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "guardian", label: "Guardian", icon: Users },
    { id: "address", label: "Address", icon: MapPin },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header with Photo */}
          <div className="bg-primary/60 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              {/* Photo Section */}
              <div className="relative group flex-shrink-0">
                <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-lg">
                  <AvatarImage
                    src={formData.photo_url || undefined}
                    alt={formData.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
                    {formData.full_name ? getInitials(formData.full_name) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>

                {/* Photo overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  {formData.photo_url && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-white hover:bg-red-500/50"
                      onClick={handleRemovePhoto}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>

              {/* Header Info */}
              <div className="flex-1 min-w-0">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-xl font-semibold text-white truncate">
                    {formData.full_name || "Edit Student"}
                  </DialogTitle>
                  <DialogDescription className="text-primary/10 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" />
                    {formData.student_id || "No ID"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={formData.has_left ? "destructive" : "secondary"}
                    className={cn(
                      "text-xs",
                      !formData.has_left && "bg-green-500/20 text-green-100 hover:bg-green-500/30"
                    )}
                  >
                    {formData.has_left ? "Inactive" : "Active"}
                  </Badge>
                  {formData.department_id && (
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      {departments.find((d) => d.id === formData.department_id)?.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="border-b bg-muted/30 px-6">
            <div className="flex gap-1 -mb-px">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    activeSection === section.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              {activeSection === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id" className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        Student ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, student_id: e.target.value }))
                        }
                        placeholder="e.g., STU2024001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="student@example.com"
                      />
                    </div>



                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Gender
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        Date of Birth
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information */}
              {activeSection === "academic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-muted-foreground" />
                        Department
                      </Label>
                      <Select
                        value={formData.department_id}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            department_id: value,
                            class_id: "", // Reset class when department changes
                          }))
                        }
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

                    <div className="space-y-2">
                      <Label htmlFor="class" className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        Class
                      </Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, class_id: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academic_year" className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        Academic Year
                      </Label>
                      <Input
                        id="academic_year"
                        value={formData.academic_year}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, academic_year: e.target.value }))
                        }
                        placeholder="e.g., 2024/2025"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Student Status
                      </Label>
                      <Select
                        value={formData.has_left.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, has_left: value === "true" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Has Left
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Guardian Information */}
              {activeSection === "guardian" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Parent or guardian contact information for emergencies and communications.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="guardian_name" className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Guardian Name
                      </Label>
                      <Input
                        id="guardian_name"
                        value={formData.guardian_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, guardian_name: e.target.value }))
                        }
                        placeholder="Enter guardian's full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone" className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        Guardian Phone
                      </Label>
                      <Input
                        id="guardian_phone"
                        value={formData.guardian_phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, guardian_phone: e.target.value }))
                        }
                        placeholder="e.g., +233 XX XXX XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_email" className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Guardian Email
                      </Label>
                      <Input
                        id="guardian_email"
                        type="email"
                        value={formData.guardian_email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, guardian_email: e.target.value }))
                        }
                        placeholder="guardian@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {activeSection === "address" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Student's residential address for records and correspondence.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      Home Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="Enter complete residential address..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <Separator />
            <div className="flex items-center justify-between gap-3 p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground hidden sm:block">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStudent.isPending}
                  className="gap-1.5 bg-primary/60"
                >
                  {updateStudent.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
