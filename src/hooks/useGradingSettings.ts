
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface GradingSettings {
  id: string;
  academic_year: string;
  term: 'first' | 'second' | 'third';
  attendance_for_term?: number;
  term_begin?: string;
  term_ends?: string;
  next_term_begin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradingScale {
  id: string;
  department: string;
  academic_year: string;
  term: 'first' | 'second' | 'third';
  from_percentage: number;
  to_percentage: number;
  grade: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentConfig {
  id: string;
  department: string;
  academic_year: string;
  term: 'first' | 'second' | 'third';
  sba_type_name: string;
  configuration: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface CommentOption {
  id: string;
  option_type: 'conduct' | 'attitude' | 'interest' | 'teacher';
  option_value: string;
  sort_order: number;
  is_active: boolean;
}

// Helper function to normalize department names to exact database constraint values
const normalizeDepartmentName = (dept: string): string => {
  const deptLower = dept.toLowerCase().trim();

  // Exact mapping to database constraint values based on common inputs
  switch (deptLower) {
    case 'kg':
    case 'kindergarten':
      return 'KG';
    case 'primary':
    case 'primary school':
    case 'p':
    case 'pri':
      return 'PRIMARY';
    case 'jhs':
    case 'junior high school':
    case 'junior high':
    case 'j.h.s':
      return 'JUNIOR HIGH';
    case 'shs':
    case 'senior high school':
    case 'senior high':
    case 's.h.s':
      return 'SENIOR HIGH';
    default: {
      // If exact match not found, try uppercase
      const upperDept = dept.toUpperCase().trim();
      if (['KG', 'PRIMARY', 'JUNIOR HIGH', 'SENIOR HIGH'].includes(upperDept)) {
        return upperDept;
      }
      // Legacy support: convert JHS to JUNIOR HIGH, SHS to SENIOR HIGH
      if (upperDept === 'JHS') return 'JUNIOR HIGH';
      if (upperDept === 'SHS') return 'SENIOR HIGH';
      console.warn(`Unknown department: ${dept}, defaulting to uppercase`);
      return upperDept;
    }
  }
};

// Helper function to normalize term values (e.g., "First Term" -> "first")
const normalizeTerm = (term: string): string => {
  const termLower = term.toLowerCase().trim();

  // Handle "First Term", "Second Term", "Third Term" format
  if (termLower.includes('first')) return 'first';
  if (termLower.includes('second')) return 'second';
  if (termLower.includes('third')) return 'third';

  // Handle "1st", "2nd", "3rd" format
  if (termLower.includes('1st') || termLower === '1') return 'first';
  if (termLower.includes('2nd') || termLower === '2') return 'second';
  if (termLower.includes('3rd') || termLower === '3') return 'third';

  // If already in correct format, return as-is
  if (['first', 'second', 'third'].includes(termLower)) {
    return termLower;
  }

  return termLower;
};

// Helper function to normalize department for grading_scales table
// The grading_scales table uses 'JHS' not 'JUNIOR HIGH'
const normalizeDepartmentForGradingScales = (dept: string): string => {
  const deptUpper = dept.toUpperCase().trim();

  switch (deptUpper) {
    case 'KG':
    case 'KINDERGARTEN':
      return 'KG';
    case 'PRIMARY':
    case 'PRI':
    case 'P':
      return 'PRIMARY';
    case 'JHS':
    case 'JUNIOR HIGH':
    case 'JUNIOR HIGH SCHOOL':
    case 'J.H.S':
      return 'JHS';
    case 'SHS':
    case 'SENIOR HIGH':
    case 'SENIOR HIGH SCHOOL':
    case 'S.H.S':
      return 'SHS';
    default:
      return deptUpper;
  }
};

export const useGradingSettings = () => {
  return useQuery({
    queryKey: ['grading-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grading_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as GradingSettings | null;
    },
    staleTime: Infinity,
  });
};

export const useGradingScales = (department?: string, academicYear?: string, term?: string) => {
  return useQuery({
    queryKey: ['grading-scales', department, academicYear, term],
    queryFn: async () => {
      let query = supabase.from('grading_scales').select('*');

      if (department) {
        const normalizedDept = normalizeDepartmentName(department);
        query = query.eq('department', normalizedDept);
      }
      if (academicYear) query = query.eq('academic_year', academicYear);
      if (term) query = query.eq('term', term);

      const { data, error } = await query.order('from_percentage', { ascending: false });

      if (error) throw error;
      return data as GradingScale[];
    },
    enabled: !!department && !!academicYear && !!term,
    staleTime: Infinity,
  });
};

export const useAssessmentConfig = (department?: string, academicYear?: string, term?: string) => {
  return useQuery({
    queryKey: ['assessment-config', department, academicYear, term],
    queryFn: async () => {
      console.log('Fetching assessment config for:', { department, academicYear, term });

      const { data, error } = await supabase
        .from('assessment_configurations')
        .select('*')
        .eq('department', department)
        .eq('academic_year', academicYear)
        .eq('term', term)
        .single();

      console.log('Assessment config query result:', { data, error });

      if (error && error.code !== 'PGRST116') throw error;
      return data as AssessmentConfig | null;
    },
    enabled: !!department && !!academicYear && !!term,
  });
};

export const useCommentOptions = () => {
  return useQuery({
    queryKey: ['comment-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_options')
        .select('*')
        .eq('is_active', true)
        .order('option_type', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CommentOption[];
    },
  });
};

// Save grading settings - Fixed to handle unique constraint properly
export const useSaveGradingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<GradingSettings>) => {
      console.log('Attempting to save grading settings:', settings);

      // Validate required fields
      if (!settings.academic_year || !settings.term) {
        throw new Error('Academic year and term are required');
      }

      // Normalize term to lowercase (convert "First Term" -> "first", etc.)
      const normalizedTerm = normalizeTerm(settings.term);
      console.log(`Normalized term from "${settings.term}" to "${normalizedTerm}"`);

      // Check if settings already exist for this academic year and term
      const { data: existingSettings } = await supabase
        .from('grading_settings')
        .select('id')
        .eq('academic_year', settings.academic_year)
        .eq('term', normalizedTerm)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('grading_settings')
          .update({
            ...settings,
            term: normalizedTerm,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating grading settings:', error);
          throw error;
        }

        // Deactivate all other settings
        await supabase
          .from('grading_settings')
          .update({ is_active: false })
          .neq('id', existingSettings.id);

        console.log('Grading settings updated successfully:', data);
        return data;
      } else {
        // First deactivate any existing active settings
        await supabase
          .from('grading_settings')
          .update({ is_active: false })
          .eq('is_active', true);

        // Insert new settings
        const { data, error } = await supabase
          .from('grading_settings')
          .insert([{ ...settings, term: normalizedTerm, is_active: true }])
          .select()
          .single();

        if (error) {
          console.error('Error inserting grading settings:', error);
          throw error;
        }

        console.log('Grading settings created successfully:', data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-settings'] });
      // Also invalidate assessment configs since they depend on grading settings
      queryClient.invalidateQueries({ queryKey: ['assessment-config'] });
      console.log('Grading settings cache invalidated');
    },
    onError: (error) => {
      console.error('Error saving grading settings:', error);
    },
  });
};

// Save grading scales - Enhanced with strict department validation
export const useSaveGradingScales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ department_id, department, academicYear, term, scales }: {
      department_id?: string;
      department: string;
      academicYear: string;
      term: string;
      scales: Array<{
        from_percentage: number;
        to_percentage: number;
        grade: string;
        remark: string;
      }>;
    }) => {
      console.log('Attempting to save grading scales:', { department_id, department, academicYear, term, scalesCount: scales.length });

      // Validate inputs
      if (!department || !academicYear || !term) {
        throw new Error('Department, academic year, and term are required');
      }

      if (!Array.isArray(scales) || scales.length === 0) {
        console.log('No scales to save for', department);
        return [];
      }

      // Normalize department name - use the department name directly (uppercase)
      // This allows dynamic departments from the database
      const normalizedDept = department.toUpperCase().trim();
      console.log(`Using department name: "${normalizedDept}"${department_id ? ` (id: ${department_id})` : ''}`);

      // Normalize term to lowercase (convert "First Term" -> "first", etc.)
      const normalizedTerm = normalizeTerm(term);
      console.log(`Normalized term from "${term}" to "${normalizedTerm}"`);

      // Validate term matches database constraints
      const validTerms = ['first', 'second', 'third'];
      if (!validTerms.includes(normalizedTerm)) {
        throw new Error(`Invalid term: ${normalizedTerm}. Must be one of: ${validTerms.join(', ')}`);
      }

      // Validate each scale
      for (const scale of scales) {
        if (typeof scale.from_percentage !== 'number' || typeof scale.to_percentage !== 'number') {
          throw new Error('Percentage values must be numbers');
        }
        if (scale.from_percentage < 0 || scale.to_percentage < 0) {
          throw new Error('Percentage values cannot be negative');
        }
        if (scale.from_percentage > scale.to_percentage) {
          throw new Error('From percentage cannot be greater than to percentage');
        }
        if (!scale.grade?.trim() || !scale.remark?.trim()) {
          throw new Error('Grade and remark are required for all scales');
        }
      }

      // Delete existing scales for this department/year/term
      // Delete by BOTH department_id AND department name to prevent duplicates
      // This ensures we clean up old records that may only have one identifier

      // First, delete by department_id if available
      if (department_id) {
        const { error: deleteByIdError } = await supabase
          .from('grading_scales')
          .delete()
          .eq('academic_year', academicYear)
          .eq('term', normalizedTerm)
          .eq('department_id', department_id);

        if (deleteByIdError) {
          console.error('Error deleting scales by department_id:', deleteByIdError);
          throw new Error(`Failed to delete existing scales by id: ${deleteByIdError.message}`);
        }
      }

      // Also delete by department name to catch any old records without department_id
      const { error: deleteByNameError } = await supabase
        .from('grading_scales')
        .delete()
        .eq('academic_year', academicYear)
        .eq('term', normalizedTerm)
        .eq('department', normalizedDept);

      if (deleteByNameError) {
        console.error('Error deleting scales by department name:', deleteByNameError);
        throw new Error(`Failed to delete existing scales by name: ${deleteByNameError.message}`);
      }

      // Insert new scales with department_id if available
      const scalesToInsert = scales.map(scale => ({
        ...scale,
        department: normalizedDept,
        department_id: department_id || null,
        academic_year: academicYear,
        term: normalizedTerm
      }));

      console.log('Inserting scales with normalized department:', scalesToInsert);

      const { data, error } = await supabase
        .from('grading_scales')
        .insert(scalesToInsert)
        .select();

      if (error) {
        console.error('Error inserting grading scales:', error);
        throw new Error(`Failed to save grading scales: ${error.message}`);
      }

      console.log('Grading scales saved successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales'] });
      console.log(`Grading scales cache invalidated for ${variables.department}`);
    },
    onError: (error) => {
      console.error('Failed to save grading scales:', error);
    },
  });
};

