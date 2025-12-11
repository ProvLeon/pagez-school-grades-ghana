
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateClass } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeachers } from "@/hooks/useTeachers";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/lib/supabase";

interface EditClassDialogProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClassDialog = ({ classItem, open, onOpenChange }: EditClassDialogProps) => {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  
  const { toast } = useToast();
  const updateClass = useUpdateClass();
  const { data: departments = [] } = useDepartments();
  const { data: teachers = [] } = useTeachers(departmentId);

  useEffect(() => {
    if (classItem) {
      setName(classItem.name);
      setDepartmentId(classItem.department_id || "");
      setTeacherId(classItem.teacher_id || "");
      setAcademicYear(classItem.academic_year);
    }
  }, [classItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classItem || !name.trim() || !departmentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClass.mutateAsync({
        id: classItem.id,
        name: name.trim(),
        department_id: departmentId,
        academic_year: academicYear,
        teacher_id: teacherId || undefined,
      });
      
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter class name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} required>
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

          <div>
            <Label htmlFor="academic-year">Academic Year</Label>
            <Input
              id="academic-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024/2025"
            />
          </div>

          <div>
            <Label htmlFor="teacher">Class Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateClass.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateClass.isPending ? "Updating..." : "Update Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
