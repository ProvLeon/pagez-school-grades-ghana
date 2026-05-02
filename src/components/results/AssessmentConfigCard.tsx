
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CAType {
  id: string;
  name: string;
  configuration: Record<string, number>;
  description?: string;
}

interface SBAType {
  id: string;
  name: string;
  configuration: Record<string, number>;
  description?: string;
}

interface AssessmentConfigCardProps {
  formData: {
    ca_type_id: string;
  };
  setFormData: (data: Record<string, unknown>) => void;
  caTypes: CAType[];
  selectedSBAType: SBAType | null;
}

const AssessmentConfigCard = ({
  formData,
  setFormData,
  caTypes,
  selectedSBAType,
}: AssessmentConfigCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ca_type_id">CA Type (SBA)</Label>
            <Select
              value={formData.ca_type_id}
              onValueChange={(value) => setFormData({ ...formData, ca_type_id: value })}
            >
              <SelectTrigger id="ca_type_id"><SelectValue placeholder="Select a CA Type" /></SelectTrigger>
              <SelectContent>
                {caTypes.map((caType) => (
                  <SelectItem key={caType.id} value={caType.id}>{caType.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSBAType && (
            <div className="p-3 bg-muted/50 rounded-lg">
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
