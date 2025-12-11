import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useCreateSubject, useUpdateSubject, SubjectWithDepartment } from "@/hooks/useSubjects";
import { useDepartments } from "@/hooks/useDepartments";
import { useEffect } from "react";

interface SubjectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subject?: SubjectWithDepartment;
}

interface SubjectFormData {
  name: string;
  code?: string;
  department_id: string;
}

export function SubjectFormDialog({ isOpen, onOpenChange, subject }: SubjectFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<SubjectFormData>();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const isEditing = !!subject;
  const departmentId = watch("department_id");

  useEffect(() => {
    if (isEditing) {
      setValue("name", subject.name);
      setValue("code", subject.code || "");
      setValue("department_id", subject.department_id || "");
    } else {
      reset();
    }
  }, [isEditing, subject, setValue, reset]);

  const onSubmit = async (data: SubjectFormData) => {
    const subjectData = {
      ...data,
      code: data.code || undefined,
    };

    if (isEditing) {
      updateSubject.mutate({ id: subject.id, ...subjectData }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createSubject.mutate(subjectData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subject" : "Add New Subject"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g., Mathematics"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="e.g., MATH101 (Optional)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select value={departmentId} onValueChange={(value) => setValue("department_id", value)} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                ) : (
                  departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSubject.isPending || updateSubject.isPending}>
              {createSubject.isPending || updateSubject.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
