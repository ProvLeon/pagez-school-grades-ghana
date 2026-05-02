-- ============================================
-- MIGRATION: Create process_student_bulk_upload RPC function
-- ============================================
-- This function processes bulk student uploads and creates/updates student records
-- with proper organization_id handling for multi-tenant support

CREATE OR REPLACE FUNCTION public.process_student_bulk_upload(
  operation_id UUID,
  file_data JSONB
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  students JSONB;
  student_record JSONB;
  student_idx INT;
  organization_id UUID;
  class_id UUID;
  department_id UUID;
  processed INT := 0;
  failed INT := 0;
  errors JSONB := '[]'::jsonb;
  sheet_op RECORD;
BEGIN
  -- Get the sheet operation record to find organization context
  SELECT so.* INTO sheet_op
  FROM public.sheet_operations so
  WHERE so.id = operation_id;

  IF sheet_op IS NULL THEN
    RAISE EXCEPTION 'Sheet operation % not found', operation_id;
  END IF;

  -- Get the creator's organization
  SELECT uop.organization_id INTO organization_id
  FROM public.user_organization_profiles uop
  WHERE uop.user_id = sheet_op.created_by
  AND uop.is_active = true
  LIMIT 1;

  IF organization_id IS NULL THEN
    UPDATE public.sheet_operations
    SET status = 'failed',
        failed_records = array_length(file_data -> 'students', 1),
        error_log = jsonb_build_array(jsonb_build_object('error', 'Creator not associated with any organization')),
        updated_at = NOW()
    WHERE id = operation_id;
    RETURN jsonb_build_object('processed', 0, 'failed', array_length(file_data -> 'students', 1), 'errors', errors);
  END IF;

  -- Extract students array
  students := file_data -> 'students';

  -- Process each student record
  FOR student_idx IN 0 .. (array_length(jsonb_path_query_array(students, '$[*]'), 1) - 1)
  LOOP
    student_record := students -> student_idx;

    BEGIN
      -- Check if class exists in the organization
      IF student_record ->> 'class_id' IS NOT NULL AND student_record ->> 'class_id' != '' THEN
        SELECT c.id INTO class_id
        FROM public.classes c
        WHERE c.id::text = student_record ->> 'class_id'
        AND c.organization_id = organization_id;
      ELSE
        class_id := NULL;
      END IF;

      -- Check if department exists in the organization
      IF student_record ->> 'department_id' IS NOT NULL AND student_record ->> 'department_id' != '' THEN
        SELECT d.id INTO department_id
        FROM public.departments d
        WHERE d.id::text = student_record ->> 'department_id'
        AND d.organization_id = organization_id;
      ELSE
        department_id := NULL;
      END IF;

      -- Insert or update the student record with organization_id
      INSERT INTO public.students (
        student_id,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        class_id,
        department_id,
        academic_year,
        guardian_name,
        guardian_phone,
        guardian_email,
        address,
        organization_id,
        created_at,
        updated_at
      ) VALUES (
        student_record ->> 'student_id',
        student_record ->> 'full_name',
        student_record ->> 'email',
        student_record ->> 'phone',
        CASE WHEN student_record ->> 'date_of_birth' IS NOT NULL THEN (student_record ->> 'date_of_birth')::DATE ELSE NULL END,
        student_record ->> 'gender',
        class_id,
        department_id,
        COALESCE(student_record ->> 'academic_year', '2024/2025'),
        student_record ->> 'guardian_name',
        student_record ->> 'guardian_phone',
        student_record ->> 'guardian_email',
        student_record ->> 'address',
        organization_id,
        NOW(),
        NOW()
      )
      ON CONFLICT (student_id, organization_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        class_id = EXCLUDED.class_id,
        department_id = EXCLUDED.department_id,
        guardian_name = EXCLUDED.guardian_name,
        guardian_phone = EXCLUDED.guardian_phone,
        guardian_email = EXCLUDED.guardian_email,
        address = EXCLUDED.address,
        updated_at = NOW();

      processed := processed + 1;

    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
      errors := errors || jsonb_build_object(
        'row', student_idx + 1,
        'student_id', student_record ->> 'student_id',
        'error', SQLERRM
      );
    END;
  END LOOP;

  -- Update the sheet operation with results
  UPDATE public.sheet_operations
  SET status = CASE WHEN failed > 0 THEN 'completed_with_errors' ELSE 'completed' END,
      processed_records = processed,
      failed_records = failed,
      error_log = errors,
      updated_at = NOW()
  WHERE id = operation_id;

  RETURN jsonb_build_object(
    'processed', processed,
    'failed', failed,
    'errors', errors
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_student_bulk_upload(UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION public.process_student_bulk_upload(UUID, JSONB) IS
  'Processes bulk student uploads from sheet operations. Inserts or updates students with organization_id for multi-tenant support.';
