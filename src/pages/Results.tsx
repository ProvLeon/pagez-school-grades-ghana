import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/hooks/useResults";
import { useClasses } from "@/hooks/useClasses";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter, Info, X, FileText, BarChart3, Eye, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { Skeleton } from "@/components/ui/skeleton";

const Results = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const { isTeacher, isAdmin } = useAuth();
  const { getAccessibleClassIds, hasLoaded: teacherAccessLoaded, teacherId } = useCanAccessClass();

  const { data: results = [], isLoading } = useResults();
  const { data: allClasses = [] } = useClasses();

  // For teachers, filter to their assigned classes
  const accessibleClassIds = useMemo(() => {
    if (isTeacher && teacherAccessLoaded) {
      return getAccessibleClassIds();
    }
    return [];
  }, [isTeacher, teacherAccessLoaded, getAccessibleClassIds]);

  const teacherRecordMissing = isTeacher && teacherAccessLoaded && !teacherId;
  const teacherHasNoAssignments = isTeacher && teacherAccessLoaded && !!teacherId && accessibleClassIds.length === 0;

  const classes = useMemo(() => {
    if (isAdmin) return allClasses;
    if (isTeacher) {
      // Teachers only see their assigned classes (empty if no assignments)
      return allClasses.filter(cls => accessibleClassIds.includes(cls.id));
    }
    return allClasses;
  }, [allClasses, isAdmin, isTeacher, accessibleClassIds]);

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      // For teachers, only show their assigned classes
      // If teacher has no assignments, they see nothing
      if (isTeacher && !isAdmin) {
        if (!accessibleClassIds.includes(result.class_id)) {
          return false;
        }
      }

      const matchesSearch = !searchTerm ||
        result.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(result.class_id);
      const matchesTerm = selectedTerms.length === 0 || selectedTerms.includes(result.term);

      return matchesSearch && matchesClass && matchesTerm;
    });
  }, [results, searchTerm, selectedClasses, selectedTerms, isTeacher, isAdmin, accessibleClassIds]);

  const toggleClassFilter = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const toggleTermFilter = (term: string) => {
    setSelectedTerms(prev =>
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const clearFilters = () => {
    setSelectedClasses([]);
    setSelectedTerms([]);
  };

  const activeFiltersCount = selectedClasses.length + selectedTerms.length;

  // Stats calculations - use filtered results for teachers
  const statsResults = useMemo(() => {
    if (isTeacher && !isAdmin) {
      // For teachers, stats should reflect only their accessible classes
      return results.filter(r => accessibleClassIds.includes(r.class_id));
    }
    return results;
  }, [results, isTeacher, isAdmin, accessibleClassIds]);

  const currentTermResults = statsResults.filter(r => r.term === "first").length;
  const uniqueStudents = new Set(statsResults.map(r => r.student_id)).size;

  const terms = ["first", "second", "third"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Results" subtitle="Manage student academic results" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Results" subtitle="Manage student academic results" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Teacher no assignments alert */}
        {isTeacher && teacherAccessLoaded && (teacherRecordMissing || teacherHasNoAssignments) && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You don't have any class assignments yet. Please contact your administrator to be assigned to classes.
            </AlertDescription>
          </Alert>
        )}

        {showGuide && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Results Management</AlertTitle>
            <AlertDescription>
              Record, organize, and monitor student grades and performance. Track results across academic terms and generate reports.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setShowGuide(false)}>
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name or ID..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button className="gap-2 w-full md:w-auto" onClick={() => navigate('/results/add-results')}>
              <Plus className="w-4 h-4" />
              <span>Add Result</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={activeFiltersCount > 0 ? "border-primary" : ""}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Class</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {classes.map((cls) => (
                  <DropdownMenuCheckboxItem
                    key={cls.id}
                    checked={selectedClasses.includes(cls.id)}
                    onCheckedChange={() => toggleClassFilter(cls.id)}
                  >
                    {cls.name}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Term</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {terms.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    checked={selectedTerms.includes(t)}
                    onCheckedChange={() => toggleTermFilter(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)} Term
                  </DropdownMenuCheckboxItem>
                ))}
                {activeFiltersCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground"
                      onClick={clearFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Results Table */}
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-0">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchTerm || activeFiltersCount > 0
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first result."}
                    </p>
                    {!searchTerm && activeFiltersCount === 0 && (
                      <Button className="mt-6" onClick={() => navigate('/results/add-results')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Result
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.slice(0, 10).map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {result.student?.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{result.student?.full_name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{result.student?.student_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{result.class?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {result.term.charAt(0).toUpperCase() + result.term.slice(1)} Term
                            </Badge>
                          </TableCell>
                          <TableCell>{result.academic_year}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/results/view/${result.id}`)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {filteredResults.length > 10 && (
                  <div className="p-4 border-t text-center">
                    <Button variant="outline" onClick={() => navigate('/results/manage-results')}>
                      View All {filteredResults.length} Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Results</span>
                    <Badge variant="secondary" className="bg-primary/10">{statsResults.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <Badge variant="secondary" className="bg-primary/10">{uniqueStudents}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Classes</span>
                    <Badge variant="secondary" className="bg-primary/10">{classes.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Term</span>
                    <Badge variant="secondary" className="bg-primary/10">{currentTermResults}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/results/add-results')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Result
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/results/manage-results')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Results
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/results/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