// Save assessment configuration - Enhanced with better validation and error handling
export const useSaveAssessmentConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ department, academicYear, term, sbaType }: {
      department: string;
      academicYear: string;
      term: string;
      sbaType: string;
    }) => {
      console.log('Attempting to save assessment config:', { department, academicYear, term, sbaType });

      // Validate inputs
      if (!department || !academicYear || !term || !sbaType) {
        throw new Error('All fields are required for assessment configuration');
      }

      // Normalize department name using the same function as grading scales
      const normalizedDept = normalizeDepartmentForGradingScales(department);
      console.log(`Normalized department from "${department}" to "${normalizedDept}"`);

      // Ensure normalized department is one of the allowed values
      const allowedDepartments = ['KG', 'PRIMARY', 'JHS'];
      if (!allowedDepartments.includes(normalizedDept)) {
        throw new Error(`Invalid department: ${normalizedDept}. Must be one of: ${allowedDepartments.join(', ')}`);
      }

      // Normalize term to lowercase (convert "First Term" -> "first", etc.)
      const normalizedTerm = normalizeTerm(term);
      console.log(`Normalized term from "${term}" to "${normalizedTerm}"`);

      // Validate term matches database constraints
      const validTerms = ['first', 'second', 'third'];
      if (!validTerms.includes(normalizedTerm)) {
        throw new Error(`Invalid term: ${normalizedTerm}. Must be one of: ${validTerms.join(', ')}`);
      }

      // Parse SBA type configuration
      const configuration = parseSBATypeConfiguration(sbaType);
      if (!configuration || Object.keys(configuration).length === 0) {
        throw new Error(`Invalid SBA type: ${sbaType}`);
      }

      // Delete existing config for this department/year/term
      const { error: deleteError } = await supabase
        .from('assessment_configurations')
        .delete()
        .eq('department', normalizedDept)
        .eq('academic_year', academicYear)
        .eq('term', normalizedTerm);

      if (deleteError) {
        console.error('Error deleting existing assessment config:', deleteError);
      }

      // Insert new config
      const configData = {
        department: normalizedDept,
        academic_year: academicYear,
        term: normalizedTerm,
        sba_type_name: sbaType,
        configuration
      };

      console.log('Inserting assessment config:', configData);

      const { data, error } = await supabase
        .from('assessment_configurations')
        .insert([configData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting assessment config:', error);
        throw new Error(`Failed to save assessment configuration: ${error.message}`);
      }

      console.log('Assessment config saved successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Assessment config saved successfully, invalidating queries');
      // Invalidate all assessment config queries
      queryClient.invalidateQueries({ queryKey: ['assessment-config'] });
      // Also invalidate the specific query for this department/year/term
      queryClient.invalidateQueries({
        queryKey: ['assessment-config', variables.department.toUpperCase(), variables.academicYear, variables.term]
      });
    },
    onError: (error) => {
      console.error('Failed to save assessment config:', error);
    },
  });
};

