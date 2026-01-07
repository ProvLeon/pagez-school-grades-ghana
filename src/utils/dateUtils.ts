/**
 * Date utility functions for parsing and validating dates from Excel files
 * Handles Excel serial dates, multiple date formats, and validates date ranges
 */

/**
 * Format and validate a date string from Excel
 * Supports:
 * - Excel serial numbers (e.g., 44927)
 * - DD/MM/YYYY format (Ghana/UK)
 * - YYYY-MM-DD format (ISO)
 * - MM/DD/YYYY format (US, interpreted as DD/MM/YYYY)
 *
 * @param dateStr - The date string or number from Excel
 * @returns A valid YYYY-MM-DD date string, or empty string if invalid
 */
export function formatDate(dateStr: string | number): string {
  if (!dateStr) return '';

  try {
    // Handle Excel serial dates (numbers like 44927 representing days since 1900-01-01)
    const asNumber = Number(dateStr);
    if (!isNaN(asNumber) && asNumber > 0 && asNumber < 100000) {
      // Excel date serial number
      // Excel's epoch is December 30, 1899 (not January 1, 1900 due to a bug)
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + asNumber * 86400000);

      // Validate the resulting date is reasonable (between 1900 and 2100)
      if (date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Handle DD/MM/YYYY format (common in Ghana/UK)
    const ddmmyyyyMatch = String(dateStr).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0');
      const month = ddmmyyyyMatch[2].padStart(2, '0');
      const year = ddmmyyyyMatch[3];

      // Validate date components
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (yearNum >= 1900 && yearNum <= 2100 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        return `${year}-${month}-${day}`;
      }
    }

    // Handle YYYY-MM-DD format (already correct)
    const yyyymmddMatch = String(dateStr).match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const year = yyyymmddMatch[1];
      const month = yyyymmddMatch[2].padStart(2, '0');
      const day = yyyymmddMatch[3].padStart(2, '0');

      // Validate date components
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);

      if (yearNum >= 1900 && yearNum <= 2100 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        return `${year}-${month}-${day}`;
      }
    }

    // Handle MM/DD/YYYY format (US format) - but default to DD/MM/YYYY interpretation for Ghana
    const slashMatch = String(dateStr).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
      const first = parseInt(slashMatch[1], 10);
      const second = parseInt(slashMatch[2], 10);
      const year = slashMatch[3];
      const yearNum = parseInt(year, 10);

      // If first number > 12, it must be a day (DD/MM/YYYY)
      if (first > 12 && second >= 1 && second <= 12 && yearNum >= 1900 && yearNum <= 2100) {
        const day = slashMatch[1].padStart(2, '0');
        const month = slashMatch[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // Default to DD/MM/YYYY for ambiguous cases (Ghana uses this format)
      if (first >= 1 && first <= 31 && second >= 1 && second <= 12 && yearNum >= 1900 && yearNum <= 2100) {
        const day = slashMatch[1].padStart(2, '0');
        const month = slashMatch[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Try standard Date parsing as last resort, but validate result
    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
  } catch (error) {
    console.warn('Date parsing error:', error, 'for date:', dateStr);
    // If parsing fails, return empty string instead of invalid date
    return '';
  }

  // If nothing worked, return empty string to avoid database errors
  console.warn('Unable to parse date:', dateStr);
  return '';
}

/**
 * Validate a date string is in YYYY-MM-DD format and within reasonable range
 *
 * @param dateStr - The date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || !dateStr.trim()) return false;

  // Check format YYYY-MM-DD
  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return false;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);

  // Validate date is reasonable (between 1900 and current year + 20)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 20) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Check if it's a valid calendar date
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  return true;
}

/**
 * Format a phone number to Ghana standard (+233)
 *
 * @param phone - The phone number to format
 * @returns Formatted phone number with +233 prefix
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle different formats
  if (digits.length === 10 && digits.startsWith('0')) {
    // 0XXXXXXXXX -> +233XXXXXXXXX
    return '+233' + digits.substring(1);
  } else if (digits.length === 12 && digits.startsWith('233')) {
    // 233XXXXXXXXX -> +233XXXXXXXXX
    return '+' + digits;
  } else if (digits.length === 13 && digits.startsWith('233')) {
    // Already in correct format
    return '+' + digits;
  }

  return phone; // Return original if can't format
}

/**
 * Parse a numeric value from a string, returning undefined if invalid
 *
 * @param value - The value to parse
 * @returns The parsed number or undefined
 */
export function parseNumericValue(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;

  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? undefined : num;
}

/**
 * Validate a score is within acceptable range (0-100)
 *
 * @param score - The score to validate
 * @returns True if valid, false otherwise
 */
export function isValidScore(score: number | undefined): boolean {
  if (score === undefined || score === null) return true; // Optional scores are valid
  return score >= 0 && score <= 100;
}

/**
 * Normalize gender value to lowercase 'male' or 'female'
 *
 * @param gender - The gender value to normalize
 * @returns Normalized gender value or 'male' as default
 */
export function normalizeGender(gender: string | undefined): 'male' | 'female' {
  if (!gender) return 'male';

  const normalized = gender.toLowerCase().trim();
  if (normalized === 'f' || normalized === 'female' || normalized === 'girl') {
    return 'female';
  }
  return 'male';
}

/**
 * Normalize term value to 'first', 'second', or 'third'
 *
 * @param term - The term value to normalize
 * @returns Normalized term value or 'first' as default
 */
export function normalizeTerm(term: string | undefined): 'first' | 'second' | 'third' {
  if (!term) return 'first';

  const normalized = term.toLowerCase().trim();
  if (normalized === 'second' || normalized === '2' || normalized === '2nd') {
    return 'second';
  } else if (normalized === 'third' || normalized === '3' || normalized === '3rd') {
    return 'third';
  }
  return 'first';
}
