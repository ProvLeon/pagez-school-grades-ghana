// Theme utilities for report sheet styling only
// The main app theme remains blue (primary) - theme color is only for report sheets

export const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Convert hex color to HSL string for inline styles
export const hexToHslString = (hex: string): string => {
  const hsl = hexToHsl(hex);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

// Get report sheet theme styles based on the school's primary color setting
// This is used for PDF generation and report sheet display
export const getReportSheetStyles = (primaryColor: string | null) => {
  const color = primaryColor || '#e11d48'; // Default to red if no color set
  const hsl = hexToHsl(color);

  return {
    primaryColor: color,
    primaryColorHsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    primaryColorLight: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 30, 95)}%)`,
    primaryColorDark: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 20)}%)`,
    headerBg: color,
    headerText: '#ffffff',
    borderColor: color,
    accentColor: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 40, 95)}%)`,
  };
};

// Legacy function - now a no-op to prevent theme color from affecting main app
// The main app should always use the blue primary color defined in CSS
export const applyThemeColor = (color: string): void => {
  // NO-OP: Theme color should only apply to report sheets, not the main app
  // The primary color for the main app is defined in index.css (blue: 221 83% 53%)
  // This function is kept for backward compatibility but does nothing
  console.log('Theme color saved for report sheets:', color);
};

// Get CSS variables for report sheet styling (for inline styles in PDFs/prints)
export const getReportSheetCssVars = (primaryColor: string | null): Record<string, string> => {
  const styles = getReportSheetStyles(primaryColor);
  return {
    '--report-primary': styles.primaryColor,
    '--report-primary-hsl': styles.primaryColorHsl,
    '--report-primary-light': styles.primaryColorLight,
    '--report-primary-dark': styles.primaryColorDark,
    '--report-header-bg': styles.headerBg,
    '--report-header-text': styles.headerText,
    '--report-border': styles.borderColor,
    '--report-accent': styles.accentColor,
  };
};
