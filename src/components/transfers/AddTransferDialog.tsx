
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search } from "lucide-react";
import { useCreateTransfer, CreateTransferData } from "@/hooks/useTransfers";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

interface AddTransferDialogProps {
  children?: React.ReactNode;
}

const AddTransferDialog = ({ children }: AddTransferDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CreateTransferData>({
    student_id: "",
    reason: "",
    from_class_id: null,
    to_class_id: null,
    notes: "",
    academic_year: "2024/2025"
  });

  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const createTransfer = useCreateTransfer();
  const { toast } = useToast();

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === formData.student_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTransfer.mutateAsync({
        ...formData,
        from_class_id: selectedStudent?.class_id || null,
      });

      setOpen(false);
      setFormData({
        student_id: "",
        reason: "",
        from_class_id: null,
        to_class_id: null,
        notes: "",
        academic_year: "2024/2025"
      });
      setSearchTerm("");
    } catch (error) {
      console.error('Transfer creation error:', error);
    }
  };

  const triggerButton = children || (
    <Button variant="default" className="w-full text-white">
      <Plus className="w-4 h-4 mr-2" />
      New Transfer
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg ">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Transfer</DialogTitle>
            <DialogDescription>
              Create a new student transfer request between classes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student-search">Select Student *</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="student-search"
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchTerm && (
                <div className="max-h-32 overflow-y-auto border rounded-md bg-white dark:bg-gray-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b last:border-b-0"
                        onClick={() => {
                          setFormData({ ...formData, student_id: student.id });
                          setSearchTerm(`${student.full_name} (${student.student_id})`);
                        }}
                      >
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {student.student_id} | Class: {student.class?.name || 'Unassigned'}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400">No students found</div>
                  )}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border">
                <Label>Current Class</Label>
                <p>{selectedStudent.class?.name || 'Unassigned'}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Transfer To Class *</Label>
              <Select value={formData.to_class_id || ""} onValueChange={(value) => setFormData({ ...formData, to_class_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.department?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this transfer..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={formData.academic_year || ""} onValueChange={(value) => setFormData({ ...formData, academic_year: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2022/2023">2022/2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button

              type="submit"
              disabled={createTransfer.isPending}
            // className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {createTransfer.isPending ? "Creating..." : "Create Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransferDialog;
