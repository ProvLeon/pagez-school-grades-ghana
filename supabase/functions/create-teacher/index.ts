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
        JSON.stringify({ error: "Unauthorized: Only admins can create teachers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { full_name, email, password, phone, department_id, username } = body;

    if (!full_name || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: full_name and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine the email to use
    const teacherEmail = email || `${username || full_name.toLowerCase().replace(/\s+/g, '.')}@school.local`;

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if a teacher with this email already exists
    const { data: existingTeacher } = await adminClient
      .from("teachers")
      .select("id, email")
      .eq("email", teacherEmail)
      .maybeSingle();

    if (existingTeacher) {
      return new Response(
        JSON.stringify({ error: `A teacher with email ${teacherEmail} already exists` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the auth user with email_confirm: true to skip email verification
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: teacherEmail,
      password: password,
      user_metadata: {
        full_name: full_name,
        user_type: "teacher",
      },
      email_confirm: true, // Auto-confirm email so teacher can log in immediately
    });

    if (authError) {
      console.error("Auth user creation error:", authError);

      // Check if user already exists in auth
      if (authError.message?.includes("already been registered") || authError.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({ error: `An account with email ${teacherEmail} already exists in authentication system` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Auth user created but no user ID returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile record
    const { error: profileInsertError } = await adminClient
      .from("profiles")
      .insert({
        user_id: userId,
        user_type: "teacher",
      });

    if (profileInsertError) {
      console.error("Profile creation error:", profileInsertError);
      // Don't fail - profile might be created by a trigger
    }

    // Get the caller's organization_id from user_organization_profiles
    const { data: userOrgProfile, error: orgError } = await userClient
      .from("user_organization_profiles")
      .select("organization_id")
      .eq("user_id", callerUser.id)
      .eq("is_active", true)
      .maybeSingle();

    if (orgError || !userOrgProfile) {
      return new Response(
        JSON.stringify({ error: "Caller not associated with any organization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const organizationId = userOrgProfile.organization_id;

    // Create teacher record
    const teacherInsertData: Record<string, unknown> = {
      full_name: full_name,
      email: teacherEmail,
      phone: phone || null,
      department_id: department_id || null,
      user_id: userId,
      organization_id: organizationId,
    };

    const { data: teacherRecord, error: teacherError } = await adminClient
      .from("teachers")
      .insert(teacherInsertData)
      .select()
      .single();

    if (teacherError) {
      console.error("Teacher record creation error:", teacherError);

      // Try to clean up the auth user we created
      try {
        await adminClient.auth.admin.deleteUser(userId);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user after teacher creation failure:", cleanupError);
      }

      return new Response(
        JSON.stringify({ error: `Failed to create teacher record: ${teacherError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Link teacher to the organization so getUserOrganizationId() works on login
    const { error: orgProfileError } = await adminClient
      .from("user_organization_profiles")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role: "teacher",
        is_active: true,
      });

    if (orgProfileError) {
      // Non-fatal: log the issue but don't roll back an otherwise successful creation
      console.error("Failed to create user_organization_profile for teacher:", orgProfileError.message);
    }

    console.log(`Successfully created teacher: ${full_name} (${teacherEmail})`);

    return new Response(
      JSON.stringify({
        success: true,
        teacher: teacherRecord,
        message: "Teacher created successfully with login credentials"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in create-teacher function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
