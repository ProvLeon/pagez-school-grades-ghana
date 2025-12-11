/**
 * Department Naming Utilities
 *
 * This module provides centralized utilities for consistent department naming
 * across the entire platform.
 *
 * Standard Department Names (Database):
 * - PRIMARY (not "Primary", "primary", "P")
 * - JUNIOR HIGH (not "JHS", "jhs", "Junior High")
 * - SENIOR HIGH (not "SHS", "shs", "Senior High")
 * - KG (Kindergarten)
 */

// ============================================
// Types
// ============================================

export type DepartmentKey = "kg" | "primary" | "jhs" | "shs";

export interface DepartmentInfo {
  key: DepartmentKey;
  dbName: string;        // Standard database name (e.g., "JUNIOR HIGH")
  displayName: string;   // Display name (same as dbName for consistency)
  shortName: string;     // Short abbreviation (e.g., "JHS")
  aliases: string[];     // All possible aliases/variations
}

// ============================================
// Department Configuration
// ============================================

/**
 * Master department configuration
 * This is the single source of truth for all department naming
 */
export const DEPARTMENTS: Record<DepartmentKey, DepartmentInfo> = {
  kg: {
    key: "kg",
    dbName: "KG",
    displayName: "KG",
    shortName: "KG",
    aliases: ["kg", "KG", "kindergarten", "Kindergarten", "KINDERGARTEN"],
  },
  primary: {
    key: "primary",
    dbName: "PRIMARY",
    displayName: "PRIMARY",
    shortName: "PRI",
    aliases: ["primary", "Primary", "PRIMARY", "p", "P", "pri", "PRI"],
  },
  jhs: {
    key: "jhs",
    dbName: "JUNIOR HIGH",
    displayName: "JUNIOR HIGH",
    shortName: "JHS",
    aliases: [
      "jhs", "JHS", "Jhs",
      "junior high", "Junior High", "JUNIOR HIGH",
      "junior high school", "Junior High School", "JUNIOR HIGH SCHOOL",
      "j.h.s", "J.H.S", "J.H.S.",
    ],
  },
  shs: {
    key: "shs",
    dbName: "SENIOR HIGH",
    displayName: "SENIOR HIGH",
    shortName: "SHS",
    aliases: [
      "shs", "SHS", "Shs",
      "senior high", "Senior High", "SENIOR HIGH",
      "senior high school", "Senior High School", "SENIOR HIGH SCHOOL",
      "s.h.s", "S.H.S", "S.H.S.",
    ],
  },
};

// ============================================
// Legacy Mapping (for backwards compatibility)
// ============================================

/**
 * Maps any department input to its standard database name
 */
export const DEPARTMENT_DB_MAPPING: Record<string, string> = {
  // KG
  'kg': 'KG',
  'KG': 'KG',
  'kindergarten': 'KG',
  'Kindergarten': 'KG',
  'KINDERGARTEN': 'KG',

  // PRIMARY
  'primary': 'PRIMARY',
  'Primary': 'PRIMARY',
  'PRIMARY': 'PRIMARY',
  'p': 'PRIMARY',
  'P': 'PRIMARY',
  'pri': 'PRIMARY',
  'PRI': 'PRIMARY',

  // JUNIOR HIGH (formerly JHS)
  'jhs': 'JUNIOR HIGH',
  'JHS': 'JUNIOR HIGH',
  'Jhs': 'JUNIOR HIGH',
  'junior high': 'JUNIOR HIGH',
  'Junior High': 'JUNIOR HIGH',
  'JUNIOR HIGH': 'JUNIOR HIGH',
  'junior high school': 'JUNIOR HIGH',
  'Junior High School': 'JUNIOR HIGH',
  'JUNIOR HIGH SCHOOL': 'JUNIOR HIGH',
  'j.h.s': 'JUNIOR HIGH',
  'J.H.S': 'JUNIOR HIGH',
  'J.H.S.': 'JUNIOR HIGH',

  // SENIOR HIGH (formerly SHS)
  'shs': 'SENIOR HIGH',
  'SHS': 'SENIOR HIGH',
  'Shs': 'SENIOR HIGH',
  'senior high': 'SENIOR HIGH',
  'Senior High': 'SENIOR HIGH',
  'SENIOR HIGH': 'SENIOR HIGH',
  'senior high school': 'SENIOR HIGH',
  'Senior High School': 'SENIOR HIGH',
  'SENIOR HIGH SCHOOL': 'SENIOR HIGH',
  's.h.s': 'SENIOR HIGH',
  'S.H.S': 'SENIOR HIGH',
  'S.H.S.': 'SENIOR HIGH',
};

