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
      console.error("CRITICAL: OPENROUTER_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "Missing OPENROUTER_API_KEY. Please set it in Supabase Edge Function secrets.",
          code: "missing_api_key",
          details: "The API key must be configured in your Supabase project settings."
        }),
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

    console.log("Request received for student:", student_name);
    console.log("Models to try:", modelsToTry);

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
    const modelAttempts: Array<{ model: string; status: number; error: string }> = [];

    // Try each model in sequence until one succeeds
    for (const model of modelsToTry) {
      try {
        console.log(`[Attempt] Calling OpenRouter with model: ${model}`);

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
          const errorMessage = data?.error?.message || JSON.stringify(data?.error) || "Unknown error";
          console.error(`[Error] Model ${model} failed with status ${response.status}:`, errorMessage);

          modelAttempts.push({
            model,
            status: response.status,
            error: errorMessage
          });

          lastError = data?.error || { message: "OpenRouter request failed" };

          // If it's a model-specific error, try the next model
          const errorCode = lastError?.code || lastError?.type || "";
          if (
            response.status === 429 || // Rate limit
            response.status >= 500 || // Server error
            errorCode === "model_not_available" ||
            errorCode === "context_length_exceeded"
          ) {
            console.log(`[Retry] Trying next model due to: ${errorCode || `HTTP ${response.status}`}`);
            continue; // Try next model
          }

          // For auth errors or other critical errors, don't retry
          if (response.status === 401 || response.status === 403) {
            console.error("[Auth Error] Invalid OpenRouter API credentials");
            return new Response(
              JSON.stringify({
                error: "Invalid or missing OpenRouter API key",
                code: "auth_error",
                status: 401,
                details: "The OPENROUTER_API_KEY is invalid or has expired. Please check your Supabase secrets."
              }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.log(`[Retry] Trying next model due to HTTP ${response.status}`);
          continue; // Try next model
        }

        remark = data?.choices?.[0]?.message?.content?.trim() || "";

        if (remark) {
          console.log(`[Success] Generated remark with model: ${model}`);
          break; // Success, exit the loop
        } else {
          console.warn(`[Warning] Model ${model} returned empty response`);
          modelAttempts.push({
            model,
            status: 200,
            error: "Empty response from model"
          });
        }
      } catch (modelError: any) {
        console.error(`[Error] Exception with model ${model}:`, modelError?.message || modelError);
        modelAttempts.push({
          model,
          status: 0,
          error: modelError?.message || "Network or parsing error"
        });
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

    // All models failed - return detailed error information
    const errorMessage = lastError?.message || "All AI models failed to generate a remark";
    console.error("[Critical] All models exhausted. Attempts:", modelAttempts);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: lastError?.code || "all_models_failed",
        status: 503,
        details: "All configured AI models are currently unavailable. Please try again later.",
        modelAttempts: modelAttempts,
        debugInfo: {
          totalModelsAttempted: modelsToTry.length,
          failedAttempts: modelAttempts.length,
          apiKeyConfigured: !!openRouterApiKey
        }
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[Error] Unexpected error in generate-head-remark function:", error?.message || error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Unexpected error",
        code: "internal_error",
        details: "An unexpected error occurred while processing your request."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
