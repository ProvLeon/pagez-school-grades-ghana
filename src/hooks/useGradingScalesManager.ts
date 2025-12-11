
import { useState, useEffect } from "react";
import { GradingScale, Department } from "@/types/gradingSettings";
import { useGradingScales, useGradingSettings } from "@/hooks/useGradingSettings";

export const useGradingScalesManager = () => {
  const { data: gradingSettings } = useGradingSettings();
  
  // Get current academic year and term from settings
  const academicYear = gradingSettings?.academic_year || "2024/2025";
  const term = gradingSettings?.term || "first";

  // Fetch existing grading scales for each department
  const { data: kgScalesData = [] } = useGradingScales("KG", academicYear, term);
  const { data: primaryScalesData = [] } = useGradingScales("PRIMARY", academicYear, term);
  const { data: jhsScalesData = [] } = useGradingScales("JHS", academicYear, term);

  // Default grading scales
  const defaultScales: GradingScale[] = [
    { id: "1", from: 80, to: 100, grade: "A", remark: "Excellent" },
    { id: "2", from: 70, to: 79, grade: "B", remark: "Very Good" },
    { id: "3", from: 60, to: 69, grade: "C", remark: "Good" },
    { id: "4", from: 50, to: 59, grade: "D", remark: "Credit" },
    { id: "5", from: 0, to: 49, grade: "F", remark: "Fail" }
  ];

  // Local states for grading scales, initialized from fetched data
  // This initializer function runs only once on mount
  const [kgGrading, setKgGrading] = useState<GradingScale[]>(() => 
    kgScalesData.length > 0 ? kgScalesData.map(scale => ({
      id: scale.id, from: Number(scale.from_percentage), to: Number(scale.to_percentage), grade: scale.grade, remark: scale.remark
    })) : defaultScales
  );
  const [primaryGrading, setPrimaryGrading] = useState<GradingScale[]>(() =>
    primaryScalesData.length > 0 ? primaryScalesData.map(scale => ({
      id: scale.id, from: Number(scale.from_percentage), to: Number(scale.to_percentage), grade: scale.grade, remark: scale.remark
    })) : defaultScales
  );
  const [jhsGrading, setJhsGrading] = useState<GradingScale[]>(() =>
    jhsScalesData.length > 0 ? jhsScalesData.map(scale => ({
      id: scale.id, from: Number(scale.from_percentage), to: Number(scale.to_percentage), grade: scale.grade, remark: scale.remark
    })) : defaultScales
  );

  // Effect to reset local state when academicYear or term changes
  // This ensures that if the context for the grading scales changes,
  // the local state is re-initialized with the new fetched data.
  useEffect(() => {
    // Only re-initialize if the fetched data is actually different from the current local state
    // This prevents overwriting local edits if only the object reference of fetchedData changes
    const initializeIfChanged = (
      fetchedData: any[],
      currentGrading: GradingScale[],
      setter: React.Dispatch<React.SetStateAction<GradingScale[]>>
    ) => {
      const newGrading = fetchedData.length > 0 ? fetchedData.map(scale => ({
        id: scale.id, from: Number(scale.from_percentage), to: Number(scale.to_percentage), grade: scale.grade, remark: scale.remark
      })) : defaultScales;

      if (JSON.stringify(newGrading) !== JSON.stringify(currentGrading)) {
        setter(newGrading);
      }
    };

    initializeIfChanged(kgScalesData, kgGrading, setKgGrading);
    initializeIfChanged(primaryScalesData, primaryGrading, setPrimaryGrading);
    initializeIfChanged(jhsScalesData, jhsGrading, setJhsGrading);

  }, [academicYear, term, defaultScales, kgScalesData, primaryScalesData, jhsScalesData]);

  const addGradingRow = (department: Department) => {
    const newRow: GradingScale = {
      id: Date.now().toString(),
      from: 0,
      to: 0,
      grade: "",
      remark: ""
    };

    if (department === "kg") {
      setKgGrading([...kgGrading, newRow]);
    } else if (department === "primary") {
      setPrimaryGrading([...primaryGrading, newRow]);
    } else {
      setJhsGrading([...jhsGrading, newRow]);
    }
  };

  const removeGradingRow = (department: Department, id: string) => {
    if (department === "kg") {
      setKgGrading(kgGrading.filter(row => row.id !== id));
    } else if (department === "primary") {
      setPrimaryGrading(primaryGrading.filter(row => row.id !== id));
    } else {
      setJhsGrading(jhsGrading.filter(row => row.id !== id));
    }
  };

  const updateGradingRow = (department: Department, id: string, field: keyof GradingScale, value: string | number) => {
    const updateFunction = (rows: GradingScale[]) =>
      rows.map(row => row.id === id ? { ...row, [field]: value } : row);

    if (department === "kg") {
      setKgGrading(updateFunction(kgGrading));
    } else if (department === "primary") {
      setPrimaryGrading(updateFunction(primaryGrading));
    } else {
      setJhsGrading(updateFunction(jhsGrading));
    }
  };

  return {
    kgGrading,
    primaryGrading,
    jhsGrading,
    addGradingRow,
    removeGradingRow,
    updateGradingRow
  };
};
