import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type MockExamResult = {
  id: string;
  session_id: string;
  student_id: string;
  class_id: string | null;
  total_score: number | null;
  position: number | null;
};

export type SubjectScore = {
  subject_id: string;
  subject_name: string;
  exam_score: number | null;
  total_score: number | null;
};

export type EnrichedMockExamResult = MockExamResult & {
  student_name: string;
  subject_scores: SubjectScore[];
};

export const useMockExamResults = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["mock-exam-results", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data: results, error } = await supabase
        .from("mock_exam_results")
        .select("id, session_id, student_id, class_id, total_score, position")
        .eq("session_id", sessionId!);
      if (error) throw error;

      const resultIds = (results || []).map((r) => r.id).filter(Boolean);
      const studentIds = (results || []).map((r) => r.student_id).filter(Boolean);
      
      // Fetch student names
      let nameMap = new Map<string, string>();
      if (studentIds.length) {
        const { data: students, error: stErr } = await supabase
          .from("students")
          .select("id, full_name")
          .in("id", studentIds);
        if (stErr) throw stErr;
        students?.forEach((s) => nameMap.set(s.id, s.full_name || "-"));
      }

      // Fetch subject scores
      let subjectScoresMap = new Map<string, SubjectScore[]>();
      if (resultIds.length) {
        const { data: subjectMarks, error: smErr } = await supabase
          .from("mock_exam_subject_marks")
          .select(`
            mock_result_id,
            subject_id,
            exam_score,
            total_score,
            subjects!inner(name)
          `)
          .in("mock_result_id", resultIds);
        if (smErr) throw smErr;

        // Group subject scores by result ID
        (subjectMarks || []).forEach((mark) => {
          const existing = subjectScoresMap.get(mark.mock_result_id) || [];
          existing.push({
            subject_id: mark.subject_id,
            subject_name: (mark.subjects as any)?.name || "Unknown",
            exam_score: mark.exam_score,
            total_score: mark.total_score,
          });
          subjectScoresMap.set(mark.mock_result_id, existing);
        });
      }

      const enriched: EnrichedMockExamResult[] = (results || []).map((r) => ({
        ...r,
        student_name: nameMap.get(r.student_id) || "-",
        subject_scores: subjectScoresMap.get(r.id) || [],
      }));

      console.log('Mock exam results loaded:', {
        totalResults: enriched.length,
        sampleResult: enriched[0] ? {
          studentName: enriched[0].student_name,
          totalScore: enriched[0].total_score,
          aggregate: enriched[0].position, // position field contains aggregate
          subjectCount: enriched[0].subject_scores.length,
          subjects: enriched[0].subject_scores.map(s => ({ name: s.subject_name, score: s.total_score }))
        } : null
      });

      // Keep the original aggregate values in position field - DO NOT overwrite
      // Position for ranking will be calculated in the UI component
      return enriched;
    },
  });
};

export const useDeleteAllMockResults = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const { error } = await supabase.from("mock_exam_results").delete().eq("session_id", sessionId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["mock-exam-results", vars.sessionId] });
    },
  });
};
