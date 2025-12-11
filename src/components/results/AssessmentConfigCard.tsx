
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface AssessmentConfigCardProps {
  formData: {
    ca_type_id: string;
    teacher_id: string;
  };
  setFormData: (data: any) => void;
  caTypes: any[];
  teachers: any[];
  selectedSBAType: any;
}

const AssessmentConfigCard = ({
  formData,
  setFormData,
  caTypes,
  teachers,
  selectedSBAType,
}: AssessmentConfigCardProps) => {
  const { isTeacher, teacherRecord } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ca_type_id">CA Type</Label>
            <Select 
              value={formData.ca_type_id} 
              onValueChange={(value) => setFormData({...formData, ca_type_id: value})}
            >
              <SelectTrigger id="ca_type_id"><SelectValue placeholder="Select a CA Type" /></SelectTrigger>
              <SelectContent>
                {caTypes.map((caType) => (
                  <SelectItem key={caType.id} value={caType.id}>{caType.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher_id">Teaching Staff</Label>
            {isTeacher ? (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{teacherRecord?.full_name}</p>
              </div>
            ) : (
              <Select value={formData.teacher_id} onValueChange={(value) => setFormData({...formData, teacher_id: value})}>
                <SelectTrigger id="teacher_id"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedSBAType && (
            <div className="md:col-span-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Assessment Structure:</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.entries(selectedSBAType.configuration).map(([key, value]) => (
                  <Badge key={key} variant="outline">{key.toUpperCase()}: {String(value)}%</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentConfigCard;
