import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the user's JWT to verify they're authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's token - to verify the caller is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the caller is authenticated
    const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the caller is an admin by looking at their profile
    const { data: callerProfile, error: profileError } = await userClient
      .from("profiles")
      .select("user_type")
      .eq("user_id", callerUser.id)
      .single();

    if (profileError || !callerProfile || callerProfile.user_type !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only admins can delete teachers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { teacher_id } = body;

    if (!teacher_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: teacher_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the caller's organization_id
    const { data: callerOrgProfile, error: callerOrgError } = await userClient
      .from("user_organization_profiles")
      .select("organization_id")
      .eq("user_id", callerUser.id)
      .eq("is_active", true)
      .maybeSingle();

    if (callerOrgError || !callerOrgProfile) {
      return new Response(
        JSON.stringify({ error: "Caller not associated with any organization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerOrgId = callerOrgProfile.organization_id;

    // Get the teacher record to find the user_id, and verify they belong to the same organization
    const { data: teacher, error: teacherFetchError } = await adminClient
      .from("teachers")
      .select("id, full_name, email, user_id, organization_id")
      .eq("id", teacher_id)
      .eq("organization_id", callerOrgId)
      .single();

    if (teacherFetchError) {
      console.error("Error fetching teacher:", teacherFetchError);
      return new Response(
        JSON.stringify({ error: "Teacher not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const teacherUserId = teacher.user_id;
    const teacherName = teacher.full_name;

    // Delete teacher assignments first (foreign key constraint)
    const { error: assignmentsError } = await adminClient
      .from("teacher_assignments")
      .delete()
      .eq("teacher_id", teacher_id);

    if (assignmentsError) {
      console.error("Error deleting teacher assignments:", assignmentsError);
      // Continue anyway - there might not be any assignments
    }

    // Delete the teacher record
    const { error: teacherDeleteError } = await adminClient
      .from("teachers")
      .delete()
      .eq("id", teacher_id);

    if (teacherDeleteError) {
      console.error("Error deleting teacher record:", teacherDeleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete teacher record: ${teacherDeleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete the profile record if exists
    if (teacherUserId) {
      const { error: profileDeleteError } = await adminClient
        .from("profiles")
        .delete()
        .eq("user_id", teacherUserId);

      if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        // Continue anyway - profile might not exist
      }

      // Delete the auth user
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(teacherUserId);

      if (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
        // Don't fail the whole operation - the teacher record is already deleted
        // The orphaned auth user can be cleaned up later
        return new Response(
          JSON.stringify({
            success: true,
            partial: true,
            message: `Teacher record deleted but auth user cleanup failed: ${authDeleteError.message}`,
            teacher_name: teacherName,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Successfully deleted teacher: ${teacherName} (${teacher.email})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teacher and auth user deleted successfully",
        teacher_name: teacherName,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in delete-teacher function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
