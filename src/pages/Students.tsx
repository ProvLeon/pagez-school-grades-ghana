
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Filter, MoreVertical, UserPlus, Info, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { format } from "date-fns";

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showGuides, setShowGuides] = useState(true);

  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: classesData = [], isLoading: isLoadingClasses } = useClasses();

  const filteredStudents = students.filter(student => {
    const studentName = student.full_name || "";
    const className = student.class?.name || "";
    const studentEmail = student.email || "";

    const matchesSearch = !searchTerm ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const status = student.has_left ? "Inactive" : "Active";
    const matchesStatus = selectedStatus === "all" || status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesClass = selectedClass === "all" || className === selectedClass;

    return matchesSearch && matchesStatus && matchesClass;
  });

  const calculateAge = (dob?: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const uniqueClassNames = Array.from(new Set(classesData.map(c => c.name))).sort();
  const filterClasses = ["all", ...uniqueClassNames];

  if (isLoadingStudents || isLoadingClasses) {
     return (
      <div className="min-h-screen bg-background">
        <Header title="Students" subtitle="Manage student records and information" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Students" subtitle="Manage student records and information" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {showGuides && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Student Management Guide</AlertTitle>
            <AlertDescription>
              Add, organize, and monitor all student records. You can assign students to classes, maintain contact information, and track their academic status.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setShowGuides(false)}><X className="h-4 w-4" /></Button>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             {/* Filter Dropdown could be improved here, but keeping consistent with previous UI for now */}
             <div className="flex gap-2">
               <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {filterClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls === "all" ? "All Classes" : cls}
                    </option>
                  ))}
                </select>
             </div>

            <Button className="gap-2 w-full md:w-auto">
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 p-4 bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{student.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{student.class?.name || "No Class"}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{student.gender || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{calculateAge(student.date_of_birth)} years</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <Badge variant={!student.has_left ? "default" : "secondary"}>
                    {!student.has_left ? "Active" : "Inactive"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No Students Found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm ? "Try adjusting your search filters." : "Get started by adding a new student."}
              </p>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Students;
