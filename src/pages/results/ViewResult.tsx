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
    <div className="min-h-screen bg-transparent pb-12">
      <Header
        title="Student Record Dossier"
        subtitle={`${result.student?.full_name} — ${result.term} Term ${result.academic_year}`}
      />

      <main className="container mx-auto px-4 py-6 space-y-6 w-full">
        {/* Actions Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <Button
            variant="outline"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/results/manage-results');
              }
            }}
            className="rounded-xl border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate(`/results/edit/${id}`)}
              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 transition-all font-semibold flex-1 sm:flex-none"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Result
            </Button>
            <Button
              onClick={() => generateSingleReport(id!)}
              disabled={isGenerating}
              className="rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex-1 sm:flex-none font-semibold border-0"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Banner identity */}
          <StudentInfoSection
            studentName={result.student?.full_name}
            photoUrl={result.student?.photo_url}
            className={result.class?.name}
            academicYear={result.academic_year}
            term={result.term}
            noOnRoll={result.student?.no_on_roll}
            date={new Date().toISOString().split('T')[0]}
            overallPosition={positionData?.position}
            nextTermBegins={result.next_term_begin}
            isLoadingPosition={isLoadingPosition}
          />

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex flex-col justify-center group transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-500/30">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition-colors" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                Average Score
              </span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {Math.round(averageScore)}<span className="text-xl text-slate-400 font-bold ml-0.5">%</span>
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex flex-col justify-center group transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-500/30">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10 transition-colors" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                Pass Rate
              </span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {Math.round(passPercentage)}<span className="text-xl text-slate-400 font-bold ml-0.5">%</span>
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex flex-col justify-center group transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-500/30">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 dark:bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10 transition-colors" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                Excellence
              </span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {excellentGrades} <span className="text-sm font-semibold text-slate-400 ml-1">('A' grades)</span>
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex flex-col justify-center group transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-500/30">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 dark:bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10 transition-colors" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                Subjects Taken
              </span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {totalSubjects}
              </span>
            </div>
          </div>

          <SubjectsTableSection
            subjectMarks={result.subject_marks || []}
            caTypeConfig={result.ca_type?.configuration}
          />
        </div>
      </main>
    </div>
  );
};

export default ViewResult;
