export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessment_configurations: {
        Row: {
          academic_year: string
          configuration: Json
          created_at: string | null
          department: string
          id: string
          sba_type_name: string
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          configuration: Json
          created_at?: string | null
          department: string
          id?: string
          sba_type_name: string
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          configuration?: Json
          created_at?: string | null
          department?: string
          id?: string
          sba_type_name?: string
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_configurations_academic_year_term_fkey"
            columns: ["academic_year", "term"]
            isOneToOne: false
            referencedRelation: "grading_settings"
            referencedColumns: ["academic_year", "term"]
          },
        ]
      }
      ca_types: {
        Row: {
          configuration: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string | null
          department_id: string | null
          id: string
          name: string
          organization_id: string | null
          student_count: number | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          name: string
          organization_id?: string | null
          student_count?: number | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          student_count?: number | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_options: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          option_type: string
          option_value: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          option_type: string
          option_value: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          option_type?: string
          option_value?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          academic_year: string
          created_at: string | null
          department: string
          from_percentage: number
          grade: string
          id: string
          remark: string
          term: string
          to_percentage: number
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          department: string
          from_percentage: number
          grade: string
          id?: string
          remark: string
          term: string
          to_percentage: number
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          department?: string
          from_percentage?: number
          grade?: string
          id?: string
          remark?: string
          term?: string
          to_percentage?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grading_scales_academic_year_term_fkey"
            columns: ["academic_year", "term"]
            isOneToOne: false
            referencedRelation: "grading_settings"
            referencedColumns: ["academic_year", "term"]
          },
        ]
      }
      grading_settings: {
        Row: {
          academic_year: string
          attendance_for_term: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          next_term_begin: string | null
          term: string
          term_begin: string | null
          term_ends: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          attendance_for_term?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          next_term_begin?: string | null
          term: string
          term_begin?: string | null
          term_ends?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          attendance_for_term?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          next_term_begin?: string | null
          term?: string
          term_begin?: string | null
          term_ends?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mock_exam_results: {
        Row: {
          class_id: string | null
          created_at: string | null
          id: string
          position: number | null
          session_id: string
          student_id: string
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          session_id: string
          student_id: string
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          session_id?: string
          student_id?: string
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_exam_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mock_exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_sessions: {
        Row: {
          academic_year: string
          created_at: string | null
          exam_date: string | null
          id: string
          is_published: boolean
          name: string
          organization_id: string | null
          status: string
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          exam_date?: string | null
          id?: string
          is_published?: boolean
          name: string
          organization_id?: string | null
          status?: string
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          exam_date?: string | null
          id?: string
          is_published?: boolean
          name?: string
          organization_id?: string | null
          status?: string
          term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mock_exam_subject_marks: {
        Row: {
          ca1_score: number | null
          ca2_score: number | null
          ca3_score: number | null
          ca4_score: number | null
          created_at: string | null
          exam_score: number | null
          grade: string | null
          id: string
          mock_result_id: string
          position: number | null
          subject_id: string
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          ca1_score?: number | null
          ca2_score?: number | null
          ca3_score?: number | null
          ca4_score?: number | null
          created_at?: string | null
          exam_score?: number | null
          grade?: string | null
          id?: string
          mock_result_id: string
          position?: number | null
          subject_id: string
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          ca1_score?: number | null
          ca2_score?: number | null
          ca3_score?: number | null
          ca4_score?: number | null
          created_at?: string | null
          exam_score?: number | null
          grade?: string | null
          id?: string
          mock_result_id?: string
          position?: number | null
          subject_id?: string
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_subject_marks_mock_result_id_fkey"
            columns: ["mock_result_id"]
            isOneToOne: false
            referencedRelation: "mock_exam_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_exam_subject_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          current_academic_year: string | null
          current_term: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          subdomain: string | null
          subscription_end_date: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_academic_year?: string | null
          current_term?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          subdomain?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_academic_year?: string | null
          current_term?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          subdomain?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_response: Json | null
          id: string
          organization_id: string
          payment_method: string | null
          payment_reference: string
          processed_at: string
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          id?: string
          organization_id: string
          payment_method?: string | null
          payment_reference: string
          processed_at?: string
          status: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          id?: string
          organization_id?: string
          payment_method?: string | null
          payment_reference?: string
          processed_at?: string
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          academic_year: string
          admin_approved: boolean | null
          attitude: string | null
          ca_type_id: string | null
          class_id: string | null
          conduct: string | null
          created_at: string | null
          days_absent: number | null
          days_present: number | null
          days_school_opened: number | null
          heads_remarks: string | null
          id: string
          interest: string | null
          is_public: boolean
          next_term_begin: string | null
          organization_id: string | null
          overall_position: number | null
          promoted_to_class: string | null
          student_id: string | null
          teacher_approved: boolean | null
          teacher_id: string | null
          teachers_comment: string | null
          term: string
          term_begin: string | null
          term_ends: string | null
          total_marks: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          admin_approved?: boolean | null
          attitude?: string | null
          ca_type_id?: string | null
          class_id?: string | null
          conduct?: string | null
          created_at?: string | null
          days_absent?: number | null
          days_present?: number | null
          days_school_opened?: number | null
          heads_remarks?: string | null
          id?: string
          interest?: string | null
          is_public?: boolean
          next_term_begin?: string | null
          organization_id?: string | null
          overall_position?: number | null
          promoted_to_class?: string | null
          student_id?: string | null
          teacher_approved?: boolean | null
          teacher_id?: string | null
          teachers_comment?: string | null
          term: string
          term_begin?: string | null
          term_ends?: string | null
          total_marks?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          admin_approved?: boolean | null
          attitude?: string | null
          ca_type_id?: string | null
          class_id?: string | null
          conduct?: string | null
          created_at?: string | null
          days_absent?: number | null
          days_present?: number | null
          days_school_opened?: number | null
          heads_remarks?: string | null
          id?: string
          interest?: string | null
          is_public?: boolean
          next_term_begin?: string | null
          organization_id?: string | null
          overall_position?: number | null
          promoted_to_class?: string | null
          student_id?: string | null
          teacher_approved?: boolean | null
          teacher_id?: string | null
          teachers_comment?: string | null
          term?: string
          term_begin?: string | null
          term_ends?: string | null
          total_marks?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_ca_type_id_fkey"
            columns: ["ca_type_id"]
            isOneToOne: false
            referencedRelation: "ca_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          address_1: string | null
          address_2: string | null
          created_at: string | null
          headteacher_name: string | null
          headteacher_signature_url: string | null
          id: string
          location: string | null
          logo_url: string | null
          motto: string | null
          organization_id: string | null
          phone: string | null
          primary_color: string | null
          school_name: string
          site_description: string | null
          updated_at: string | null
          whatsapp_contact: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          created_at?: string | null
          headteacher_name?: string | null
          headteacher_signature_url?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          motto?: string | null
          organization_id?: string | null
          phone?: string | null
          primary_color?: string | null
          school_name: string
          site_description?: string | null
          updated_at?: string | null
          whatsapp_contact?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          created_at?: string | null
          headteacher_name?: string | null
          headteacher_signature_url?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          motto?: string | null
          organization_id?: string | null
          phone?: string | null
          primary_color?: string | null
          school_name?: string
          site_description?: string | null
          updated_at?: string | null
          whatsapp_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_operations: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_log: Json | null
          failed_records: number | null
          file_name: string | null
          file_path: string | null
          id: string
          metadata: Json | null
          operation_type: string
          processed_records: number | null
          status: string
          template_id: string | null
          total_records: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          failed_records?: number | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          processed_records?: number | null
          status?: string
          template_id?: string | null
          total_records?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          failed_records?: number | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          processed_records?: number | null
          status?: string
          template_id?: string | null
          total_records?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sheet_operations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sheet_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_templates: {
        Row: {
          class_id: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          file_path: string | null
          id: string
          is_active: boolean | null
          name: string
          template_config: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_config?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_config?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          academic_year: string
          address: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          department_id: string | null
          email: string | null
          full_name: string
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          has_left: boolean
          id: string
          no_on_roll: string | null
          organization_id: string | null
          phone: string | null
          photo_url: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_left?: boolean
          id?: string
          no_on_roll?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_left?: boolean
          id?: string
          no_on_roll?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_combinations: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_ids: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_ids?: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_ids?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_combinations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_marks: {
        Row: {
          ca1_score: number | null
          ca2_score: number | null
          ca3_score: number | null
          ca4_score: number | null
          created_at: string | null
          exam_score: number | null
          grade: string | null
          id: string
          position: number | null
          result_id: string | null
          subject_id: string
          subject_teacher_remarks: string | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          ca1_score?: number | null
          ca2_score?: number | null
          ca3_score?: number | null
          ca4_score?: number | null
          created_at?: string | null
          exam_score?: number | null
          grade?: string | null
          id?: string
          position?: number | null
          result_id?: string | null
          subject_id: string
          subject_teacher_remarks?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          ca1_score?: number | null
          ca2_score?: number | null
          ca3_score?: number | null
          ca4_score?: number | null
          created_at?: string | null
          exam_score?: number | null
          grade?: string | null
          id?: string
          position?: number | null
          result_id?: string | null
          subject_id?: string
          subject_teacher_remarks?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_marks_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string | null
          department_id: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          organization_id: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          organization_id: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          organization_id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          organization_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          organization_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year: string
          class_id: string | null
          created_at: string | null
          id: string
          is_primary_teacher: boolean | null
          subject_id: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          class_id?: string | null
          created_at?: string | null
          id?: string
          is_primary_teacher?: boolean | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          class_id?: string | null
          created_at?: string | null
          id?: string
          is_primary_teacher?: boolean | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_id: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          organization_id: string | null
          password_hash: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          organization_id?: string | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          organization_id?: string | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          academic_year: string
          approved_by_teacher_id: string | null
          approved_date: string | null
          completed_date: string | null
          created_at: string | null
          from_class_id: string | null
          id: string
          notes: string | null
          reason: string
          request_date: string
          requested_by_teacher_id: string | null
          status: string
          student_id: string
          to_class_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          approved_by_teacher_id?: string | null
          approved_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          from_class_id?: string | null
          id?: string
          notes?: string | null
          reason: string
          request_date?: string
          requested_by_teacher_id?: string | null
          status?: string
          student_id: string
          to_class_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          approved_by_teacher_id?: string | null
          approved_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          from_class_id?: string | null
          id?: string
          notes?: string | null
          reason?: string
          request_date?: string
          requested_by_teacher_id?: string | null
          status?: string
          student_id?: string
          to_class_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_approved_by_teacher_id_fkey"
            columns: ["approved_by_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_class_id_fkey"
            columns: ["from_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_requested_by_teacher_id_fkey"
            columns: ["requested_by_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_class_id_fkey"
            columns: ["to_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_student_bulk_upload: {
        Args: { operation_id: string; file_data: Json }
        Returns: Json
      }
      save_comment_options: {
        Args: { options_to_save: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
