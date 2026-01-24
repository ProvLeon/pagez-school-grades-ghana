import { supabase } from '@/lib/supabase';

/**
 * Get the current authenticated user's organization ID
 * This is used in all queries to ensure data isolation
 * 
 * @returns Promise<string | null> - Organization ID or null if user not authenticated
 */
export async function getUserOrganizationId(): Promise<string | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    // Get user's organization profile
    const { data, error } = await supabase
      .from('user_organization_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    if (!data) {
      console.warn('User not associated with any organization');
      return null;
    }

    return data.organization_id;
  } catch (error) {
    console.error('Unexpected error in getUserOrganizationId:', error);
    return null;
  }
}

/**
 * Get the current authenticated user's organization details
 * 
 * @returns Promise with organization data or null
 */
export async function getUserOrganization() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_organization_profiles')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          admin_id,
          school_name,
          location,
          phone,
          email
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    if (!data) {
      console.warn('User not associated with any organization');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getUserOrganization:', error);
    return null;
  }
}

/**
 * Check if current user is admin of their organization
 * 
 * @returns Promise<boolean> - True if user is admin
 */
export async function isUserOrgAdmin(): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_organization_profiles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('Unexpected error in isUserOrgAdmin:', error);
    return false;
  }
}

/**
 * Create a new organization for a user (called during signup)
 * 
 * @param userId - The user ID of the admin
 * @param organizationName - Name of the organization
 * @param schoolName - Name of the school
 * @returns Promise with organization data
 */
export async function createUserOrganization(
  userId: string,
  organizationName: string,
  schoolName?: string
) {
  try {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        admin_id: userId,
        name: organizationName,
        school_name: schoolName || organizationName
      })
      .select()
      .single();

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    // Create user organization profile with admin role
    const { data: profile, error: profileError } = await supabase
      .from('user_organization_profiles')
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: 'admin',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    return { organization: org, profile };
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Add a user to an organization (admin only)
 * 
 * @param organizationId - Organization ID
 * @param userId - User ID to add
 * @param role - User role (admin, teacher, staff, parent)
 * @returns Promise with profile data
 */
export async function addUserToOrganization(
  organizationId: string,
  userId: string,
  role: 'admin' | 'teacher' | 'staff' | 'parent' = 'teacher'
) {
  try {
    const { data, error } = await supabase
      .from('user_organization_profiles')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add user to organization: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error adding user to organization:', error);
    throw error;
  }
}

/**
 * Create an organization for a user if they don't have one
 * Used to automatically onboard existing admins into the multi-tenant system
 * 
 * @param organizationName - Name for the new organization
 * @returns Promise<string> - Organization ID
 */
export async function createOrganizationForUser(organizationName: string = 'My School'): Promise<string> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has an organization
    const { data: existingOrg } = await supabase
      .from('user_organization_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingOrg) {
      console.log('User already has an organization');
      return existingOrg.organization_id;
    }

    // Create a new organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        description: `Organization for ${organizationName}`,
        is_active: true
      })
      .select('id')
      .single();

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    // Create user organization profile
    const { error: profileError } = await supabase
      .from('user_organization_profiles')
      .insert({
        user_id: user.id,
        organization_id: newOrg.id,
        role: 'admin',
        is_active: true
      });

    if (profileError) {
      throw new Error(`Failed to link user to organization: ${profileError.message}`);
    }

    console.log(`Created organization ${newOrg.id} for user ${user.id}`);
    return newOrg.id;
  } catch (error) {
    console.error('Error creating organization for user:', error);
    throw error;
  }
}
