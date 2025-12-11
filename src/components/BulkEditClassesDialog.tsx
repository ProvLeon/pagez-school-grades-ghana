
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Search } from "lucide-react";
import { useClasses, useUpdateClass } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeachers } from "@/hooks/useTeachers";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/lib/supabase";

interface BulkEditClassesDialogProps {
  trigger?: React.ReactNode;
}

export const BulkEditClassesDialog = ({ trigger }: BulkEditClassesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkChanges, setBulkChanges] = useState({
    department_id: "no-change",
    teacher_id: "no-change",
    academic_year: "",
  });

  const { toast } = useToast();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: teachers = [] } = useTeachers();
  const updateClass = useUpdateClass();

  // Filter classes by search term
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClasses.length === filteredClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(filteredClasses.map(cls => cls.id));
    }
  };

  const handleBulkEdit = async () => {
    if (selectedClasses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    const changes = Object.entries(bulkChanges).reduce((acc, [key, value]) => {
      if (value && value !== "no-change") acc[key] = value;
      return acc;
    }, {} as any);

    if (Object.keys(changes).length === 0) {
      toast({
        title: "Error",
        description: "Please specify at least one change to apply",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply changes to all selected classes
      await Promise.all(
        selectedClasses.map(classId =>
          updateClass.mutateAsync({ id: classId, ...changes })
        )
      );

      toast({
        title: "Success",
        description: `Updated ${selectedClasses.length} classes successfully`,
      });

      setOpen(false);
      setSelectedClasses([]);
      setBulkChanges({
        department_id: "no-change",
        teacher_id: "no-change",
        academic_year: "",
      });
      setSearchTerm("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update classes",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start ">
            <Edit className="w-4 h-4 mr-2" />
            Bulk Edit Classes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Edit Classes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Search Classes</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search classes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Classes ({selectedClasses.length} of {filteredClasses.length} selected)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {selectedClasses.length === filteredClasses.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
              {filteredClasses.map((cls) => (
                <div key={cls.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cls.id}
                    checked={selectedClasses.includes(cls.id)}
                    onCheckedChange={() => handleClassToggle(cls.id)}
                  />
                  <Label htmlFor={cls.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>{cls.name}</span>
                      <span className="text-sm text-gray-500">
                        {cls.department?.name} • {cls.teacher?.full_name || 'No teacher'}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Department</Label>
              <Select
                value={bulkChanges.department_id}
                onValueChange={(value) => setBulkChanges(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Change department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Class Teacher</Label>
              <Select
                value={bulkChanges.teacher_id}
                onValueChange={(value) => setBulkChanges(prev => ({ ...prev, teacher_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Change teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Academic Year</Label>
              <Input
                placeholder="Change academic year (optional)"
                value={bulkChanges.academic_year}
                onChange={(e) => setBulkChanges(prev => ({ ...prev, academic_year: e.target.value }))}
              />
            </div>
          </div>

          {selectedClasses.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Changes will be applied to {selectedClasses.length} selected class(es)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkEdit}
              disabled={updateClass.isPending || selectedClasses.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateClass.isPending ? "Updating..." : `Update ${selectedClasses.length} Classes`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
