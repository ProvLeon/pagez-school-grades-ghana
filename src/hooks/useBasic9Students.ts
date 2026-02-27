import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getUserOrganizationId } from "@/utils/organizationHelper";

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
      // Get user's organization for multi-tenant data isolation
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        console.warn('User not associated with any organization');
        return [];
      }

      // 1) Find Basic 9 classes scoped to this organization
      const { data: classes, error: classErr } = await supabase
        .from("classes")
        .select("id, name")
        .eq("organization_id", organizationId)
        .or("name.ilike.%basic 9%,name.ilike.%jhs 3%,name.ilike.%jhs3%,name.ilike.%b9% ");
      if (classErr) throw classErr;
      const classIds = (classes || []).map((c: any) => c.id);

      if (!classIds.length) return [];

      // 2) Students in those classes who haven't left (scoped to org)
      const { data: students, error: stErr } = await supabase
        .from("students")
        .select("id, full_name, class_id, has_left")
        .eq("organization_id", organizationId)
        .in("class_id", classIds)
        .eq("has_left", false)
        .order("full_name", { ascending: true });
      if (stErr) throw stErr;

      return (students || []).map((s: any) => ({ id: s.id, full_name: s.full_name, class_id: s.class_id }));
    },
  });
};
