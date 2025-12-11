import { supabase } from '@/integrations/supabase/client';
import { SchoolSettings, AcademicSession, AcademicTerm } from '@/types/schoolSettings';

export const schoolSettingsService = {
  async fetchSettings(): Promise<SchoolSettings | null> {
    const { data, error } = await (supabase as any)
      .from('school_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateSettings(updates: Partial<SchoolSettings>): Promise<SchoolSettings> {
    console.log('=== schoolSettingsService.updateSettings ===');
    console.log('Updates received:', updates);
    console.log('logo_url in updates:', updates.logo_url);

    // First, try to get existing settings
    const existingSettings = await this.fetchSettings();
    console.log('Existing settings:', existingSettings);

    if (existingSettings) {
      // Update existing record
      const updatePayload = { ...updates, updated_at: new Date().toISOString() };
      console.log('Update payload:', updatePayload);
      console.log('Updating record with id:', existingSettings.id);

      const { data, error } = await (supabase as any)
        .from('school_settings')
        .update(updatePayload)
        .eq('id', existingSettings.id)
        .select()
        .single();

      console.log('Update response - data:', data);
      console.log('Update response - error:', error);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      return data;
    } else {
      // Create new record
      const { data, error } = await (supabase as any)
        .from('school_settings')
        .insert({
          school_name: updates.school_name || 'My School',
          location: updates.location || null,
          address_1: updates.address_1 || null,
          phone: updates.phone || null,
          motto: updates.motto || null,
          headteacher_name: updates.headteacher_name || null,
          primary_color: updates.primary_color || '#e11d48',
          logo_url: updates.logo_url || null,
          headteacher_signature_url: updates.headteacher_signature_url || null,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async fetchSessions(): Promise<AcademicSession[]> {
    const { data, error } = await (supabase as any)
      .from('academic_sessions')
      .select('*')
      .order('session_name', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async fetchTerms(): Promise<AcademicTerm[]> {
    const { data, error } = await (supabase as any)
      .from('academic_terms')
      .select('*')
      .order('term_name');

    if (error) throw error;
    return data || [];
  },

  async createSession(sessionName: string): Promise<AcademicSession> {
    const { data, error } = await (supabase as any)
      .from('academic_sessions')
      .insert({
        session_name: sessionName,
        is_current: false
      })
      .select()
      .single();

    if (error) throw error;

    // Create default terms for the new session
    const terms = ['First Term', 'Second Term', 'Third Term'];
    await Promise.all(
      terms.map(termName =>
        (supabase as any)
          .from('academic_terms')
          .insert({
            session_id: data.id,
            term_name: termName,
            is_current: false
          })
      )
    );

    return data;
  },

  async switchSession(sessionId: string): Promise<void> {
    // Set all sessions to not current
    await (supabase as any)
      .from('academic_sessions')
      .update({ is_current: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Set selected session as current
    await (supabase as any)
      .from('academic_sessions')
      .update({ is_current: true })
      .eq('id', sessionId);

    // Update terms - set all to not current first
    await (supabase as any)
      .from('academic_terms')
      .update({ is_current: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Set first term of new session as current
    const { data: firstTerm } = await (supabase as any)
      .from('academic_terms')
      .select('*')
      .eq('session_id', sessionId)
      .eq('term_name', 'First Term')
      .single();

    if (firstTerm) {
      await (supabase as any)
        .from('academic_terms')
        .update({ is_current: true })
        .eq('id', firstTerm.id);
    }
  },

  async switchTerm(sessionId: string, termName: string): Promise<void> {
    // Set all terms to not current
    await (supabase as any)
      .from('academic_terms')
      .update({ is_current: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Set selected term as current
    await (supabase as any)
      .from('academic_terms')
      .update({ is_current: true })
      .eq('session_id', sessionId)
      .eq('term_name', termName);
  }
};
