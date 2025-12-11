
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ManageResultsLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg border-0 overflow-hidden rounded-xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading results...</h3>
                  <p className="text-gray-500">Please wait while we fetch your data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageResultsLoadingState;
