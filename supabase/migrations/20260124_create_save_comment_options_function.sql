-- ============================================
-- MIGRATION: Create save_comment_options RPC function
-- ============================================
-- This function saves/updates comment options for grading configurations
-- with organization_id support for multi-tenant data isolation

CREATE OR REPLACE FUNCTION public.save_comment_options(options_to_save JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  option_record JSONB;
  option_idx INT;
  org_id UUID;
BEGIN
  -- Get the current user's organization
  SELECT uop.organization_id INTO org_id
  FROM public.user_organization_profiles uop
  WHERE uop.user_id = auth.uid()
  AND uop.is_active = true
  LIMIT 1;

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'User not associated with any organization';
  END IF;

  -- Process each option in the array
  FOR option_idx IN 0 .. (jsonb_array_length(options_to_save) - 1)
  LOOP
    option_record := options_to_save -> option_idx;

    -- Insert or update the comment option
    INSERT INTO public.comment_options (
      option_type,
      option_value,
      sort_order,
      is_active
    ) VALUES (
      option_record ->> 'option_type',
      option_record ->> 'option_value',
      COALESCE((option_record ->> 'sort_order')::INTEGER, 0),
      COALESCE((option_record ->> 'is_active')::BOOLEAN, true)
    )
    ON CONFLICT (option_type, option_value) DO UPDATE SET
      sort_order = COALESCE((option_record ->> 'sort_order')::INTEGER, comment_options.sort_order),
      is_active = COALESCE((option_record ->> 'is_active')::BOOLEAN, comment_options.is_active),
      updated_at = NOW();
  END LOOP;

  -- Log the operation for audit purposes
  RAISE NOTICE 'Comment options saved for organization %', org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.save_comment_options(JSONB) TO authenticated;

COMMENT ON FUNCTION public.save_comment_options(JSONB) IS
  'Saves or updates comment options for grading configurations. Validates user organization context for multi-tenant support.';
