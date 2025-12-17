import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, Edit, Trash2, Plus, Search, MoreHorizontal, Eye, Users, X, Info } from "lucide-react";
import { useStudents, useDeleteStudent, Student } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useNavigate } from "react-router-dom";
import { EditStudentDialog } from "@/components/EditStudentDialog";
import { BulkStudentOperationsDialog } from "@/components/BulkStudentOperationsDialog";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";

const ManageStudents = () => {
  const navigate = useNavigate();
  const { isTeacher, isAdmin, teacherRecord } = useAuth();
  const {
    getAccessibleClassIds,
    getAssignedClasses,
    isLoading: teacherAccessLoading,
    hasLoaded: teacherAccessLoaded,
    teacherId
  } = useCanAccessClass();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<{ id: string, name: string } | null>(null);
  const [filters, setFilters] = useState({
    class_id: "",
    department_id: "",
    has_left: undefined as boolean | undefined,
    gender: "",
  });

  // Get teacher's accessible class IDs
  const teacherClassIds = useMemo(() => {
    if (isTeacher && teacherAccessLoaded) {
      return getAccessibleClassIds();
    }
    return [];
  }, [isTeacher, teacherAccessLoaded, getAccessibleClassIds]);

  // Check if teacher record is missing (user_id not linked in teachers table)
  const teacherRecordMissing = isTeacher && teacherAccessLoaded && !teacherId;

  // Check if teacher has no assignments (only after loading is complete and teacher record exists)
  const teacherHasNoAssignments = isTeacher && teacherAccessLoaded && !!teacherId && teacherClassIds.length === 0;

  // Filter classes dropdown to only show teacher's assigned classes if user is a teacher
  const { data: allClasses = [] } = useClasses();
  const { data: departments = [] } = useDepartments();

  const classes = useMemo(() => {
    if (isTeacher && teacherClassIds.length > 0) {
      return allClasses.filter(c => teacherClassIds.includes(c.id));
    }
    return allClasses;
  }, [isTeacher, teacherClassIds, allClasses]);

  // Build the student query filters - teachers only see students in their assigned classes
  const studentFilters = useMemo(() => {
    const baseFilters = {
      ...filters,
      class_id: filters.class_id === "all" ? "" : filters.class_id,
      department_id: filters.department_id === "all" ? "" : filters.department_id,
      search: searchTerm,
    };

    // If teacher and no specific class selected, filter by all their accessible classes
    if (isTeacher && !baseFilters.class_id && teacherClassIds.length > 0) {
      return {
        ...baseFilters,
        class_ids: teacherClassIds,
      };
    }

    return baseFilters;
  }, [filters, searchTerm, isTeacher, teacherClassIds]);

  const { data: students = [], isLoading } = useStudents(studentFilters);
  const deleteStudent = useDeleteStudent();

  const confirmDelete = () => {
    if (deletingStudent) {
      deleteStudent.mutate(deletingStudent.id, {
        onSuccess: () => setDeletingStudent(null),
        onError: () => setDeletingStudent(null),
      });
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => checked ? [...prev, studentId] : prev.filter(id => id !== studentId));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? students.map(s => s.id) : []);
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const studentNames = students.reduce((acc, student) => ({ ...acc, [student.id]: student.full_name }), {} as { [key: string]: string });

  const activeFilters = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      class_id: "",
      department_id: "",
      has_left: undefined,
      gender: "",
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Manage Students" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              {isTeacher
                ? "View students in your assigned classes."
                : "Manage all student records in your school."}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/students/add-students')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>

        {isTeacher && teacherAccessLoading && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Loading your class assignments...
            </AlertDescription>
          </Alert>
        )}

        {teacherRecordMissing && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Teacher account not linked:</strong> Your user account is not connected to a teacher record in the system.
              Please contact your administrator to link your account to your teacher profile.
            </AlertDescription>
          </Alert>
        )}

        {teacherHasNoAssignments && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You don't have any class assignments yet. Please contact your administrator to be assigned to classes before you can view students.
            </AlertDescription>
          </Alert>
        )}

        {isTeacher && teacherAccessLoaded && teacherClassIds.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You are viewing students from your assigned classes: {getAssignedClasses().map(c => c?.name).filter(Boolean).join(', ')}.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Show class filter for admins OR teachers with multiple classes */}
              {(isAdmin || (isTeacher && teacherClassIds.length > 1)) && (
                <div className="flex items-center gap-2">
                  <Select value={filters.class_id} onValueChange={(value) => setFilters(prev => ({ ...prev, class_id: value }))}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {/* Only show department filter for admins */}
                  {isAdmin && (
                    <Select value={filters.department_id} onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {activeFilters > 0 && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {(isLoading || (isTeacher && teacherAccessLoading)) ? (
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : teacherRecordMissing ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold text-destructive">Teacher Account Not Linked</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your user account is not connected to a teacher record.<br />
              Please contact your administrator to link your account.
            </p>
          </div>
        ) : teacherHasNoAssignments ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Class Assignments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be assigned to at least one class to view students.<br />
              Please contact your administrator.
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No students found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isTeacher
                ? "No students are enrolled in your assigned classes yet."
                : "Get started by adding a new student."}
            </p>
            {isAdmin && (
              <Button className="mt-6" onClick={() => navigate('/students/add-students')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 hover:bg-muted/40">
                      <th className="p-4 text-left"><Checkbox checked={selectedStudents.length === students.length && students.length > 0} onCheckedChange={handleSelectAll} /></th>
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Student ID</th>
                      <th className="p-4 text-left font-semibold hidden lg:table-cell">Class</th>
                      <th className="p-4 text-left font-semibold hidden xl:table-cell">Status</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-4"><Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)} /></td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold">
                            {student.photo_url ? <img src={student.photo_url} alt={student.full_name} className="w-full h-full rounded-full object-cover" /> : getInitials(student.full_name)}
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-muted-foreground text-xs md:hidden">{student.student_id}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">{student.student_id}</td>
                        <td className="p-4 hidden lg:table-cell">{student.class?.name || 'N/A'}</td>
                        <td className="p-4 hidden xl:table-cell"><Badge variant={student.has_left ? "outline" : "default"}>{student.has_left ? "Inactive" : "Active"}</Badge></td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingStudent(student)}>View Details</DropdownMenuItem>
                              {isAdmin && (
                                <DropdownMenuItem onClick={() => setEditingStudent(student)}>Edit</DropdownMenuItem>
                              )}
                              {isAdmin && (
                                <DropdownMenuItem onClick={() => setDeletingStudent({ id: student.id, name: student.full_name })} className="text-destructive">Delete</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>)}
      </main>

      <EditStudentDialog student={editingStudent} open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)} />
      <BulkStudentOperationsDialog selectedStudents={selectedStudents} studentNames={studentNames} open={showBulkDialog} onOpenChange={setShowBulkDialog} onClearSelection={() => setSelectedStudents([])} />
      <StudentDetailsDialog student={viewingStudent} open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)} />
      <DeleteConfirmationDialog isOpen={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)} onConfirm={confirmDelete} title="Delete Student" description={`Are you sure you want to delete ${deletingStudent?.name}?`} isLoading={deleteStudent.isPending} />
    </div>
  );
};

export default ManageStudents;
