
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentForm } from "./StudentFormProvider";

export const StudentBasicInfoSection = () => {
  const { formData, setFormData } = useStudentForm();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName"
          placeholder="Enter student's full name" 
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value: "male" | "female") => setFormData({...formData, gender: value})}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
};
