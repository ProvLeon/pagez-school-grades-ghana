
import { useState, useEffect } from "react";
import { useGradingSettings } from "@/hooks/useGradingSettings";

export const useAcademicSettingsManager = () => {
  const { data: existingSettings } = useGradingSettings();

  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [term, setTerm] = useState<"first" | "second" | "third">("first");
  const [attendanceForTerm, setAttendanceForTerm] = useState("");
  const [termBegin, setTermBegin] = useState("");
  const [termEnds, setTermEnds] = useState("");
  const [nextTermBegin, setNextTermBegin] = useState("");

  // Load existing settings
  useEffect(() => {
    if (existingSettings) {
      setAcademicYear(existingSettings.academic_year);
      setTerm(existingSettings.term);
      setAttendanceForTerm(existingSettings.attendance_for_term?.toString() || "");
      setTermBegin(existingSettings.term_begin || "");
      setTermEnds(existingSettings.term_ends || "");
      setNextTermBegin(existingSettings.next_term_begin || "");
    }
  }, [existingSettings]);

  return {
    academicYear,
    setAcademicYear,
    term,
    setTerm,
    attendanceForTerm,
    setAttendanceForTerm,
    termBegin,
    setTermBegin,
    termEnds,
    setTermEnds,
    nextTermBegin,
    setNextTermBegin
  };
};
