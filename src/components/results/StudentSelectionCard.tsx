import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { User, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  student_id: string;
  photo_url?: string;
}

interface StudentSelectionCardProps {
  formData: {
    class_id: string;
    student_id: string;
    term: "first" | "second" | "third" | "";
  };
  setFormData: (data: any) => void;
  classes: any[];
  studentsInClass: Student[];
  selectedStudent: Student | null;
  selectedClass?: any;
}

const StudentSelectionCard = ({
  formData,
  setFormData,
  classes,
  studentsInClass,
  selectedStudent,
  selectedClass,
}: StudentSelectionCardProps) => {
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on search query (by name or student ID)
  const filteredStudents = studentsInClass.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(query) ||
      student.student_id.toLowerCase().includes(query)
    );
  });

  const handleStudentSelect = (studentId: string) => {
    setFormData({ ...formData, student_id: studentId });
    setStudentSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student & Term Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Selection */}
          <div>
            <Label htmlFor="class_id">Class *</Label>
            <Select
              value={formData.class_id}
              onValueChange={(value) => setFormData({ ...formData, class_id: value, student_id: "" })}
            >
              <SelectTrigger id="class_id">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Selection with Search */}
          <div>
            <Label htmlFor="student_id">Student *</Label>
            <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={studentSearchOpen}
                  disabled={!formData.class_id}
                  className="w-full justify-between font-normal border-gray-200"
                >
                  {selectedStudent ? (
                    <span className="truncate">
                      {selectedStudent.full_name} ({selectedStudent.student_id})
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search student...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="flex flex-col items-center py-4">
                        <Search className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No student found</p>
                        <p className="text-xs text-muted-foreground">Try a different name or ID</p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading={`Students in ${selectedClass?.name || 'class'} (${filteredStudents.length})`}>
                      {filteredStudents.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={student.id}
                          onSelect={() => handleStudentSelect(student.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo_url} />
                              <AvatarFallback className="text-xs">
                                {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{student.student_id}</p>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                formData.student_id === student.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {!formData.class_id && (
              <p className="text-xs text-muted-foreground mt-1">Select a class first</p>
            )}
          </div>

          {/* Term Selection */}
          <div>
            <Label htmlFor="term">Term *</Label>
            <Select
              value={formData.term}
              onValueChange={(value: "first" | "second" | "third") => setFormData({ ...formData, term: value })}
            >
              <SelectTrigger id="term">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Term</SelectItem>
                <SelectItem value="second">Second Term</SelectItem>
                <SelectItem value="third">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Student Preview */}
        {selectedStudent && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedStudent.photo_url} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedStudent.full_name}</h3>
                <p className="text-sm text-muted-foreground">Student ID: {selectedStudent.student_id}</p>
              </div>
              {selectedClass && (
                <div className="text-right">
                  <p className="text-sm font-medium">{selectedClass.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClass.department?.name || ''}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSelectionCard;
