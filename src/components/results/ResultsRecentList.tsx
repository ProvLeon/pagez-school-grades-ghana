
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Result } from "@/hooks/useResults";

interface ResultsRecentListProps {
  results: Result[];
  onViewAll: () => void;
  onAddFirst: () => void;
}

const ResultsRecentList = ({ results, onViewAll, onAddFirst }: ResultsRecentListProps) => {
  const recentResults = results.slice(0, 5);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          Recent Results
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {recentResults.length > 0 ? (
          <div className="space-y-4">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {result.student?.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm md:text-base text-gray-900">{result.student?.full_name}</p>
                    <p className="text-xs md:text-sm text-blue-600 font-medium">
                      {result.class?.name} • {result.term} Term • {result.academic_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.total_score !== null && result.total_score !== undefined && (
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${result.total_score >= 70 ? 'bg-green-100 text-green-700' :
                        result.total_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {result.total_score}%
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 p-2">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first student result</p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={onAddFirst}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Result
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsRecentList;
