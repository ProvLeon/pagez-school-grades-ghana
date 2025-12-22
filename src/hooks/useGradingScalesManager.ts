import { useState, useEffect, useCallback } from "react";
import { GradingScale } from "@/types/gradingSettings";
import { useDepartments, Department } from "@/hooks/useDepartments";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useGradingSettings } from "@/hooks/useGradingSettings";

// Type for grading scales indexed by department ID
type GradingScalesMap = Record<string, GradingScale[]>;

// Default grading scales for new departments
const DEFAULT_SCALES: GradingScale[] = [
  { id: "default-1", from: 80, to: 100, grade: "A", remark: "Excellent" },
  { id: "default-2", from: 70, to: 79, grade: "B", remark: "Very Good" },
  { id: "default-3", from: 60, to: 69, grade: "C", remark: "Good" },
  { id: "default-4", from: 50, to: 59, grade: "D", remark: "Credit" },
  { id: "default-5", from: 0, to: 49, grade: "F", remark: "Fail" }
];

// Helper to normalize department name for matching
const normalizeDeptName = (name: string): string => {
  const upper = name.toUpperCase().trim();
  // Handle common abbreviations
  if (upper === 'JHS' || upper === 'J.H.S' || upper === 'J.H.S.') return 'JUNIOR HIGH';
  if (upper === 'SHS' || upper === 'S.H.S' || upper === 'S.H.S.') return 'SENIOR HIGH';
  if (upper === 'KG' || upper === 'K.G' || upper === 'K.G.') return 'KG';
  if (upper === 'PRI' || upper === 'PRIM') return 'PRIMARY';
  return upper;
};

// Fetch grading scales for all departments, filtered by academic year and term
const fetchAllGradingScales = async (
  departments: Department[],
  academicYear: string,
  term: string
): Promise<GradingScalesMap> => {
  if (departments.length === 0) {
    return {};
  }

  // Build query - filter by academic year and term if available
  let query = supabase
    .from("grading_scales")
    .select("*")
    .order("from_percentage", { ascending: false });

  // Only filter by year/term if we have values
  if (academicYear) {
    query = query.eq("academic_year", academicYear);
  }
  if (term) {
    query = query.eq("term", term);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[GradingScalesManager] Error fetching grading scales:", error);
    return {};
  }

  // Initialize scales map with empty arrays for each department
  const scalesMap: GradingScalesMap = {};
  departments.forEach(dept => {
    scalesMap[dept.id] = [];
  });

  // Track which scale IDs we've already processed to avoid duplicates
  const processedScaleIds = new Set<string>();

  if (data) {
    // First pass: match by department_id (most reliable)
    for (const scale of data) {
      if (processedScaleIds.has(scale.id)) {
        continue;
      }

      // Only match by department_id in first pass
      if (scale.department_id && scalesMap[scale.department_id] !== undefined) {
        scalesMap[scale.department_id].push({
          id: scale.id,
          from: Number(scale.from_percentage),
          to: Number(scale.to_percentage),
          grade: scale.grade,
          remark: scale.remark || ""
        });
        processedScaleIds.add(scale.id);
      }
    }

    // Second pass: match by department name ONLY for records not matched by department_id
    // This handles legacy records that don't have department_id set
    for (const scale of data) {
      // Skip if already processed
      if (processedScaleIds.has(scale.id)) {
        continue;
      }

      // Only match by name if department_id is null/missing
      if (!scale.department_id && scale.department) {
        const normalizedScaleDept = normalizeDeptName(scale.department);
        const matchingDept = departments.find(d => normalizeDeptName(d.name) === normalizedScaleDept);
        if (matchingDept && scalesMap[matchingDept.id] !== undefined) {
          scalesMap[matchingDept.id].push({
            id: scale.id,
            from: Number(scale.from_percentage),
            to: Number(scale.to_percentage),
            grade: scale.grade,
            remark: scale.remark || ""
          });
          processedScaleIds.add(scale.id);
        }
      }
    }
  }

  return scalesMap;
};

export const useGradingScalesManager = () => {
  const { data: departments = [] } = useDepartments();
  const { data: gradingSettings } = useGradingSettings();
  const departmentIds = departments.map(d => d.id);

  // Get current academic year and term from settings
  const academicYear = gradingSettings?.academic_year || "";
  const term = gradingSettings?.term || "";

  // Fetch grading scales from database - filtered by current academic year/term
  const { data: fetchedScales, isLoading } = useQuery({
    queryKey: ["grading-scales", departmentIds.join(","), academicYear, term],
    queryFn: () => fetchAllGradingScales(departments, academicYear, term),
    enabled: departments.length > 0,
  });

  // Local state for grading scales (allows editing before save)
  const [gradingScales, setGradingScales] = useState<GradingScalesMap>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize local state from fetched data (only once when data loads)
  useEffect(() => {
    if (fetchedScales && !hasInitialized && !isLoading) {
      const initialScales: GradingScalesMap = {};

      departments.forEach(dept => {
        const fetched = fetchedScales[dept.id] || [];
        if (fetched.length > 0) {
          // Use fetched scales
          initialScales[dept.id] = fetched;
        } else {
          // Use default scales for departments with no scales
          initialScales[dept.id] = DEFAULT_SCALES.map((scale, index) => ({
            ...scale,
            id: `${dept.id}-default-${index}-${Date.now()}`
          }));
        }
      });

      setGradingScales(initialScales);
      setHasInitialized(true);
    }
  }, [fetchedScales, departments, hasInitialized, isLoading]);

  // Handle new departments being added (after initial load)
  useEffect(() => {
    if (hasInitialized && departments.length > 0) {
      setGradingScales(prevScales => {
        const newScales = { ...prevScales };
        let hasChanges = false;

        departments.forEach(dept => {
          if (!newScales[dept.id]) {
            // New department - add default scales
            newScales[dept.id] = DEFAULT_SCALES.map((scale, index) => ({
              ...scale,
              id: `${dept.id}-new-${index}-${Date.now()}`
            }));
            hasChanges = true;
          }
        });

        return hasChanges ? newScales : prevScales;
      });
    }
  }, [departments, hasInitialized]);

  // Add a new grading row for a department
  const addGradingRow = useCallback((departmentId: string) => {
    const newRow: GradingScale = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: 0,
      to: 0,
      grade: "",
      remark: ""
    };

    setGradingScales(prev => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), newRow]
    }));
  }, []);

  // Remove a grading row from a department
  const removeGradingRow = useCallback((departmentId: string, id: string) => {
    setGradingScales(prev => ({
      ...prev,
      [departmentId]: (prev[departmentId] || []).filter(row => row.id !== id)
    }));
  }, []);

  // Update a grading row field
  const updateGradingRow = useCallback((
    departmentId: string,
    id: string,
    field: keyof GradingScale,
    value: string | number
  ) => {
    setGradingScales(prev => ({
      ...prev,
      [departmentId]: (prev[departmentId] || []).map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }));
  }, []);

  return {
    gradingScales,
    addGradingRow,
    removeGradingRow,
    updateGradingRow
  };
};
