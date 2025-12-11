import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Layers, X, Eye, Filter, BookOpen } from "lucide-react";
import { useSubjectCombinations, useDeleteSubjectCombination, useCreateSubjectCombination, useUpdateSubjectCombination, SubjectCombination } from "@/hooks/useSubjectCombinations";
import { useDepartments } from "@/hooks/useDepartments";
import { useSubjects } from "@/hooks/useSubjects";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDepartmentForDisplay } from "@/utils/departmentMapping";
import { TablePagination } from "@/components/ui/table-pagination";

// Combination Form Dialog Component
const CombinationFormDialog = ({
  isOpen,
  onOpenChange,
  combination,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  combination: SubjectCombination | null;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();
  const { data: departments = [] } = useDepartments();
  const { data: subjects = [] } = useSubjects();
  const createCombination = useCreateSubjectCombination();
  const updateCombination = useUpdateSubjectCombination();

  const [formData, setFormData] = useState({
    name: combination?.name || "",
    department_id: combination?.department_id || "",
    description: combination?.description || "",
    subject_ids: combination?.subject_ids || [],
  });

  // Reset form when combination changes (for editing)
  useEffect(() => {
    if (combination) {
      setFormData({
        name: combination.name || "",
        department_id: combination.department_id || "",
        description: combination.description || "",
        subject_ids: combination.subject_ids || [],
      });
    } else {
      setFormData({
        name: "",
        department_id: "",
        description: "",
        subject_ids: [],
      });
    }
  }, [combination]);

  const departmentSubjects = subjects.filter(s => s.department_id === formData.department_id);

  const isLoading = createCombination.isPending || updateCombination.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.department_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.subject_ids.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one subject.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (combination) {
        // Update existing combination
        await updateCombination.mutateAsync({
          id: combination.id,
          name: formData.name.trim(),
          department_id: formData.department_id,
          subject_ids: formData.subject_ids,
          description: formData.description?.trim() || undefined,
        });
      } else {
        // Create new combination
        await createCombination.mutateAsync({
          name: formData.name.trim(),
          department_id: formData.department_id,
          subject_ids: formData.subject_ids,
          description: formData.description?.trim() || undefined,
        });
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        department_id: "",
        description: "",
        subject_ids: [],
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error("Failed to save combination:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{combination ? "Edit" : "Add"} Subject Combination</DialogTitle>
          <DialogDescription>
            {combination ? "Update the subject combination details." : "Create a new subject combination for your school."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Combination Name</label>
            <Input
              placeholder="e.g., Science Core, Arts Stream"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value, subject_ids: [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{formatDepartmentForDisplay(dept.name)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              placeholder="Brief description of this combination"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {formData.department_id && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subjects</label>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                {departmentSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subjects found in this department.</p>
                ) : (
                  departmentSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center gap-2">
                      <Checkbox
                        id={subject.id}
                        checked={formData.subject_ids.includes(subject.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            subject_ids: checked
                              ? [...prev.subject_ids, subject.id]
                              : prev.subject_ids.filter(id => id !== subject.id)
                          }));
                        }}
                      />
                      <label htmlFor={subject.id} className="text-sm cursor-pointer">
                        {subject.name} {subject.code && <span className="text-muted-foreground">({subject.code})</span>}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {formData.subject_ids.length > 0 && (
                <p className="text-xs text-muted-foreground">{formData.subject_ids.length} subject(s) selected</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.department_id || formData.subject_ids.length === 0 || isLoading}>
              {isLoading ? "Saving..." : (combination ? "Update" : "Create")} Combination
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Combination Details Dialog Component
const CombinationDetailsDialog = ({
  combination,
  subjects,
  open,
  onOpenChange,
}: {
  combination: SubjectCombination | null;
  subjects: { id: string; name: string; code?: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!combination) return null;

  const combinationSubjects = subjects.filter(s => combination.subject_ids.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span>{combination.name}</span>
              <Badge variant={combination.is_active ? "default" : "secondary"} className="ml-2">
                {combination.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>Subject combination details and subjects</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Combination Name</p>
              <p className="text-sm font-semibold">{combination.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-sm">{combination.department?.name ? formatDepartmentForDisplay(combination.department.name) : "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={combination.is_active ? "default" : "secondary"}>
                {combination.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(combination.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {combination.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{combination.description}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Subjects in this combination ({combinationSubjects.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {combinationSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subjects assigned</p>
              ) : (
                combinationSubjects.map(subject => (
                  <Badge key={subject.id} variant="outline">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {subject.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ManageCombinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCombination, setEditingCombination] = useState<SubjectCombination | null>(null);
  const [viewingCombination, setViewingCombination] = useState<SubjectCombination | null>(null);
  const [deletingCombination, setDeletingCombination] = useState<SubjectCombination | null>(null);
  const [filters, setFilters] = useState({
    department_id: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: combinations = [], isLoading } = useSubjectCombinations();
  const { data: departments = [] } = useDepartments();
  const { data: subjects = [] } = useSubjects();
  const deleteCombination = useDeleteSubjectCombination();

  // Filter combinations based on search and filters
  const filteredCombinations = combinations.filter(combo => {
    const matchesSearch = !searchTerm ||
      combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !filters.department_id ||
      filters.department_id === "all" ||
      combo.department_id === filters.department_id;

    const matchesStatus = !filters.status ||
      filters.status === "all" ||
      (filters.status === "active" && combo.is_active) ||
      (filters.status === "inactive" && !combo.is_active);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCombinations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCombinations = filteredCombinations.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.department_id, filters.status]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCombinations.length, pageSize, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedCombinations([]); // Clear selection when changing pages
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedCombinations([]);
  };

  const handleAdd = () => {
    setEditingCombination(null);
    setIsFormOpen(true);
  };

  const handleEdit = (combination: SubjectCombination) => {
    setEditingCombination(combination);
    setIsFormOpen(true);
  };

  const handleView = (combination: SubjectCombination) => {
    setViewingCombination(combination);
  };

  const handleDelete = (combination: SubjectCombination) => {
    setDeletingCombination(combination);
  };

  const confirmDelete = () => {
    if (deletingCombination) {
      deleteCombination.mutate(deletingCombination.id, {
        onSuccess: () => setDeletingCombination(null),
        onError: () => setDeletingCombination(null),
      });
    }
  };

  const handleSelectCombination = (comboId: string, checked: boolean) => {
    setSelectedCombinations(prev =>
      checked ? [...prev, comboId] : prev.filter(id => id !== comboId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCombinations(checked ? paginatedCombinations.map(c => c.id) : []);
  };

  const getCombinationInitials = (name: string) => {
    const normalized = formatDepartmentForDisplay(name);
    return normalized.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeFilters =
    (filters.department_id && filters.department_id !== "all" ? 1 : 0) +
    (filters.status && filters.status !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setFilters({ department_id: "", status: "" });
    setSearchTerm("");
  };

  // Stats calculation
  const totalCombinations = combinations.length;
  const activeCombinations = combinations.filter(c => c.is_active).length;
  const inactiveCombinations = combinations.filter(c => !c.is_active).length;
  const avgSubjectsPerCombo = totalCombinations > 0
    ? Math.round(combinations.reduce((acc, c) => acc + c.subject_ids.length, 0) / totalCombinations)
    : 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Manage Subject Combinations" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject Combinations</h1>
            <p className="text-muted-foreground">
              Group subjects into combinations for easy assignment. {totalCombinations} total combinations.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Combination
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                <p className="text-6xl font-bold text-primary">{totalCombinations}</p>
                <p className="text-xs text-muted-foreground">Combinations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                <p className="text-6xl font-bold text-green-500">{activeCombinations}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                <p className="text-6xl font-bold text-gray-400">{inactiveCombinations}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                <p className="text-6xl font-bold text-gray-400">{avgSubjectsPerCombo}</p>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Subjects</p>
                  <p className="text-xs text-muted-foreground">per combination</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search combinations..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <Select
                  value={filters.department_id || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Departments" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{formatDepartmentForDisplay(dept.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Showing {filteredCombinations.length} of {totalCombinations} combinations</span>
                {searchTerm && (
                  <Badge variant="secondary" className="font-normal">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {filters.department_id && filters.department_id !== "all" && (
                  <Badge variant="secondary" className="font-normal">
                    {formatDepartmentForDisplay(departments.find(d => d.id === filters.department_id)?.name)}
                  </Badge>
                )}
                {filters.status && filters.status !== "all" && (
                  <Badge variant="secondary" className="font-normal capitalize">
                    {filters.status}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCombinations.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedCombinations.length} combination{selectedCombinations.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCombinations([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (selectedCombinations.length === 1) {
                        const combo = combinations.find(c => c.id === selectedCombinations[0]);
                        if (combo) setDeletingCombination(combo);
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
        ) : filteredCombinations.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No combinations found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || activeFilters > 0
                ? "Try adjusting your search or filters."
                : "Get started by adding a new subject combination."}
            </p>
            {!searchTerm && activeFilters === 0 && (
              <Button className="mt-6" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Combination
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
                          checked={selectedCombinations.length === paginatedCombinations.length && paginatedCombinations.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left font-semibold">Combination</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Department</th>
                      <th className="p-4 text-left font-semibold hidden sm:table-cell">Subjects</th>
                      <th className="p-4 text-left font-semibold hidden lg:table-cell">Status</th>
                      <th className="p-4 text-left font-semibold hidden xl:table-cell">Created</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCombinations.map((combination) => (
                      <tr key={combination.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedCombinations.includes(combination.id)}
                            onCheckedChange={(checked) => handleSelectCombination(combination.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                              {getCombinationInitials(combination.name)}
                            </div>
                            <div>
                              <p className="font-medium">{combination.name}</p>
                              <p className="text-muted-foreground text-xs md:hidden">
                                {combination.department?.name ? formatDepartmentForDisplay(combination.department.name) : "No department"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge variant="outline" className="text-primary">
                            {combination.department?.name ? formatDepartmentForDisplay(combination.department.name) : "Not Assigned"}
                          </Badge>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="outline">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {combination.subject_ids.length} subjects
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <Badge variant={combination.is_active ? "default" : "secondary"}>
                            {combination.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4 hidden xl:table-cell text-muted-foreground">
                          {new Date(combination.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(combination)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(combination)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(combination)}
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
                totalItems={filteredCombinations.length}
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
      <CombinationFormDialog
        isOpen={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCombination(null);
        }}
        combination={editingCombination}
        onSuccess={() => setEditingCombination(null)}
      />

      <CombinationDetailsDialog
        combination={viewingCombination}
        subjects={subjects}
        open={!!viewingCombination}
        onOpenChange={(open) => !open && setViewingCombination(null)}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingCombination}
        onOpenChange={(open) => !open && setDeletingCombination(null)}
        onConfirm={confirmDelete}
        title="Delete Subject Combination"
        description={`Are you sure you want to delete the "${deletingCombination?.name}" combination? This action cannot be undone.`}
        isLoading={deleteCombination.isPending}
      />
    </div>
  );
};

export default ManageCombinations;
