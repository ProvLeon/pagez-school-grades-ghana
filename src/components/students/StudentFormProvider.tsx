
import { createContext, useContext, useState } from "react";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

export interface StudentFormData {
  full_name: string;
  gender: "male" | "female";
  date_of_birth: string;
  class_id: string;
  department_id: string;
  academic_year: string;
  auto_generate_id: boolean;
  student_id: string;
  photo_url: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  address: string;
}

interface StudentFormContextType {
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
  generateStudentId: () => string;
}

const StudentFormContext = createContext<StudentFormContextType | undefined>(undefined);

export const useStudentForm = () => {
  const context = useContext(StudentFormContext);
  if (!context) {
    throw new Error('useStudentForm must be used within StudentFormProvider');
  }
  return context;
};

interface StudentFormProviderProps {
  children: React.ReactNode;
}

export const StudentFormProvider = ({ children }: StudentFormProviderProps) => {
  const { settings } = useSchoolSettings();
  
  const [formData, setFormData] = useState<StudentFormData>({
    full_name: "",
    gender: "male",
    date_of_birth: "",
    class_id: "",
    department_id: "",
    academic_year: "2024/2025",
    auto_generate_id: true,
    student_id: "",
    photo_url: null,
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    address: "",
  });

  const generateStudentId = () => {
    // Extract first two letters from school name, fallback to "SC" if no school name
    const schoolName = settings?.school_name || "School";
    const schoolInitials = schoolName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || "SC";
    
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${schoolInitials}${currentYear}${random}`;
  };

  return (
    <StudentFormContext.Provider value={{
      formData,
      setFormData,
      generateStudentId
    }}>
      {children}
    </StudentFormContext.Provider>
  );
};
