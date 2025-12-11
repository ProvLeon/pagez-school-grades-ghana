import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentData {
  student_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  class_id?: string;
  department_id?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  academic_year?: string;
}

interface ProcessUploadRequest {
  operation_id: string;
  students: StudentData[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { operation_id, students }: ProcessUploadRequest = await req.json();

    if (!operation_id || !students || !Array.isArray(students)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing upload for operation ${operation_id} with ${students.length} students`);

    // Validate file data
    const validationErrors: string[] = [];
    const validatedStudents: StudentData[] = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowErrors: string[] = [];

      // Validate required fields
      if (!student.student_id?.trim()) {
        rowErrors.push('Student ID is required');
      }
      if (!student.full_name?.trim()) {
        rowErrors.push('Full name is required');
      }

      // Validate email format if provided
      if (student.email && !student.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        rowErrors.push('Invalid email format');
      }

      // Validate phone format if provided
      if (student.phone && student.phone.trim() && !student.phone.match(/^\+233\d{9}$/)) {
        rowErrors.push('Phone must be in format +233XXXXXXXXX');
      }

      // Validate date format if provided
      if (student.date_of_birth && student.date_of_birth.trim()) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(student.date_of_birth)) {
          rowErrors.push('Date of birth must be in YYYY-MM-DD format');
        } else {
          const date = new Date(student.date_of_birth);
          if (isNaN(date.getTime())) {
            rowErrors.push('Invalid date of birth');
          }
        }
      }

      // Validate gender if provided
      if (student.gender && !['Male', 'Female'].includes(student.gender)) {
        rowErrors.push('Gender must be Male or Female');
      }

      if (rowErrors.length > 0) {
        validationErrors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
      } else {
        validatedStudents.push({
          ...student,
          academic_year: student.academic_year || '2024/2025'
        });
      }
    }

    // If there are validation errors, update operation and return
    if (validationErrors.length > 0) {
      await supabaseClient
        .from('sheet_operations')
        .update({
          status: 'failed',
          failed_records: validationErrors.length,
          error_log: validationErrors.map((error, index) => ({
            row: index + 1,
            error
          })),
          updated_at: new Date().toISOString()
        })
        .eq('id', operation_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          errors: validationErrors
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update operation status to processing
    await supabaseClient
      .from('sheet_operations')
      .update({
        status: 'processing',
        total_records: validatedStudents.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', operation_id);

    // Process students using the database function
    const { data: result, error: processError } = await supabaseClient.rpc(
      'process_student_bulk_upload',
      {
        operation_id,
        file_data: { students: validatedStudents }
      }
    );

    if (processError) {
      console.error('Error processing bulk upload:', processError);
      
      // Update operation status to failed
      await supabaseClient
        .from('sheet_operations')
        .update({
          status: 'failed',
          error_log: [{ error: processError.message }],
          updated_at: new Date().toISOString()
        })
        .eq('id', operation_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process student data'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Upload processing completed: ${result.processed} processed, ${result.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: result.processed,
        failed: result.failed,
        errors: result.errors || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-student-upload function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});