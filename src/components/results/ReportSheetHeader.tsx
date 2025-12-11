import { Card, CardContent } from "@/components/ui/card";

interface ReportSheetHeaderProps {
  schoolName: string;
  department: string;
  logoUrl?: string;
  studentPhotoUrl?: string;
}

export const ReportSheetHeader = ({ 
  schoolName, 
  department, 
  logoUrl, 
  studentPhotoUrl 
}: ReportSheetHeaderProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          {/* School Logo */}
          <div className="w-16 h-16 border border-gray-300 flex items-center justify-center bg-gray-50 rounded-lg">
            {logoUrl ? (
              <img src={logoUrl} alt="School Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-gray-500">LOGO</span>
            )}
          </div>
          
          {/* Student Photo */}
          <div className="w-16 h-20 border border-gray-300 flex items-center justify-center bg-gray-50 rounded-lg">
            {studentPhotoUrl ? (
              <img src={studentPhotoUrl} alt="Student Photo" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-gray-500">STUDENT PHOTO</span>
            )}
          </div>
        </div>
        
        {/* Header Text */}
        <div className="text-center space-y-1">
          <h1 className="text-sm font-bold uppercase">
            {schoolName} MUNICIPAL EDUCATION DIRECTORATE
          </h1>
          <h2 className="text-sm font-semibold">
            STUDENT'S REPORT SHEET ({department.toUpperCase()} DEPARTMENT)
          </h2>
          <h3 className="text-sm font-medium">
            {schoolName.toUpperCase()} SCHOOL
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};