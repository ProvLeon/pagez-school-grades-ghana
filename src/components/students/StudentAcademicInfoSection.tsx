
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useStudentForm } from "./StudentFormProvider";

export const StudentAcademicInfoSection = () => {
  const { formData, setFormData, generateStudentId } = useStudentForm();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select 
              value={formData.department_id} 
              onValueChange={(value) => setFormData({...formData, department_id: value, class_id: ""})}
              required
            >
              <SelectTrigger id="department"><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="class">Class *</Label>
            <Select 
              value={formData.class_id} 
              onValueChange={(value) => setFormData({...formData, class_id: value})}
              required
            >
              <SelectTrigger id="class"><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {classes
                  .filter(cls => !formData.department_id || cls.department_id === formData.department_id)
                  .map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert>
          <AlertTitle>Academic Year</AlertTitle>
          <AlertDescription>{formData.academic_year}</AlertDescription>
        </Alert>

        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoGenerate" className="font-medium">Auto Generate Student ID</Label>
                <p className="text-xs text-muted-foreground">Let the system create a unique ID.</p>
              </div>
              <Switch 
                id="autoGenerate" 
                checked={formData.auto_generate_id}
                onCheckedChange={(checked) => setFormData({...formData, auto_generate_id: checked})}
              />
            </div>
            
            {!formData.auto_generate_id && (
              <div>
                <Label htmlFor="manualStudentId">Student ID *</Label>
                <Input 
                  id="manualStudentId"
                  placeholder="Enter Student ID manually" 
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