// Save comment options - Switched to RPC for atomic operation
export const useSaveCommentOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      options: Array<{
        option_type: "conduct" | "attitude" | "interest" | "teacher";
        option_value: string;
        sort_order: number;
      }>
    ) => {
      console.log("Saving comment options via RPC:", options);

      const { error } = await supabase.rpc("save_comment_options", {
        options_to_save: options,
      });

      if (error) {
        console.error("Error saving comment options via RPC:", error);
        throw new Error(`Failed to save comment options: ${error.message}`);
      }

      console.log("Comment options saved successfully via RPC.");
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-options"] });
    },
    onError: (error) => {
      console.error("Failed to save comment options:", error);
      toast({
        title: "Error",
        description: `Failed to save comment options: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Helper function to parse SBA type configuration
function parseSBATypeConfiguration(sbaType: string) {
  const configs: Record<string, Record<string, number>> = {
    "50/50": { ca: 50, exam: 50 },
    "60/10/10/10/10": { ca1: 10, ca2: 10, ca3: 10, ca4: 10, exam: 60 },
    "60/20/20": { ca1: 20, ca2: 20, exam: 60 },
    "60/40": { ca: 40, exam: 60 },
    "70/10/10/10": { ca1: 10, ca2: 10, ca3: 10, exam: 70 },
    "70/30": { ca: 30, exam: 70 }
  };

  return configs[sbaType] || {};
}
