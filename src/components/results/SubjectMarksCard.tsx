
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GradingScale } from "@/hooks/useGradingSettings";
import { calculateTotalScore, getGradeFromScale } from "@/utils/gradeCalculations";

interface SubjectMarksCardProps {
  subjects: any[];
  subjectMarks: Record<string, any>;
  setSubjectMarks: (marks: Record<string, any>) => void;
  selectedCAType: any;
  gradingScales?: GradingScale[];
}

const SubjectMarksCard = ({
  subjects,
  subjectMarks,
  setSubjectMarks,
  selectedCAType,
  gradingScales = []
}: SubjectMarksCardProps) => {

  const updateSubjectMark = (subjectId: string, field: string, value: string) => {
    const parsed = value === "" ? undefined : Number(value);
    const numValue = parsed === undefined || Number.isNaN(parsed) ? undefined : Math.max(0, parsed);

    const updatedSubjectData = { ...subjectMarks[subjectId], [field]: numValue };
    const totalScore = calculateTotalScore(updatedSubjectData, selectedCAType);
    const grade = getGradeFromScale(totalScore, gradingScales);

    setSubjectMarks({
      ...subjectMarks,
      [subjectId]: { ...updatedSubjectData, total_score: totalScore, grade: grade },
    });
  };

  const getInputFields = () => {
    if (!selectedCAType) return [];
    const config = selectedCAType.configuration;
    const fields = [];
    if (config.ca1) fields.push({ key: 'ca1_score', label: 'CA1' });
    if (config.ca2) fields.push({ key: 'ca2_score', label: 'CA2' });
    if (config.ca3) fields.push({ key: 'ca3_score', label: 'CA3' });
    if (config.ca4) fields.push({ key: 'ca4_score', label: 'CA4' });
    if (config.ca) fields.push({ key: 'ca1_score', label: 'CA' });
    if (config.exam) fields.push({ key: 'exam_score', label: 'Exam' });
    return fields;
  };

  const inputFields = getInputFields();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Marks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map((subject) => {
          const marks = subjectMarks[subject.id] || {};
          return (
            <div key={subject.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{subject.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">Total: {marks.total_score || 0}%</Badge>
                  <Badge>Grade: {marks.grade || 'N/A'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inputFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`${subject.id}_${field.key}`} className="text-xs">{field.label}</Label>
                    <Input
                      id={`${subject.id}_${field.key}`}
                      type="number"
                      min={0}
                      placeholder="0"
                      value={marks[field.key] ?? ""}
                      onChange={(e) => updateSubjectMark(subject.id, field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SubjectMarksCard;
