
import { supabase as typedSupabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export const supabase = typedSupabase as SupabaseClient;
// Database types
export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  department_id: string;
  academic_year: string;
  student_count?: number;
  created_at: string;
  updated_at: string;
  department?: Department;
  teacher?: {
    id: string;
    full_name: string;
    email?: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  class_id?: string;
  department_id?: string;
  academic_year: string;
  photo_url?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  has_left: boolean;
  created_at: string;
  updated_at: string;
  class?: Class;
  department?: Department;
}

export interface Teacher {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  department_id?: string;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Result {
  id: string;
  student_id: string;
  class_id: string;
  term: 'first' | 'second' | 'third';
  academic_year: string;
  days_school_opened?: number;
  days_present?: number;
  days_absent?: number;
  term_begin?: string;
  term_ends?: string;
  next_term_begin?: string;
  teachers_comment?: string;
  teacher_id?: string;
  admin_approved: boolean;
  teacher_approved: boolean;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
  teacher?: Teacher;
  subject_results?: SubjectResult[];
}

export interface SubjectResult {
  id: string;
  result_id: string;
  subject_id: string;
  score?: number;
  grade?: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface SubjectCombination {
  id: string;
  name: string;
  department_id: string;
  subject_ids: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
}
