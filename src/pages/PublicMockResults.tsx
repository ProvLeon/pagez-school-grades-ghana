import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  GraduationCap,
  AlertCircle,
  FileText,
  Award,
  TrendingUp,
  User,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getExamTypeName } from '@/hooks/useMockExamDepartments';

// Helper to get grade info from aggregate
const getGradeFromAggregate = (aggregate: number, examType: 'bece' | 'wassce') => {
  // For BECE: aggregate ranges from 6 (best) to 54 (worst)
  // For WASSCE: aggregate ranges from 8 (best) to 72 (worst)
  const maxAggregate = examType === 'bece' ? 30 : 36;
  const isPassing = aggregate <= maxAggregate;

  let grade = 'F';
  if (examType === 'bece') {
    if (aggregate <= 12) grade = 'A';
    else if (aggregate <= 18) grade = 'B';
    else if (aggregate <= 24) grade = 'C';
    else if (aggregate <= 30) grade = 'D';
    else if (aggregate <= 36) grade = 'E';
    else grade = 'F';
  } else {
    if (aggregate <= 16) grade = 'A';
    else if (aggregate <= 24) grade = 'B';
    else if (aggregate <= 32) grade = 'C';
    else if (aggregate <= 40) grade = 'D';
    else if (aggregate <= 48) grade = 'E';
    else grade = 'F';
  }

  return { grade, isPassing };
};

interface MockSession {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_published: boolean;
}

interface MockResult {
  id: string;
  student_id: string;
  session_id: string;
  total_score: number | null;
  class_id: string | null;
  position: number | null;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    student_id: string;
    no_on_roll: string | null;
    class: {
      id: string;
      name: string;
    } | null;
  } | null;
  subject_marks: Array<{
    id: string;
    subject_id: string;
    total_score: number | null;
    grade: string | null;
    subject?: {
      id: string;
      name: string;
    } | null;
  }>;
}

const PublicMockResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<MockResult | null>(null);

  // Fetch session info
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['public-mock-session', sessionId],
    enabled: !!sessionId,
    retry: false,
    queryFn: async (): Promise<MockSession | null> => {
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from('mock_exam_sessions')
        .select('id, name, academic_year, term, is_published')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Determine exam type from session name (BECE for JHS, WASSCE for SHS)
  const examType: 'bece' | 'wassce' = useMemo(() => {
    if (!session) return 'bece';
    const name = session.name.toLowerCase();
    if (name.includes('wassce') || name.includes('shs') || name.includes('senior')) {
      return 'wassce';
    }
    return 'bece';
  }, [session]);

  // Fetch results for published session
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['public-mock-results', sessionId],
    enabled: !!sessionId && session?.is_published === true,
    queryFn: async (): Promise<MockResult[]> => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from('mock_exam_results')
        .select(`
          id,
          student_id,
          session_id,
          total_score,
          class_id,
          position,
          created_at,
          student:students(
            id,
            full_name,
            student_id,
            no_on_roll,
            class:classes(id, name)
          ),
          subject_marks:mock_exam_subject_marks(
            id,
            subject_id,
            total_score,
            grade,
            subject:subjects(id, name)
          )
        `)
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });

      if (error) throw error;

      return (data || []).map((r) => {
        const studentData = r.student as unknown;
        let studentObj: MockResult['student'] = null;

        if (studentData) {
          if (Array.isArray(studentData) && studentData.length > 0) {
            const s = studentData[0] as Record<string, unknown>;
            const classData = s.class;
            studentObj = {
              id: s.id as string,
              full_name: s.full_name as string,
              student_id: s.student_id as string,
              no_on_roll: s.no_on_roll as string | null,
              class: Array.isArray(classData) && classData.length > 0
                ? (classData[0] as { id: string; name: string })
                : (classData as { id: string; name: string } | null),
            };
          } else if (typeof studentData === 'object' && !Array.isArray(studentData)) {
            const s = studentData as Record<string, unknown>;
            const classData = s.class;
            studentObj = {
              id: s.id as string,
              full_name: s.full_name as string,
              student_id: s.student_id as string,
              no_on_roll: s.no_on_roll as string | null,
              class: Array.isArray(classData) && classData.length > 0
                ? (classData[0] as { id: string; name: string })
                : (classData as { id: string; name: string } | null),
            };
          }
        }

        // Process subject marks - handle nested subject relation
        const processedSubjectMarks = (r.subject_marks || []).map((mark: Record<string, unknown>) => {
          const subjectData = mark.subject;
          let subjectObj: { id: string; name: string } | null = null;

          if (subjectData) {
            if (Array.isArray(subjectData) && subjectData.length > 0) {
              subjectObj = subjectData[0] as { id: string; name: string };
            } else if (typeof subjectData === 'object') {
              subjectObj = subjectData as { id: string; name: string };
            }
          }

          return {
            id: mark.id as string,
            subject_id: mark.subject_id as string,
            total_score: mark.total_score as number | null,
            grade: mark.grade as string | null,
            subject: subjectObj,
          };
        });

        return {
          ...r,
          student: studentObj,
          subject_marks: processedSubjectMarks,
        };
      }) as MockResult[];
    },
  });

  // Filter results by search term
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;

    const query = searchTerm.toLowerCase().trim();
    return results.filter((r) => {
      const studentName = r.student?.full_name?.toLowerCase() || '';
      const studentId = r.student?.student_id?.toLowerCase() || '';
      const noOnRoll = r.student?.no_on_roll?.toLowerCase() || '';
      return (
        studentName.includes(query) ||
        studentId.includes(query) ||
        noOnRoll.includes(query)
      );
    });
  }, [results, searchTerm]);

  // Get grade info - use the derived examType
  const getGradeInfo = (aggregate: number) => {
    return getGradeFromAggregate(aggregate, examType);
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Session not found or error
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Session Not Found</h2>
              <p className="text-muted-foreground">
                The mock exam session you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session not published
  if (!session.is_published) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-orange-500 mx-auto" />
              <h2 className="text-xl font-semibold">Results Not Published</h2>
              <p className="text-muted-foreground">
                This mock exam session has not been published yet. Please check back later.
              </p>
              <Badge variant="secondary" className="text-sm">
                {session.name}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Mock Exam Results</h1>
          </div>
          <p className="text-primary-foreground/80">
            View published mock examination results
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {session.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {session.academic_year} • {session.term}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Published
                </Badge>
                <Badge variant="outline">
                  {getExamTypeName(examType)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {results.length > 0
                    ? Math.round(
                      results.reduce((sum, r) => sum + (r.total_score || 0), 0) /
                      results.length
                    )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {results.length > 0
                    ? (
                      results.reduce((sum, r) => sum + (r.position || 54), 0) /
                      results.length
                    ).toFixed(1)
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Aggregate</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {results.length > 0
                    ? Math.round(
                      (results.filter((r) => (r.position || 54) <= 24).length /
                        results.length) *
                      100
                    )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search by student name or ID
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by student name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Results
              {searchTerm && (
                <Badge variant="secondary" className="ml-2">
                  {filteredResults.length} of {results.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'No results found matching your search.'
                    : 'No results available for this session.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-center">Avg Score</TableHead>
                      <TableHead className="text-center">Aggregate</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result, index) => {
                      const score = result.total_score || 0;
                      const aggregate = result.position || 54;
                      const isPassing = aggregate <= 24;
                      return (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {result.student?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.student?.no_on_roll ||
                                  result.student?.student_id ||
                                  '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.student?.class?.name || '-'}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {score}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={isPassing ? 'default' : 'destructive'}
                            >
                              {aggregate}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResult(result)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Result Details Modal */}
        {selectedResult && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedResult.student?.full_name || 'Student Details'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
              <CardDescription>
                {selectedResult.student?.class?.name} •{' '}
                {selectedResult.student?.no_on_roll ||
                  selectedResult.student?.student_id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{selectedResult.total_score || 0}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{selectedResult.position || 54}</p>
                  <p className="text-sm text-muted-foreground">Aggregate</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Subject Breakdown */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Subject Breakdown
                </h4>
                {selectedResult.subject_marks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No subject details available.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedResult.subject_marks.map((mark) => (
                      <div
                        key={mark.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm">{mark.subject?.name || 'Subject'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mark.total_score || 0}%</span>
                          {mark.grade && (
                            <Badge variant="outline" className="text-xs">
                              {mark.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Results are published by the school administration.</p>
          <p>For any queries, please contact your school.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicMockResults;
