
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/hooks/useResults";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import ResultsStatsGrid from "@/components/results/ResultsStatsGrid";
import ResultsQuickActions from "@/components/results/ResultsQuickActions";
import ResultsRecentList from "@/components/results/ResultsRecentList";

const Results = () => {
  const navigate = useNavigate();
  const [showGuides, setShowGuides] = useState(true);
  const { data: results = [] } = useResults();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();

  const handleAddResult = () => navigate('/results/add-results');
  const handleManageResults = () => navigate('/results/manage-results');
  const handleViewAnalytics = () => navigate('/results/analytics');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Results Management" subtitle="Manage student academic results and performance" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {showGuides && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Results Management Guide</AlertTitle>
            <AlertDescription>
              Record, organize, and monitor student grades and performance. You can track results across academic terms and generate comprehensive reports.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setShowGuides(false)}><X className="h-4 w-4" /></Button>
          </Alert>
        )}

        <ResultsStatsGrid
          resultsCount={results.length}
          classesCount={classes.length}
          studentsCount={students.length}
          currentTermCount={results.filter(r => r.term === "first").length}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ResultsRecentList
              results={results}
              onViewAll={handleManageResults}
              onAddFirst={handleAddResult}
            />
          </div>
          <div>
            <ResultsQuickActions
              onAddResult={handleAddResult}
              onManageResults={handleManageResults}
              onViewAnalytics={handleViewAnalytics}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
