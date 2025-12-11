import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Layers,
  Building,
  BookOpen,
  FileText,
  Loader2,
  Save,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useCreateSubjectCombination } from "@/hooks/useSubjectCombinations";
import { useDepartments } from "@/hooks/useDepartments";
import { useSubjects } from "@/hooks/useSubjects";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CombinationFormData {
  name: string;
  department_id: string;
  subject_ids: string[];
  description?: string;
}

export function CreateCombinationDialog() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, control, watch, setValue } =
    useForm<CombinationFormData>({
      defaultValues: {
        name: "",
        department_id: "",
        subject_ids: [],
        description: "",
      },
    });

  const createCombination = useCreateSubjectCombination();
  const { data: departments = [], isLoading: deptLoading } = useDepartments();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { toast } = useToast();

  const selectedDepartmentId = watch("department_id");
  const selectedSubjectIds = watch("subject_ids") || [];
  const watchedName = watch("name");

  const availableSubjects = subjects.filter(
    (subject) =>
      !selectedDepartmentId || subject.department_id === selectedDepartmentId
  );

  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSubjects = subjects.filter((s) =>
    selectedSubjectIds.includes(s.id)
  );

  const selectedDepartment = departments.find(
    (d) => d.id === selectedDepartmentId
  );

  const onSubmit = async (data: CombinationFormData) => {
    if (!data.name.trim()) {
      toast({
        title: "Combination name is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.department_id) {
      toast({
        title: "Please select a department",
        variant: "destructive",
      });
      return;
    }

    if (!data.subject_ids || data.subject_ids.length === 0) {
      toast({
        title: "Please select at least one subject",
        variant: "destructive",
      });
      return;
    }

    createCombination.mutate(
      {
        name: data.name.trim(),
        department_id: data.department_id,
        subject_ids: data.subject_ids,
        description: data.description?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Subject combination created successfully" });
          reset();
          setSearchTerm("");
          setOpen(false);
        },
        onError: () => {
          toast({
            title: "Failed to create combination",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setSearchTerm("");
    }
  };

  const handleDepartmentChange = (value: string) => {
    setValue("department_id", value);
    setValue("subject_ids", []); // Reset subjects when department changes
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold rounded-xl">
          <Plus className="w-4 h-4" />
          Add Combination
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Create Subject Combination
                </DialogTitle>
                <DialogDescription className="text-purple-100 text-sm">
                  Group subjects together for easier assignment
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Combination Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                Combination Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="e.g., Science Core, Arts Electives"
                className="h-10"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                Department <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="department_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    onValueChange={handleDepartmentChange}
                    value={field.value}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Subjects Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                Subjects <span className="text-red-500">*</span>
                {selectedSubjectIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-purple-100 text-purple-700"
                  >
                    {selectedSubjectIds.length} selected
                  </Badge>
                )}
              </Label>

              {!selectedDepartmentId ? (
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-dashed">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Please select a department first
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b bg-muted/30">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Subject List */}
                  <Controller
                    name="subject_ids"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <ScrollArea className="h-[180px]">
                        {subjectsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : filteredSubjects.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {searchTerm
                                ? "No subjects match your search"
                                : "No subjects available"}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-1">
                            {filteredSubjects.map((subject) => {
                              const isSelected = field.value?.includes(
                                subject.id
                              );
                              return (
                                <div
                                  key={subject.id}
                                  className={cn(
                                    "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                    isSelected
                                      ? "bg-purple-50 border border-purple-200"
                                      : "hover:bg-muted/50"
                                  )}
                                  onClick={() => {
                                    const currentValues = field.value || [];
                                    if (isSelected) {
                                      field.onChange(
                                        currentValues.filter(
                                          (id) => id !== subject.id
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...currentValues,
                                        subject.id,
                                      ]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    className={cn(
                                      isSelected &&
                                      "border-purple-600 bg-purple-600"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        "text-sm font-medium truncate",
                                        isSelected && "text-purple-700"
                                      )}
                                    >
                                      {subject.name}
                                    </p>
                                  </div>
                                  {subject.code && (
                                    <Badge
                                      variant="outline"
                                      className="font-mono text-[10px] shrink-0"
                                    >
                                      {subject.code}
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    )}
                  />
                </div>
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
                <span className="text-xs text-muted-foreground ml-1">
                  (Optional)
                </span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe the purpose of this combination..."
                className="resize-none min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Preview */}
            {(watchedName || selectedSubjects.length > 0) && (
              <>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Preview
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {watchedName || "Combination Name"}
                      </span>
                      {selectedDepartment && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedDepartment.name}
                        </Badge>
                      )}
                    </div>
                    {selectedSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubjects.map((subject) => (
                          <Badge
                            key={subject.id}
                            variant="outline"
                            className="text-xs bg-purple-50 border-purple-200 text-purple-700"
                          >
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="border-t bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCombination.isPending}
                  className={cn(
                    "gap-1.5",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  )}
                >
                  {createCombination.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Combination
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
