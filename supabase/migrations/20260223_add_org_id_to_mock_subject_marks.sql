-- Add organization_id to mock_exam_subject_marks for proper multi-tenant isolation.
-- Currently, isolation is only through the parent mock_exam_results table,
-- but direct queries on this table would not be org-scoped without this column.

ALTER TABLE public.mock_exam_subject_marks
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill existing rows from the parent mock_exam_results table
UPDATE public.mock_exam_subject_marks AS msm
SET organization_id = mer.organization_id
FROM public.mock_exam_results AS mer
WHERE msm.mock_result_id = mer.id
  AND msm.organization_id IS NULL;

-- Create index for query performance
CREATE INDEX IF NOT EXISTS idx_mock_exam_subject_marks_organization_id
  ON public.mock_exam_subject_marks(organization_id);
