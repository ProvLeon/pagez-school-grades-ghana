import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
const primaryModel = Deno.env.get("OPENROUTER_MODEL") || "meta-llama/llama-3.2-3b-instruct:free";
const fallbackModelsEnv = Deno.env.get("OPENROUTER_FALLBACK_MODELS") || "google/gemma-3n-e4b-it:free,mistralai/mistral-7b-instruct:free,qwen/qwen-2-7b-instruct:free";
const fallbackModels = fallbackModelsEnv.split(",").map((m) => m.trim()).filter(Boolean);

// Combine primary model with fallbacks for sequential attempts
const modelsToTry = [primaryModel, ...fallbackModels];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENROUTER_API_KEY. Please set it in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const {
      student_name,
      class_name,
      attendance,
      affective,
      teacher_comment,
      subjects = [],
      average_score,
      grade_counts = {},
    } = body || {};

    // Build a concise, informative summary for the model
    const subjectsSummary = Array.isArray(subjects)
      ? subjects
        .filter((s: any) => typeof s?.total_score === "number")
        .sort((a: any, b: any) => (b.total_score ?? 0) - (a.total_score ?? 0))
        .map((s: any) => `${s.name || s.subject_name}: ${s.total_score} (${s.grade})`)
        .join("; ")
      : "";

    const gradeDist = Object.keys(grade_counts)
      .sort()
      .map((g) => `${g}:${grade_counts[g]}`)
      .join(", ");

    const systemPrompt = `You are an experienced head teacher. Given a student's academic performance, attendance, and affective traits, write a concise professional Head Teacher's Remark.
- 1 to 2 sentences, maximum 45 words.
- Be supportive, specific (without citing raw numbers), and forward-looking.
- Reference strengths and areas for improvement naturally.
- Maintain a warm but formal tone.
- Do not start with the student's name and do not include quotation marks.
- Avoid repeating the teacher's comment verbatim.`;

    const userContext = {
      student_name,
      class_name,
      attendance,
      affective,
      teacher_comment,
      average_score,
      grade_counts,
      subjects_brief: subjectsSummary,
      grade_distribution: gradeDist,
    };

    const userMessage =
      "Using the JSON context below, produce only the remark text (no quotes, no preface):\n\n" +
      JSON.stringify(userContext, null, 2);

    let lastError: any = null;
    let remark: string | null = null;

    // Try each model in sequence until one succeeds
    for (const model of modelsToTry) {
      try {
        console.log(`Attempting with model: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": Deno.env.get("SITE_URL") || "https://school-grades.app",
            "X-Title": "School Grades Ghana",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 180,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`OpenRouter API error with model ${model}:`, data);
          lastError = data?.error || { message: "OpenRouter request failed" };

          // If it's a model-specific error, try the next model
          const errorCode = lastError?.code || lastError?.type || "";
          if (
            response.status === 429 || // Rate limit
            response.status >= 500 || // Server error
            errorCode === "model_not_available" ||
            errorCode === "context_length_exceeded"
          ) {
            continue; // Try next model
          }

          // For auth errors or other critical errors, don't retry
          if (response.status === 401 || response.status === 403) {
            return new Response(
              JSON.stringify({ error: "Invalid or missing OpenRouter API key", code: "auth_error", status: 401 }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          continue; // Try next model for other errors
        }

        remark = data?.choices?.[0]?.message?.content?.trim() || "";

        if (remark) {
          console.log(`Successfully generated remark with model: ${model}`);
          break; // Success, exit the loop
        }
      } catch (modelError: any) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = modelError;
        continue; // Try next model
      }
    }

    // If we got a remark, return it
    if (remark) {
      return new Response(JSON.stringify({ remark }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All models failed
    const errorMessage = lastError?.message || "All AI models failed to generate a remark";
    console.error("All models failed:", lastError);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: lastError?.code || "all_models_failed",
        status: 503
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-head-remark function:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