// ============================================
// Normalization Functions
// ============================================

/**
 * Normalizes any department name/alias to the standard database name
 *
 * @param input - Any department name, alias, or abbreviation
 * @returns The standard database name (e.g., "PRIMARY", "JUNIOR HIGH")
 *
 * @example
 * normalizeDepartmentName("JHS") // returns "JUNIOR HIGH"
 * normalizeDepartmentName("primary") // returns "PRIMARY"
 * normalizeDepartmentName("SHS") // returns "SENIOR HIGH"
 */
export const normalizeDepartmentName = (input: string | null | undefined): string => {
  if (!input) return "";

  const trimmed = input.trim();

  // Check direct mapping first
  if (DEPARTMENT_DB_MAPPING[trimmed]) {
    return DEPARTMENT_DB_MAPPING[trimmed];
  }

  // Check lowercase version
  const lower = trimmed.toLowerCase();
  if (DEPARTMENT_DB_MAPPING[lower]) {
    return DEPARTMENT_DB_MAPPING[lower];
  }

  // Check against all aliases
  for (const dept of Object.values(DEPARTMENTS)) {
    if (dept.aliases.some(alias => alias.toLowerCase() === lower)) {
      return dept.dbName;
    }
  }

  // If no match found, return uppercase version as fallback
  console.warn(`Unknown department name: "${input}", returning uppercase version`);
  return trimmed.toUpperCase();
};

/**
 * Gets the display name for a department (same as normalized name for consistency)
 *
 * @param input - Any department name, alias, or abbreviation
 * @returns The display name (e.g., "PRIMARY", "JUNIOR HIGH")
 */
export const getDepartmentDisplayName = (input: string | null | undefined): string => {
  return normalizeDepartmentName(input);
};

/**
 * Gets the short abbreviation for a department
 *
 * @param input - Any department name, alias, or abbreviation
 * @returns The short name (e.g., "JHS", "SHS", "PRI")
 */
export const getDepartmentShortName = (input: string | null | undefined): string => {
  if (!input) return "";

  const normalized = normalizeDepartmentName(input);

  // Find the department by its dbName
  const dept = Object.values(DEPARTMENTS).find(d => d.dbName === normalized);
  return dept?.shortName || normalized;
};

/**
 * Gets the database name for a department key
 *
 * @param departmentKey - The department key (kg, primary, jhs, shs)
 * @returns The standard database name
 */
export const getDepartmentDbName = (departmentKey: string): string => {
  const normalized = normalizeDepartmentName(departmentKey);
  if (!normalized) {
    throw new Error(
      `Invalid department key: ${departmentKey}. Must be one of: kg, primary, jhs, shs`
    );
  }
  return normalized;
};

/**
 * Gets the department key from any input
 *
 * @param input - Any department name, alias, or abbreviation
 * @returns The department key (kg, primary, jhs, shs)
 */
export const getDepartmentKey = (input: string | null | undefined): DepartmentKey | null => {
  if (!input) return null;

  const normalized = normalizeDepartmentName(input);

  const dept = Object.values(DEPARTMENTS).find(d => d.dbName === normalized);
  return dept?.key || null;
};

// ============================================
// Utility Functions
// ============================================

/**
 * Gets all departments as an array
 *
 * @returns Array of department info objects
 */
export const getAllDepartments = (): DepartmentInfo[] => Object.values(DEPARTMENTS);

/**
 * Gets departments formatted for select dropdowns
 *
 * @returns Array of { value, label } objects
 */
