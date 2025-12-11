import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { calculateMockRawScore, calculateMockAggregate } from "@/utils/mockGradeCalculations";

export type SubjectScoreInput = Record<string, number | undefined>;

const SUBJECT_ALIASES: Record<string, string[]> = {
  english: ["english", "english language"],
  mathematics: ["mathematics", "maths"],
  science: ["science"],
  social: ["social", "social studies"],
  career_technology: ["career technology", "career tech", "career"],
  rme: ["rme", "religious and moral education", "rel. & moral edu.", "rel. & moral edu", "rel. & morla edu"],
  ict: ["ict", "computing", "information technology"],
  creative_arts: ["creative arts", "c.arts", "creative"],
  gh_language: ["ghanaian language", "gh", "ghanaian", "ghanaian lang"],
  french: ["french"],
  arabic: ["arabic"],
};

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

async function getSubjectsMap() {
  const { data, error } = await supabase.from("subjects").select("id,name,code");
  if (error) throw error;
  const map = new Map<string, string>(); // normalized name/code -> id
  (data || []).forEach((row: any) => {
    if (row.name) map.set(normalize(row.name), row.id);
    if (row.code) map.set(normalize(row.code), row.id);
  });
  return map;
}

async function ensureResult(sessionId: string, studentId: string) {
  // Try to find existing
  const { data: existing, error: selErr } = await supabase
    .from("mock_exam_results")
    .select("id")
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  // Need student's class_id for insertion
  const { data: student, error: stErr } = await supabase
    .from("students")
    .select("class_id")
    .eq("id", studentId)
    .single();
  if (stErr) throw stErr;

  const { data: inserted, error: insErr } = await supabase
    .from("mock_exam_results")
    .insert({ session_id: sessionId, student_id: studentId, class_id: student?.class_id ?? null, total_score: 0 })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return inserted.id as string;
}

async function batchUpsertSubjectMarks(resultId: string, subjectMarks: Array<{subjectId: string, score: number}>) {
  if (subjectMarks.length === 0) return;

  // Fetch existing marks for this result
  const { data: existing, error: selErr } = await supabase
    .from("mock_exam_subject_marks")
    .select("id, subject_id")
    .eq("mock_result_id", resultId);
  if (selErr) throw selErr;

  const existingMap = new Map((existing || []).map(m => [m.subject_id, m.id]));
  const toUpdate: any[] = [];
  const toInsert: any[] = [];

  for (const { subjectId, score } of subjectMarks) {
    const payload = {
      mock_result_id: resultId,
      subject_id: subjectId,
      exam_score: score,
      total_score: score,
    };

    if (existingMap.has(subjectId)) {
      toUpdate.push({ ...payload, id: existingMap.get(subjectId) });
    } else {
      toInsert.push(payload);
    }
  }

  // Batch operations
  if (toUpdate.length > 0) {
    const { error } = await supabase
      .from("mock_exam_subject_marks")
      .upsert(toUpdate);
    if (error) throw error;
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("mock_exam_subject_marks")
      .insert(toInsert);
    if (error) throw error;
  }
}

export const useSaveMockScores = (sessionId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, scores }: { studentId: string; scores: SubjectScoreInput }) => {
      if (!sessionId) throw new Error("No session selected");

      // Ensure a result row exists
      const resultId = await ensureResult(sessionId, studentId);

      // Load subjects once
      const subjectsMap = await getSubjectsMap();

      // Calculate scores using the new formulas
      const rawScore = calculateMockRawScore(scores);
      const aggregate = calculateMockAggregate(scores);
      
      // Prepare batch operations
      const subjectMarks: Array<{subjectId: string, score: number}> = [];
      
      for (const key of Object.keys(scores)) {
        const raw = scores[key];
        if (raw === undefined || raw === null || Number.isNaN(Number(raw))) continue;
        const val = Math.max(0, Math.min(100, Number(raw)));
        if (val < 0) continue;

        // Resolve subject id via aliases
        const aliases = SUBJECT_ALIASES[key] || [key];
        let subjectId: string | undefined;
        for (const a of aliases) {
          const found = subjectsMap.get(normalize(a));
          if (found) {
            subjectId = found;
            break;
          }
        }
        // Fallback: try normalized key
        if (!subjectId) subjectId = subjectsMap.get(normalize(key));

        if (!subjectId) continue; // skip if subject not found

        subjectMarks.push({ subjectId, score: val });
      }

      // Batch upsert all subject marks
      await batchUpsertSubjectMarks(resultId, subjectMarks);

      // Update raw score and aggregate on the result row
      const { error: upErr } = await supabase
        .from("mock_exam_results")
        .update({ 
          total_score: rawScore,
          position: aggregate // Store aggregate in position field temporarily
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
      toast({ title: "Failed to save scores", description: err?.message || "Please try again.", });
    },
  });
};
