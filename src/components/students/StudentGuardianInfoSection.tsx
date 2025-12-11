
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentForm } from "./StudentFormProvider";

export const StudentGuardianInfoSection = () => {
  const { formData, setFormData } = useStudentForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardian & Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input 
              id="guardianName"
              placeholder="Enter guardian's name" 
              value={formData.guardian_name}
              onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="guardianPhone">Guardian Phone</Label>
            <Input 
              id="guardianPhone"
              placeholder="Enter guardian's phone" 
              value={formData.guardian_phone}
              onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              placeholder="Enter student's address" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
