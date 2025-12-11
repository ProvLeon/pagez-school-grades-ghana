import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BehavioralSectionProps {
  conduct?: string;
  attitude?: string;
  interest?: string;
  teachersComment?: string;
  headsRemarks?: string;
}

export const BehavioralSection = ({
  conduct,
  attitude,
  interest,
  teachersComment,
  headsRemarks
}: BehavioralSectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Behavioral Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div className="flex items-center">
            <span className="font-medium w-24">CONDUCT:</span>
            <span className="border-b border-gray-400 flex-1 pb-1 ml-4">
              {conduct || "___________________________"}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-24">ATTITUDE:</span>
            <span className="border-b border-gray-400 flex-1 pb-1 ml-4">
              {attitude || "___________________________"}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-24">INTEREST:</span>
            <span className="border-b border-gray-400 flex-1 pb-1 ml-4">
              {interest || "___________________________"}
            </span>
          </div>
          
          <div className="mt-6 flex items-start">
            <span className="font-medium w-32 flex-shrink-0">CLASS TEACHER'S REMARKS:</span>
            <div className="border border-gray-300 min-h-16 p-3 bg-gray-50 flex-1 ml-4">
              {teachersComment || ""}
            </div>
          </div>
          
          <div className="mt-6 flex items-start">
            <span className="font-medium w-32 flex-shrink-0">HEAD TEACHER'S REMARKS:</span>
            <div className="border border-gray-300 min-h-16 p-3 bg-gray-50 flex-1 ml-4">
              {headsRemarks || ""}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              <div className="font-medium mb-2">CLASS TEACHER:</div>
              <div className="border-b border-gray-400 h-8 mb-2"></div>
              <div className="text-xs text-gray-600">Signature & Date</div>
            </div>
            
            <div>
              <div className="font-medium mb-2">HEAD TEACHER:</div>
              <div className="border-b border-gray-400 h-8 mb-2"></div>
              <div className="text-xs text-gray-600">Signature & Date</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};