export const getDepartmentOptions = (): { value: string; label: string }[] => {
  return Object.values(DEPARTMENTS).map(dept => ({
    value: dept.dbName,
    label: dept.displayName,
  }));
};

/**
 * Checks if a string is a valid department name/alias
 *
 * @param input - The string to check
 * @returns true if valid department
 */
export const isValidDepartment = (input: string | null | undefined): boolean => {
  if (!input) return false;

  const trimmed = input.trim().toLowerCase();

  // Check direct mapping
  if (DEPARTMENT_DB_MAPPING[trimmed] || DEPARTMENT_DB_MAPPING[input.trim()]) {
    return true;
  }

  // Check aliases
  return Object.values(DEPARTMENTS).some(dept =>
    dept.aliases.some(alias => alias.toLowerCase() === trimmed)
  );
};

/**
 * Formats a department name for display in UI components
 * This ensures consistent capitalization across the platform
 *
 * @param input - Any department name
 * @returns Formatted display name
 *
 * @example
 * formatDepartmentForDisplay("jhs") // returns "JUNIOR HIGH"
 * formatDepartmentForDisplay("Primary") // returns "PRIMARY"
 */
export const formatDepartmentForDisplay = (input: string | null | undefined): string => {
  return normalizeDepartmentName(input);
};

/**
 * Gets department info by any input
 *
 * @param input - Any department name, alias, or abbreviation
 * @returns Full department info or null if not found
 */
export const getDepartmentInfo = (input: string | null | undefined): DepartmentInfo | null => {
  if (!input) return null;

  const normalized = normalizeDepartmentName(input);
  return Object.values(DEPARTMENTS).find(d => d.dbName === normalized) || null;
};

// ============================================
// Migration Helper
// ============================================

/**
 * Converts old department names in data to new standardized names
 * Useful for migrating existing data
 *
 * @param data - Array of objects with department field
 * @param departmentField - Name of the field containing department (default: "name")
 * @returns Array with normalized department names
 */
export const migrateDepartmentNames = <T extends Record<string, unknown>>(
  data: T[],
  departmentField: keyof T = "name" as keyof T
): T[] => {
  return data.map(item => ({
    ...item,
    [departmentField]: normalizeDepartmentName(item[departmentField] as string),
  }));
};

// ============================================
// SQL Migration Query Generator
// ============================================

/**
 * Generates SQL UPDATE statements to normalize department names in the database
 *
 * @returns SQL string to update department names
 */
export const generateDepartmentMigrationSQL = (): string => {
  return `
-- Update department names to standard format
-- Run this in Supabase SQL Editor

-- Update JHS to JUNIOR HIGH
UPDATE public.departments
SET name = 'JUNIOR HIGH', updated_at = NOW()
WHERE LOWER(name) IN ('jhs', 'j.h.s', 'junior high school');

-- Update SHS to SENIOR HIGH
UPDATE public.departments
SET name = 'SENIOR HIGH', updated_at = NOW()
WHERE LOWER(name) IN ('shs', 's.h.s', 'senior high school');

-- Update Primary variations to PRIMARY
UPDATE public.departments
SET name = 'PRIMARY', updated_at = NOW()
WHERE LOWER(name) IN ('primary', 'primary school') AND name != 'PRIMARY';

-- Update KG variations
UPDATE public.departments
SET name = 'KG', updated_at = NOW()
WHERE LOWER(name) IN ('kindergarten', 'kg') AND name != 'KG';

-- Verify the changes
SELECT id, name, updated_at FROM public.departments ORDER BY name;
`.trim();
};

// ============================================
// Exports for backwards compatibility
// ============================================

export default {
  DEPARTMENTS,
  DEPARTMENT_DB_MAPPING,
  normalizeDepartmentName,
  getDepartmentDisplayName,
  getDepartmentShortName,
  getDepartmentDbName,
  getDepartmentKey,
  getAllDepartments,
  getDepartmentOptions,
  isValidDepartment,
  formatDepartmentForDisplay,
  getDepartmentInfo,
  migrateDepartmentNames,
  generateDepartmentMigrationSQL,
};
