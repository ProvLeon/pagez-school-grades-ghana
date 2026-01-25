import { supabase } from '@/integrations/supabase/client';
import { SchoolSettings, AcademicSession, AcademicTerm } from '@/types/schoolSettings';

export const schoolSettingsService = {
  async fetchSettings(): Promise<SchoolSettings | null> {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    // Fetch school settings for the current user (admin_id = user.id)
    const { data, error } = await (supabase as any)
      .from('school_settings')
      .select('*')
      .eq('admin_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching school settings:', error);
      return null;
    }

    return data;
  },

  async updateSettings(updates: Partial<SchoolSettings>): Promise<SchoolSettings> {
    console.log('=== schoolSettingsService.updateSettings ===');
    console.log('Updates received:', updates);
    console.log('logo_url in updates:', updates.logo_url);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user has an organization
    const { data: userOrg } = await supabase
      .from('user_organization_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    let organizationId = userOrg?.organization_id;

    // If user doesn't have an organization, create one
    if (!organizationId) {
      const orgName = updates.school_name || 'My School';

      // Create a new organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          admin_id: user.id,
          name: orgName,
          school_name: orgName
        })
        .select('id')
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        throw new Error('Failed to create organization for school');
      }

      organizationId = newOrg.id;

      // Create user_organization_profile entry
      const { error: profileError } = await supabase
        .from('user_organization_profiles')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          role: 'admin',
          is_active: true
        });

      if (profileError) {
        console.error('Error creating user organization profile:', profileError);
        throw new Error('Failed to link user to organization');
      }

      console.log(`Created new organization ${organizationId} for user ${user.id}`);
    }

    // First, try to get existing settings for the current user
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
        .eq('admin_id', user.id) // Ensure user can only update their own school
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
      // Create new record with organization_id
      const { data, error } = await (supabase as any)
        .from('school_settings')
        .insert({
          admin_id: user.id, // Link to current admin user
          school_name: updates.school_name || 'My School',
          location: updates.location || null,
          address_1: updates.address_1 || null,
          phone: updates.phone || null,
          motto: updates.motto || null,
          headteacher_name: updates.headteacher_name || null,
          primary_color: updates.primary_color || '#e11d48',
          logo_url: updates.logo_url || null,
          headteacher_signature_url: updates.headteacher_signature_url || null
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
      .maybeSingle();

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
