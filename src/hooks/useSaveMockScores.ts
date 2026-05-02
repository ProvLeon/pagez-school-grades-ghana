import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { calculateMockTotalScore, calculateMockAggregate } from "@/utils/mockGradeCalculations";
import { getUserOrganizationId } from "@/utils/organizationHelper";

// Keys are subject names (from the DB), values are scores
export type SubjectScoreInput = Record<string, number | undefined>;

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
}

async function getSubjectsMap() {
  const organizationId = await getUserOrganizationId();
  if (!organizationId) throw new Error("No organization ID");
  const { data, error } = await supabase
    .from("subjects")
    .select("id,name,code")
    .eq("organization_id", organizationId);
  if (error) throw error;
  const map = new Map<string, string>(); // normalized name/code -> id
  (data || []).forEach((row: any) => {
    if (row.name) map.set(normalize(row.name), row.id);
    if (row.code) map.set(normalize(row.code), row.id);
  });
  return map;
}

async function ensureResult(sessionId: string, studentId: string, organizationId: string) {
  const { data: existing, error: selErr } = await supabase
    .from("mock_exam_results")
    .select("id")
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data: student, error: stErr } = await supabase
    .from("students")
    .select("class_id")
    .eq("id", studentId)
    .single();
  if (stErr) throw stErr;

  const { data: inserted, error: insErr } = await supabase
    .from("mock_exam_results")
    .insert({
      session_id: sessionId,
      student_id: studentId,
      class_id: student?.class_id ?? null,
      total_score: 0,
      organization_id: organizationId,
    })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return inserted.id as string;
}

async function batchUpsertSubjectMarks(
  resultId: string,
  subjectMarks: Array<{ subjectId: string; score: number }>,
  organizationId: string
) {
  if (subjectMarks.length === 0) return;

  const { data: existing, error: selErr } = await supabase
    .from("mock_exam_subject_marks")
    .select("id, subject_id")
    .eq("mock_result_id", resultId);
  if (selErr) throw selErr;

  const existingMap = new Map((existing || []).map((m: any) => [m.subject_id, m.id]));
  const toUpdate: any[] = [];
  const toInsert: any[] = [];

  for (const { subjectId, score } of subjectMarks) {
    const payload = {
      mock_result_id: resultId,
      subject_id: subjectId,
      exam_score: score,
      total_score: score,
      organization_id: organizationId,
    };

    if (existingMap.has(subjectId)) {
      toUpdate.push({ ...payload, id: existingMap.get(subjectId) });
    } else {
      toInsert.push(payload);
    }
  }

  if (toUpdate.length > 0) {
    const { error } = await supabase.from("mock_exam_subject_marks").upsert(toUpdate);
    if (error) throw error;
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from("mock_exam_subject_marks").insert(toInsert);
    if (error) throw error;
  }
}

export const useSaveMockScores = (sessionId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      scores,
    }: {
      studentId: string;
      scores: SubjectScoreInput;
    }) => {
      if (!sessionId) throw new Error("No session selected");

      const organizationId = await getUserOrganizationId();
      if (!organizationId) throw new Error("User not associated with any organization");

      const resultId = await ensureResult(sessionId, studentId, organizationId);

      // Load subjects from DB — keyed by normalized name/code
      const subjectsMap = await getSubjectsMap();

      // Scores are now keyed by subject NAME (from DB)
      const totalScore = calculateMockTotalScore(scores);
      const aggregate = calculateMockAggregate(scores);

      const subjectMarks: Array<{ subjectId: string; score: number }> = [];

      for (const subjectName of Object.keys(scores)) {
        const raw = scores[subjectName];
        if (raw === undefined || raw === null || Number.isNaN(Number(raw))) continue;
        const val = Math.max(0, Math.min(100, Number(raw)));

        // Look up subject ID from DB map, try original and normalized name
        const subjectId =
          subjectsMap.get(normalize(subjectName)) ||
          subjectsMap.get(subjectName.toLowerCase());

        if (!subjectId) {
          console.warn(`Subject "${subjectName}" not found in DB subjects, skipping.`);
          continue;
        }

        subjectMarks.push({ subjectId, score: val });
      }

      await batchUpsertSubjectMarks(resultId, subjectMarks, organizationId);

      const { error: upErr } = await supabase
        .from("mock_exam_results")
        .update({
          total_score: totalScore,
          position: aggregate,
        })
        .eq("id", resultId);
      if (upErr) throw upErr;
    },
    onSuccess: async (_data, _vars, _ctx) => {
      if (sessionId) {
        await qc.invalidateQueries({ queryKey: ["mock-exam-results", sessionId] });
      }
      toast({ title: "Scores saved" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to save scores",
        description: err?.message || "Please try again.",
      });
    },
  });
};
