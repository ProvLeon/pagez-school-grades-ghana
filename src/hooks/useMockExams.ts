import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getUserOrganizationId } from "@/utils/organizationHelper";

export type MockExamSession = {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  exam_date: string | null;
  status: string; // draft | open | closed
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export const useMockExamSessions = () => {
  return useQuery({
    queryKey: ["mock-exam-sessions"],
    queryFn: async () => {
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        console.warn('User not associated with any organization');
        return [];
      }

      const { data, error } = await supabase
        .from("mock_exam_sessions")
        .select("*")
        .eq('organization_id', organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as MockExamSession[];
    },
  });
};

export const useMockExamStats = () => {
  return useQuery({
    queryKey: ["mock-exam-sessions", "stats"],
    queryFn: async () => {
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        return { sessions: 0, results: 0, published: 0, pending: 0 };
      }

      const [allSessions, publishedSessions, allResults] = await Promise.all([
        supabase.from("mock_exam_sessions").select("id", { count: "exact" }).eq('organization_id', organizationId),
        supabase
          .from("mock_exam_sessions")
          .select("id", { count: "exact" })
          .eq('organization_id', organizationId)
          .eq("is_published", true),
        supabase.from("mock_exam_results").select("id", { count: "exact" }).eq('organization_id', organizationId),
      ]);

      const sessions = allSessions.count || 0;
      const published = publishedSessions.count || 0;
      const pending = Math.max(sessions - published, 0);
      const results = allResults.count || 0;

      return { sessions, results, published, pending };
    },
  });
};

export const useCreateMockExamSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      academic_year: string;
      term: string;
      exam_date?: string | null;
      is_published?: boolean;
      status?: string;
    }) => {
      const organizationId = await getUserOrganizationId();
      if (!organizationId) {
        throw new Error('User is not associated with any organization');
      }

      const { data, error } = await supabase
        .from("mock_exam_sessions")
        .insert([
          {
            name: payload.name,
            academic_year: payload.academic_year,
            term: payload.term,
            exam_date: payload.exam_date ?? null,
            is_published: payload.is_published ?? false,
            organization_id: organizationId,
            status: payload.status ?? "draft",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as MockExamSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions", "stats"] });
      toast({ title: "Session created", description: "Mock exam session created successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create session", description: err.message, variant: "destructive" });
    },
  });
};

export const useTogglePublishSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { data, error } = await supabase
        .from("mock_exam_sessions")
        .update({ is_published: !is_published })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as MockExamSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions", "stats"] });
      const state = data.is_published ? "published" : "unpublished";
      toast({ title: `Session ${state}`, description: `Session is now ${state}.` });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });
};

export const useDeleteMockExamSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mock_exam_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mock-exam-sessions", "stats"] });
      toast({ title: "Deleted", description: "Session deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });
};
