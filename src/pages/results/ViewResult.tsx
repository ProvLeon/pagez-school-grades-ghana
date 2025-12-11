import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, MoreVertical, Award, TrendingUp, Users, Calendar } from "lucide-react";
import { useReportCards } from "@/hooks/useReportCards";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOverallPosition } from "@/hooks/useOverallPosition";
import { MobileStudentSummary } from "@/components/results/MobileStudentSummary";
import { MobileSubjectCard } from "@/components/results/MobileSubjectCard";
import { StudentInfoSection } from "@/components/results/StudentInfoSection";
import { SubjectsTableSection } from "@/components/results/SubjectsTableSection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ViewResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { generateSingleReport, isGenerating } = useReportCards();
  const isMobile = useIsMobile();

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', id],
    queryFn: async () => {
      if (!id) throw new Error('Result ID is required');
      
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students(*),
          class:classes(*, department:departments(*)),
          teacher:teachers(*),
          ca_type:ca_types(*),
          subject_marks(*, subject:subjects(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="View Result" subtitle="Loading student result..." />
        <div className="p-4 max-w-4xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-32"></div>
            <Card><CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="h-24 bg-muted rounded"></div>
            </CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="h-48 bg-muted rounded"></div>
            </CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="View Result" subtitle="Result not found" />
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Result Not Found</h3>
              <p className="text-muted-foreground mb-4">The requested result could not be found.</p>
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

  const subjectMarks = result.subject_marks || [];
  const totalSubjects = subjectMarks.length;
  const calculatedTotalScore = subjectMarks.reduce((sum, mark) => sum + (mark.total_score || 0), 0);
  const averageScore = totalSubjects > 0 ? calculatedTotalScore / totalSubjects : 0;
  const excellentGrades = subjectMarks.filter(mark => mark.grade === 'A').length;
  const passedSubjects = subjectMarks.filter(mark => mark.grade && !['F', 'E'].includes(mark.grade)).length;
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
            <Button variant="outline" onClick={() => generateSingleReport(id)} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-4">
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
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(passPercentage)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Excellent Grades</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{excellentGrades}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSubjects}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectsTableSection 
              subjectMarks={result.subject_marks || []}
              caTypeConfig={result.ca_type?.configuration}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewResult;