import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, Award, TrendingUp, Users } from "lucide-react";
import { useReportCards } from "@/hooks/useReportCards";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOverallPosition } from "@/hooks/useOverallPosition";
import { StudentInfoSection } from "@/components/results/StudentInfoSection";
import { SubjectsTableSection } from "@/components/results/SubjectsTableSection";
import { Card, CardContent } from "@/components/ui/card";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

const ViewResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { generateSingleReport, isGenerating } = useReportCards();
  const isMobile = useIsMobile();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['result', id],
    queryFn: async () => {
      if (!id) throw new Error('Result ID is required');

      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students!inner(*),
          class:classes!inner(*, department:departments(*)),
          teacher:teachers(*),
          ca_type:ca_types(*),
          subject_marks(*, subject:subjects(*))
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[ViewResult] Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Result not found');
      }

      console.log('[ViewResult] Fetched result:', {
        id: data.id,
        hasTeacher: !!data.teacher,
        hasCaType: !!data.ca_type,
        subjectMarksCount: data.subject_marks?.length
      });

      return data;
    },
    enabled: !!id,
  });

  const { data: positionData, isLoading: isLoadingPosition } = useOverallPosition({
    resultId: result?.id || '',
    classId: result?.class_id || null,
    academicYear: result?.academic_year || '',
    term: result?.term || '',
    enabled: !!result
  });

  const { settings, loading: isSettingsLoading } = useSchoolSettings();

  if (isLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="View Result" subtitle="Loading student result..." />
        <div className="p-4 max-w-4xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-32"></div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-48"></div>
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-48"></div>
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="View Result" subtitle="Result not found" />
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Result Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error ? `Error: ${error.message}` : 'The requested result could not be found.'}
              </p>
              <Button onClick={() => navigate('/results/manage-results')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  interface SubjectMark {
    total_score?: number;
    grade?: string;
  }

  const subjectMarks: SubjectMark[] = result.subject_marks || [];
  const totalSubjects = subjectMarks.length;
  const calculatedTotalScore = subjectMarks.reduce((sum: number, mark: SubjectMark) => sum + (mark.total_score || 0), 0);
  const averageScore = totalSubjects > 0 ? calculatedTotalScore / totalSubjects : 0;
  const excellentGrades = subjectMarks.filter((mark: SubjectMark) => mark.grade === 'A').length;
  const passedSubjects = subjectMarks.filter((mark: SubjectMark) => mark.grade && !['F', 'E'].includes(mark.grade)).length;
  const passPercentage = totalSubjects > 0 ? (passedSubjects / totalSubjects) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Student Result"
        subtitle={`${result.student?.full_name} - ${result.term} Term ${result.academic_year}`}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/results/manage-results')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/results/edit/${id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => generateSingleReport(id!)} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/20 pb-8">
          {/* Header Theme Strip */}
          <div className="h-4 w-full bg-primary" />

          <CardContent className="p-0 sm:p-6 lg:p-10 space-y-8">
            <StudentInfoSection
              studentName={result.student?.full_name}
              className={result.class?.name}
              academicYear={result.academic_year}
              term={result.term}
              noOnRoll={result.student?.no_on_roll}
              date={new Date().toISOString().split('T')[0]}
              overallPosition={positionData?.position}
              nextTermBegins={result.next_term_begin}
              isLoadingPosition={isLoadingPosition}
            />

            {/* Premium Metrics Sub-header */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-2xl border border-border/50 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <TrendingUp size={14} className="text-primary" />
                  Average Score
                </span>
                <span className="text-3xl font-bold text-primary">
                  {Math.round(averageScore)}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-2xl border border-border/50 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <Award size={14} className="text-primary" />
                  Pass Rate
                </span>
                <span className="text-3xl font-bold text-primary">
                  {Math.round(passPercentage)}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-2xl border border-border/50 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <Award size={14} className="text-primary" />
                  Excellence
                </span>
                <span className="text-3xl font-bold text-primary">
                  {excellentGrades} <span className="text-sm font-normal text-muted-foreground">('A's)</span>
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-2xl border border-border/50 backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <Users size={14} className="text-primary" />
                  Subjects Taken
                </span>
                <span className="text-3xl font-bold text-primary">
                  {totalSubjects}
                </span>
              </div>
            </div>

            <div className="px-4 sm:px-0 pt-4">
              <SubjectsTableSection
                subjectMarks={result.subject_marks || []}
                caTypeConfig={result.ca_type?.configuration}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewResult;
