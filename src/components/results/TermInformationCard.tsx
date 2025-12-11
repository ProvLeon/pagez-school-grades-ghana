import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAddResultsForm } from "@/contexts/AddResultsFormContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TermInformationCardProps {
  formData: any;
  setFormData: (data: any) => void;
  conductOptions?: Array<{ id: string; value: string }>;
  attitudeOptions?: Array<{ id: string; value: string }>;
  interestOptions?: Array<{ id: string; value: string }>;
  teacherCommentOptions?: Array<{ id: string; value: string }>;
}

const TermInformationCard = ({
  formData,
  setFormData,
  conductOptions = [],
  attitudeOptions = [],
  interestOptions = [],
  teacherCommentOptions = [],
}: TermInformationCardProps) => {
  const { subjectMarks, selectedStudent, selectedClass } = useAddResultsForm();
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateHeadRemark = async () => {
    if (!selectedStudent) {
      toast({
        title: "No Student Selected",
        description: "Please select a student first before generating remarks.",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);

    try {
      // Prepare subject data for AI
      const subjectsData = Object.entries(subjectMarks)
        .filter(([_, mark]: [string, any]) => mark && (mark.total_score !== undefined || mark.exam_score !== undefined))
        .map(([subjectId, mark]: [string, any]) => ({
          subject_id: subjectId,
          name: mark.subject_name || subjectId,
          total_score: mark.total_score ?? (
            (mark.ca1_score || 0) + (mark.ca2_score || 0) + (mark.ca3_score || 0) + (mark.ca4_score || 0) + (mark.exam_score || 0)
          ),
          grade: mark.grade || calculateGrade(mark.total_score),
        }));

      // Calculate grade distribution
      const gradeCounts: Record<string, number> = {};
      subjectsData.forEach((s) => {
        if (s.grade) {
          gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
        }
      });

      // Calculate average score
      const validScores = subjectsData.filter((s) => typeof s.total_score === "number");
      const averageScore = validScores.length > 0
        ? validScores.reduce((sum, s) => sum + s.total_score, 0) / validScores.length
        : 0;

      // Prepare request body
      const requestBody = {
        student_name: selectedStudent?.full_name || "Student",
        class_name: selectedClass?.name || formData.class_id,
        attendance: formData.attendance || null,
        affective: {
          conduct: formData.conduct,
          attitude: formData.attitude,
          interest: formData.interest,
        },
        teacher_comment: formData.teachers_comment,
        subjects: subjectsData,
        average_score: Math.round(averageScore * 10) / 10,
        grade_counts: gradeCounts,
      };

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("generate-head-remark", {
        body: requestBody,
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to generate remark");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.remark) {
        setFormData({ ...formData, heads_remarks: data.remark });
        toast({
          title: "Remark Generated",
          description: "AI has generated a head teacher's remark based on the student's performance.",
        });
      } else {
        throw new Error("No remark was generated");
      }
    } catch (error: any) {
      console.error("Error generating head remark:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI remark. Please try again or enter manually.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Simple grade calculation helper (fallback)
  const calculateGrade = (score?: number): string => {
    if (score === undefined || score === null) return "";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    if (score >= 40) return "E";
    return "F";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Term Information & Remarks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="conduct">Conduct</Label>
            <Select
              value={formData.conduct || ""}
              onValueChange={(value) => setFormData({ ...formData, conduct: value })}
            >
              <SelectTrigger id="conduct">
                <SelectValue placeholder="Select conduct" />
              </SelectTrigger>
              <SelectContent>
                {conductOptions.length > 0 ? (
                  conductOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attitude">Attitude</Label>
            <Select
              value={formData.attitude || ""}
              onValueChange={(value) => setFormData({ ...formData, attitude: value })}
            >
              <SelectTrigger id="attitude">
                <SelectValue placeholder="Select attitude" />
              </SelectTrigger>
              <SelectContent>
                {attitudeOptions.length > 0 ? (
                  attitudeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="interest">Interest</Label>
            <Select
              value={formData.interest || ""}
              onValueChange={(value) => setFormData({ ...formData, interest: value })}
            >
              <SelectTrigger id="interest">
                <SelectValue placeholder="Select interest" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.length > 0 ? (
                  interestOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="teachers_comment">Teacher's Comment</Label>
          <Select
            value={formData.teachers_comment || ""}
            onValueChange={(value) => setFormData({ ...formData, teachers_comment: value })}
          >
            <SelectTrigger id="teachers_comment">
              <SelectValue placeholder="Select teacher's comment" />
            </SelectTrigger>
            <SelectContent>
              {teacherCommentOptions.length > 0 ? (
                teacherCommentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="An excellent performance. Keep it up!">
                    An excellent performance. Keep it up!
                  </SelectItem>
                  <SelectItem value="Good performance. Can do better with more effort.">
                    Good performance. Can do better with more effort.
                  </SelectItem>
                  <SelectItem value="Satisfactory performance. Needs to work harder.">
                    Satisfactory performance. Needs to work harder.
                  </SelectItem>
                  <SelectItem value="Fair performance. Must improve in all subjects.">
                    Fair performance. Must improve in all subjects.
                  </SelectItem>
                  <SelectItem value="Needs significant improvement. Requires extra attention.">
                    Needs significant improvement. Requires extra attention.
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="heads_remarks">Head's Remarks</Label>
          <Textarea
            id="heads_remarks"
            placeholder="Enter head teacher's remarks or generate with AI"
            value={formData.heads_remarks || ""}
            onChange={(e) => setFormData({ ...formData, heads_remarks: e.target.value })}
            rows={3}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateHeadRemark}
              disabled={aiLoading || !selectedStudent}
            >
              {aiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {aiLoading ? "Generating..." : "Generate with AI"}
            </Button>
            {!selectedStudent && (
              <span className="text-xs text-muted-foreground">Select a student first</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermInformationCard;
