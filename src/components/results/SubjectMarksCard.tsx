
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GradingScale } from "@/hooks/useGradingSettings";
import { calculateTotalScore, getGradeFromScale } from "@/utils/gradeCalculations";
import { useMemo } from "react";

interface Subject {
  id: string;
  name: string;
  department_id?: string;
}

interface SubjectMark {
  ca1_score?: number;
  ca2_score?: number;
  ca3_score?: number;
  ca4_score?: number;
  ca_score?: number;
  exam_score?: number;
  total_score?: number;
  grade?: string;
  [key: string]: number | string | undefined;
}

interface CAType {
  id: string;
  name: string;
  configuration: Record<string, number>;
  description?: string;
}

interface SubjectMarksCardProps {
  subjects: Subject[];
  subjectMarks: Record<string, SubjectMark>;
  setSubjectMarks: (marks: Record<string, SubjectMark>) => void;
  selectedCAType: CAType | null;
  gradingScales?: GradingScale[];
}

const SubjectMarksCard = ({
  subjects,
  subjectMarks,
  setSubjectMarks,
  selectedCAType,
  gradingScales = []
}: SubjectMarksCardProps) => {

  // Get max values for CA and Exam based on SBA type
  const getMaxValues = useMemo(() => {
    if (!selectedCAType?.name) return { ca: 100, exam: 100 };

    const typeName = selectedCAType.name.toLowerCase();

    // SBA 50/50: CA <=50, Exam <=100 (converted to 50%)
    if (typeName.includes('50/50')) {
      return { ca: 50, exam: 100 };
    }
    // SBA 30/70: CA <=30, Exam <=100 (converted to 70%)
    if (typeName.includes('30/70')) {
      return { ca: 30, exam: 100 };
    }
    // SBA 40/60: CA <=40, Exam <=100 (converted to 60%)
    if (typeName.includes('40/60')) {
      return { ca: 40, exam: 100 };
    }

    return { ca: 100, exam: 100 };
  }, [selectedCAType?.name]);

  const updateSubjectMark = (subjectId: string, field: string, value: string) => {
    const parsed = value === "" ? undefined : Number(value);
    let numValue = parsed === undefined || Number.isNaN(parsed) ? undefined : Math.max(0, parsed);

    // Apply max validation based on field type
    if (numValue !== undefined) {
      if (field === 'ca1_score' || field === 'ca_score') {
        numValue = Math.min(numValue, getMaxValues.ca);
      } else if (field === 'exam_score') {
        numValue = Math.min(numValue, getMaxValues.exam);
      }
    }

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
                {inputFields.map((field) => {
                  const isCAField = field.key === 'ca1_score' || field.key === 'ca_score';
                  const isExamField = field.key === 'exam_score';
                  const maxValue = isCAField ? getMaxValues.ca : isExamField ? getMaxValues.exam : 100;

                  return (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={`${subject.id}_${field.key}`} className="text-xs">
                        {field.label}
                        <span className="text-muted-foreground ml-1">(max: {maxValue})</span>
                      </Label>
                      <Input
                        id={`${subject.id}_${field.key}`}
                        type="number"
                        min={0}
                        max={maxValue}
                        placeholder="0"
                        value={marks[field.key] ?? ""}
                        onChange={(e) => updateSubjectMark(subject.id, field.key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SubjectMarksCard;
