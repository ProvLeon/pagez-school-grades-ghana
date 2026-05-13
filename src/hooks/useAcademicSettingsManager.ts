
import { useState, useEffect, useRef } from "react";
import { useGradingSettings } from "@/hooks/useGradingSettings";

export const useAcademicSettingsManager = () => {
  const { data: existingSettings } = useGradingSettings();

  // Guard: only seed form state from DB on the FIRST successful fetch.
  // Without this, invalidateQueries after save re-fetches and the useEffect
  // fires again, resetting all user edits — which looks like a page refresh.
  const initializedRef = useRef(false);

  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [term, setTerm] = useState<"first" | "second" | "third">("first");
  const [attendanceForTerm, setAttendanceForTerm] = useState("");
  const [termBegin, setTermBegin] = useState("");
  const [termEnds, setTermEnds] = useState("");
  const [nextTermBegin, setNextTermBegin] = useState("");

  // Seed form fields from DB — once only
  useEffect(() => {
    if (existingSettings && !initializedRef.current) {
      initializedRef.current = true;
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
