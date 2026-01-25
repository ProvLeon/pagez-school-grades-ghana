-- ============================================
-- MIGRATION: Create Platform Events Table
-- ============================================
-- Events managed by superadmins via external admin platform
-- Regular users can only read events

-- Create events table
CREATE TABLE IF NOT EXISTS public.platform_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  color VARCHAR(20) DEFAULT 'bg-blue-500',
  event_type VARCHAR(50) DEFAULT 'general', -- general, exam, meeting, holiday, announcement
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher number = higher priority for sorting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_events_date ON public.platform_events(event_date);
CREATE INDEX IF NOT EXISTS idx_platform_events_active ON public.platform_events(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_events_type ON public.platform_events(event_type);

-- Enable RLS
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read active events
CREATE POLICY "Anyone can view active events" ON public.platform_events
  FOR SELECT USING (is_active = true);

-- Only service_role (superadmins via API) can insert/update/delete
-- Regular users have NO write access - managed externally

-- Insert some initial sample events (these can be updated/deleted by superadmins)
INSERT INTO public.platform_events (title, description, event_date, color, event_type, priority) VALUES
  ('Term Examinations Begin', 'End of term examinations for all classes', CURRENT_DATE + INTERVAL '14 days', 'bg-red-500', 'exam', 10),
  ('Parent-Teacher Meeting', 'Mid-term progress review with parents', CURRENT_DATE + INTERVAL '21 days', 'bg-blue-500', 'meeting', 5),
  ('Report Cards Distribution', 'Collection of term report cards', CURRENT_DATE + INTERVAL '35 days', 'bg-green-500', 'announcement', 8)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_platform_events_updated_at ON public.platform_events;
CREATE TRIGGER update_platform_events_updated_at
  BEFORE UPDATE ON public.platform_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
