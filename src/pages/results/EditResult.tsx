
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddResultsFormProvider } from "@/components/results/AddResultsFormProvider";
import AddResultsFormContent from "@/components/results/AddResultsFormContent";

const EditResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading } = useQuery({
    queryKey: ['result-edit', id],
    queryFn: async () => {
      if (!id) throw new Error('Result ID is required');
      
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students(*),
          class:classes(*),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Edit Result" subtitle="Loading result data..." />
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Edit Result" subtitle="Result not found" />
        <div className="p-6 max-w-6xl mx-auto">
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
        </div>
      </div>
    );
  }

  return (
    <AddResultsFormProvider initialData={result} isEditMode={true} resultId={id}>
      <div className="min-h-screen bg-background">
        <Header 
          title="Edit Result"
          subtitle={`Update result for ${result.student?.full_name} - ${result.term} Term ${result.academic_year}`}
        />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/results/manage-results')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
          </div>
          <AddResultsFormContent isEditMode={true} resultId={id} />
        </main>
      </div>
    </AddResultsFormProvider>
  );
};

export default EditResult;
