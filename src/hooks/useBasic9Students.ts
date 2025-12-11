import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Basic9Student = {
  id: string;
  full_name: string;
  class_id: string | null;
};

// Fetch active students in classes named like Basic 9/JHS 3 variants
export const useBasic9Students = () => {
  return useQuery({
    queryKey: ["basic9-students"],
    queryFn: async (): Promise<Basic9Student[]> => {
      // 1) Find Basic 9 classes
      const { data: classes, error: classErr } = await supabase
        .from("classes")
        .select("id, name")
        .or("name.ilike.%basic 9%,name.ilike.%jhs 3%,name.ilike.%jhs3%,name.ilike.%b9% ");
      if (classErr) throw classErr;
      const classIds = (classes || []).map((c: any) => c.id);

      if (!classIds.length) return [];

      // 2) Students in those classes who haven't left
      const { data: students, error: stErr } = await supabase
        .from("students")
        .select("id, full_name, class_id, has_left")
        .in("class_id", classIds)
        .eq("has_left", false)
        .order("full_name", { ascending: true });
      if (stErr) throw stErr;

      return (students || []).map((s: any) => ({ id: s.id, full_name: s.full_name, class_id: s.class_id }));
    },
  });
};
