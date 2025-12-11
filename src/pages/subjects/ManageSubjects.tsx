import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, MoreHorizontal, Edit, Trash2, BookOpen, X, Eye, Filter } from "lucide-react";
import { useSubjects, useDeleteSubject, SubjectWithDepartment } from "@/hooks/useSubjects";
import { useDepartments } from "@/hooks/useDepartments";
import { SubjectFormDialog } from "@/components/subjects/SubjectFormDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDepartmentForDisplay } from "@/utils/departmentMapping";
import { TablePagination } from "@/components/ui/table-pagination";

// Subject Details Dialog Component
const SubjectDetailsDialog = ({
  subject,
  open,
  onOpenChange,
}: {
  subject: SubjectWithDepartment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span>{subject.name}</span>
              {subject.code && (
                <Badge variant="outline" className="ml-2">{subject.code}</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>Subject details and information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject Name</p>
              <p className="text-sm">{subject.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject Code</p>
              <p className="text-sm">{subject.code || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-sm">{subject.department?.name ? formatDepartmentForDisplay(subject.department.name) : "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(subject.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {subject.updated_at && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{new Date(subject.updated_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ManageSubjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithDepartment | null>(null);
  const [viewingSubject, setViewingSubject] = useState<SubjectWithDepartment | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithDepartment | null>(null);
  const [filters, setFilters] = useState({
    department_id: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: subjects = [], isLoading } = useSubjects();
  const { data: departments = [] } = useDepartments();
  const deleteSubject = useDeleteSubject();

  // Get the normalized name for a selected department filter
  const selectedDeptNormalizedName = filters.department_id && filters.department_id !== "all"
    ? formatDepartmentForDisplay(departments.find(d => d.id === filters.department_id)?.name)
    : null;

  // Filter subjects based on search and filters
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchTerm ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Match by normalized department name to include all departments with same normalized name
    const matchesDepartment = !filters.department_id ||
      filters.department_id === "all" ||
      (selectedDeptNormalizedName &&
        formatDepartmentForDisplay(subject.department?.name) === selectedDeptNormalizedName);

    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.department_id]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredSubjects.length, pageSize, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedSubjects([]); // Clear selection when changing pages
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedSubjects([]);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (subject: SubjectWithDepartment) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleView = (subject: SubjectWithDepartment) => {
    setViewingSubject(subject);
  };

  const handleDelete = (subject: SubjectWithDepartment) => {
    setDeletingSubject(subject);
  };

  const confirmDelete = () => {
    if (deletingSubject) {
      deleteSubject.mutate(deletingSubject.id, {
        onSuccess: () => setDeletingSubject(null),
        onError: () => setDeletingSubject(null),
      });
    }
  };

  const handleSelectSubject = (subjectId: string, checked: boolean) => {
    setSelectedSubjects(prev =>
      checked ? [...prev, subjectId] : prev.filter(id => id !== subjectId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSubjects(checked ? paginatedSubjects.map(s => s.id) : []);
  };

  const getSubjectInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeFilters = (filters.department_id && filters.department_id !== "all" ? 1 : 0) + (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setFilters({ department_id: "" });
    setSearchTerm("");
  };

  // Stats calculation
  const totalSubjects = subjects.length;
  const subjectsByDepartment = departments.map(dept => ({
    name: formatDepartmentForDisplay(dept.name),
    count: subjects.filter(s => s.department_id === dept.id).length
  })).filter(d => d.count > 0);

  // Deduplicate departments by normalized name for the filter dropdown
  const uniqueDepartments = departments.reduce((acc, dept) => {
    const normalizedName = formatDepartmentForDisplay(dept.name);
    // Only keep the first occurrence of each normalized name
    if (!acc.some(d => formatDepartmentForDisplay(d.name) === normalizedName)) {
      acc.push(dept);
    }
    return acc;
  }, [] as typeof departments).sort((a, b) =>
    formatDepartmentForDisplay(a.name).localeCompare(formatDepartmentForDisplay(b.name))
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Manage Subjects" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">
              Manage all subjects in your school. {totalSubjects} total subjects.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                <p className="text-6xl font-bold text-primary">{totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Total Subjects</p>
              </div>
            </CardContent>
          </Card>
          {subjectsByDepartment.slice(0, 3).map((dept, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-0 justify-center">
                  <p className="text-6xl font-bold text-gray-400">{dept.count}</p>
                  <p className="text-xs text-muted-foreground truncate">{dept.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subjects by name or code..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select
                  value={filters.department_id || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Departments" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{formatDepartmentForDisplay(dept.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {activeFilters > 0 && (
                  <Button variant="ghost" onClick={clearFilters} size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilters > 0 && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredSubjects.length} of {totalSubjects} subjects</span>
                {searchTerm && (
                  <Badge variant="default" className="font-normal">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {filters.department_id && filters.department_id !== "all" && (
                  <Badge variant="outline" className="font-normal">
                    {formatDepartmentForDisplay(departments.find(d => d.id === filters.department_id)?.name)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedSubjects.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubjects([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // Handle bulk delete
                      if (selectedSubjects.length === 1) {
                        const subject = subjects.find(s => s.id === selectedSubjects[0]);
                        if (subject) setDeletingSubject(subject);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No subjects found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || activeFilters > 0
                ? "Try adjusting your search or filters."
                : "Get started by adding a new subject."}
            </p>
            {!searchTerm && activeFilters === 0 && (
              <Button className="mt-6" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            )}
            {(searchTerm || activeFilters > 0) && (
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
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
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedSubjects.length === paginatedSubjects.length && paginatedSubjects.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left font-semibold">Subject</th>
                      <th className="p-4 text-left font-semibold hidden sm:table-cell">Code</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Department</th>
                      <th className="p-4 text-left font-semibold hidden lg:table-cell">Created</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubjects.map((subject) => (
                      <tr key={subject.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={(checked) => handleSelectSubject(subject.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                              {getSubjectInitials(subject.name)}
                            </div>
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-muted-foreground text-xs sm:hidden">
                                {subject.code || "No code"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="outline">{subject.code || "N/A"}</Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge variant="default">
                            {subject.department?.name ? formatDepartmentForDisplay(subject.department.name) : "Not Assigned"}
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-muted-foreground">
                          {new Date(subject.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(subject)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(subject)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(subject)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSubjects.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 20, 30, 50]}
              />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialogs */}
      <SubjectFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        subject={editingSubject}
      />

      <SubjectDetailsDialog
        subject={viewingSubject}
        open={!!viewingSubject}
        onOpenChange={(open) => !open && setViewingSubject(null)}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
        onConfirm={confirmDelete}
        title="Delete Subject"
        description={`Are you sure you want to delete the "${deletingSubject?.name}" subject? This action cannot be undone.`}
        isLoading={deleteSubject.isPending}
      />
    </div>
  );
};

export default ManageSubjects;
