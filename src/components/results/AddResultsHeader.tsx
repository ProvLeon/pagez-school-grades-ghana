
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddResultsHeader = () => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white overflow-hidden rounded-none md:rounded-b-2xl">
      <CardContent className="p-4 sm:p-6 md:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16 md:-translate-y-32 md:translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10 md:translate-y-16 md:-translate-x-16"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/results/manage-results')}
                  className="text-white hover:bg-white/20 p-2 md:hidden rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  Add New Result
                </h1>
              </div>
              <p className="text-blue-200 text-sm md:text-base max-w-2xl">
                Create a comprehensive student result record with subject marks and assessments
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
              <Button 
                onClick={() => navigate('/results/manage-results')}
                variant="outline" 
                className="border-white/30 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-blue-600" />
                Back to Results
              </Button>
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 md:px-6 py-2 md:py-3 shadow-xl transition-all duration-300 w-full sm:w-auto font-semibold hover:scale-105 rounded-xl border-0 order-1 sm:order-2"
                onClick={() => navigate('/results/analytics')}
              >
                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddResultsHeader;
