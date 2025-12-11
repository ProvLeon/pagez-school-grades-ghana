import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  BookOpen,
  Hash,
  Building,
  Loader2,
  Save,
  X,
  Pencil,
} from "lucide-react";
import { useCreateSubject, useUpdateSubject, SubjectWithDepartment } from "@/hooks/useSubjects";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddSubjectDialogProps {
  subject?: SubjectWithDepartment;
  trigger?: React.ReactNode;
}

export function AddSubjectDialog({ subject, trigger }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const { toast } = useToast();

  const isEditing = !!subject;
  const isPending = createSubject.isPending || updateSubject.isPending;

  useEffect(() => {
    if (open) {
      if (subject) {
        setName(subject.name);
        setCode(subject.code || "");
        setDepartmentId(subject.department_id || "");
      } else {
        setName("");
        setCode("");
        setDepartmentId("");
      }
    }
  }, [subject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    if (!departmentId) {
      toast({
        title: "Please select a department",
        variant: "destructive",
      });
      return;
    }

    const subjectData = {
      name: name.trim(),
      code: code.trim() || undefined,
      department_id: departmentId,
    };

    try {
      if (isEditing) {
        await updateSubject.mutateAsync({ id: subject.id, ...subjectData });
        toast({ title: "Subject updated successfully" });
      } else {
        await createSubject.mutateAsync(subjectData);
        toast({ title: "Subject created successfully" });
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving subject:", error);
      toast({
        title: isEditing ? "Failed to update subject" : "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const selectedDepartment = departments?.find((d) => d.id === departmentId);

  const defaultTrigger = (
    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
      <Plus className="w-4 h-4" />
      Add Subject
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {isEditing ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  {isEditing ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-sm">
                  {isEditing
                    ? "Update the subject information below"
                    : "Create a new subject for your curriculum"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              Subject Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mathematics, English Language"
              className="h-10"
              required
            />
          </div>

          {/* Subject Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="flex items-center gap-1.5 text-sm font-medium">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              Subject Code
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                Optional
              </Badge>
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., MATH, ENG"
              maxLength={20}
              className="h-10 font-mono uppercase"
            />
            <p className="text-xs text-muted-foreground">
              A short unique identifier for the subject (auto-capitalized)
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-1.5 text-sm font-medium">
              <Building className="w-3.5 h-3.5 text-muted-foreground" />
              Department <span className="text-red-500">*</span>
            </Label>
            <Select value={departmentId} onValueChange={setDepartmentId} required>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : departments?.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No departments found
                  </div>
                ) : (
                  departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {dept.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {(name || code || selectedDepartment) && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{name || "Subject Name"}</span>
                  {code && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {code}
                    </Badge>
                  )}
                  {selectedDepartment && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedDepartment.name}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || departmentsLoading}
                className={cn(
                  "gap-1.5",
                  "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? "Update Subject" : "Create Subject"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
