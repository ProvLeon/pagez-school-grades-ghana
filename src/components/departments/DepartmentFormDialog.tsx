import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  FileText,
  Loader2,
  Save,
  X,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  department?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface DepartmentFormData {
  name: string;
  description?: string;
}

export function DepartmentFormDialog({
  isOpen,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const { toast } = useToast();

  const isEditing = !!department;
  const isPending = createDepartment.isPending || updateDepartment.isPending;
  const watchedName = watch("name");

  useEffect(() => {
    if (isOpen) {
      if (isEditing && department) {
        setValue("name", department.name);
        setValue("description", department.description || "");
      } else {
        reset({ name: "", description: "" });
      }
    }
  }, [isOpen, isEditing, department, setValue, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    if (!data.name.trim()) {
      toast({
        title: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    };

    if (isEditing && department) {
      updateDepartment.mutate(
        { id: department.id, ...submitData },
        {
          onSuccess: () => {
            toast({ title: "Department updated successfully" });
            onOpenChange(false);
          },
          onError: () => {
            toast({
              title: "Failed to update department",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createDepartment.mutate(submitData, {
        onSuccess: () => {
          toast({ title: "Department created successfully" });
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: "Failed to create department",
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className=" px-6 py-5 text-white">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {isEditing ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  {isEditing ? "Edit Department" : "Add New Department"}
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-sm">
                  {isEditing
                    ? "Update the department information below"
                    : "Create a new department for your school"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Department Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Department name is required" })}
              placeholder="e.g., Science Department, Arts Department"
              className={cn("h-10", errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Description
              <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Briefly describe the purpose and scope of this department..."
              className="resize-none min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Add a brief description to help identify this department
            </p>
          </div>

          {/* Preview */}
          {watchedName && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold">
                    {watchedName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{watchedName}</p>
                    <p className="text-xs text-muted-foreground">
                      Department
                    </p>
                  </div>
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
                onClick={() => onOpenChange(false)}
                className="gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "gap-1.5",
                  isPending && "cursor-not-allowed opacity-70"
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
                    {isEditing ? "Update Department" : "Create Department"}
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
