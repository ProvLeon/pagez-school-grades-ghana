
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface AcademicSettingsCardProps {
  academicYear: string;
  setAcademicYear: (value: string) => void;
  term: string;
  setTerm: (value: string) => void;
  attendanceForTerm: string;
  setAttendanceForTerm: (value: string) => void;
  termBegin: string;
  setTermBegin: (value: string) => void;
  termEnds: string;
  setTermEnds: (value: string) => void;
  nextTermBegin: string;
  setNextTermBegin: (value: string) => void;
}

const AcademicSettingsCard = ({
  academicYear,
  setAcademicYear,
  term,
  setTerm,
  attendanceForTerm,
  setAttendanceForTerm,
  termBegin,
  setTermBegin,
  termEnds,
  setTermEnds,
  nextTermBegin,
  setNextTermBegin
}: AcademicSettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="w-5 h-5 text-primary" />
          Academic Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="academic-year" className="mb-2 block text-sm font-medium text-muted-foreground">Academic Year</Label>
            <Input
              id="academic-year"
              value={academicYear || ''}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2024/2025"
            />
          </div>
          <div>
            <Label htmlFor="term" className="mb-2 block text-sm font-medium text-muted-foreground">Term</Label>
            <Select value={term || ''} onValueChange={setTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">Term 1</SelectItem>
                <SelectItem value="second">Term 2</SelectItem>
                <SelectItem value="third">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attendance" className="mb-2 block text-sm font-medium text-muted-foreground">Attendance for Term</Label>
            <Input
              id="attendance"
              type="number"
              value={attendanceForTerm || ''}
              onChange={(e) => setAttendanceForTerm(e.target.value)}
              placeholder="Number of days"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="term-begin" className="mb-2 block text-sm font-medium text-muted-foreground">Term Begin</Label>
            <Input
              id="term-begin"
              type="date"
              value={termBegin || ''}
              onChange={(e) => setTermBegin(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="term-ends" className="mb-2 block text-sm font-medium text-muted-foreground">Term Ends</Label>
            <Input
              id="term-ends"
              type="date"
              value={termEnds || ''}
              onChange={(e) => setTermEnds(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="next-term-begin" className="mb-2 block text-sm font-medium text-muted-foreground">Next Term Begin</Label>
            <Input
              id="next-term-begin"
              type="date"
              value={nextTermBegin || ''}
              onChange={(e) => setNextTermBegin(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicSettingsCard;
