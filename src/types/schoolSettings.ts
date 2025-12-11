
export interface SchoolSettings {
  id: string;
  school_name: string;
  location: string | null;
  address_1: string | null;
  address_2: string | null;
  phone: string | null;
  motto: string | null;
  whatsapp_contact: string | null;
  site_description: string | null;
  primary_color: string;
  logo_url: string | null;
  headteacher_name: string | null;
  headteacher_signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  session_name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicTerm {
  id: string;
  session_id: string;
  term_name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}
