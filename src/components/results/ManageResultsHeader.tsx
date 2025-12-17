
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ManageResultsHeaderProps {
  totalEntries: number;
  uniqueStudents?: number;
  uniqueClasses?: number;
}

const ManageResultsHeader = ({
  totalEntries,
  uniqueStudents = 0,
  uniqueClasses = 0
}: ManageResultsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white overflow-hidden rounded-2xl">
      <CardContent className="p-6 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Results Management Hub
                </h1>
              </div>
              <p className="text-blue-200 text-sm lg:text-base max-w-2xl">
                Review, manage and track student academic performance across all classes
              </p>
              {totalEntries > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {totalEntries} Result{totalEntries !== 1 ? 's' : ''}
                  </span>
                  {uniqueStudents > 0 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {uniqueStudents} Student{uniqueStudents !== 1 ? 's' : ''}
                    </span>
                  )}
                  {uniqueClasses > 0 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {uniqueClasses} Class{uniqueClasses !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                onClick={() => navigate('/results/add-results')}
                className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-3 shadow-xl transition-all duration-300 w-full sm:w-auto font-semibold hover:scale-105 rounded-xl border-0"
              >
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                ADD NEW RESULT
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 px-6 py-3 w-full sm:w-auto backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/results/analytics')}
              >
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageResultsHeader;
