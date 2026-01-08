/**
 * Design System Colors - La Memoria de Venezuela
 *
 * Color psychology principles for information hierarchy and emotional resonance:
 * - DANGER_RED: Sanctions, legal actions, urgency (OFAC lists)
 * - INSTITUTIONAL_BLUE: Government positions, official records, trust
 * - JUSTICE_GREEN: Convictions, legal victories, positive outcomes
 * - WARNING_AMBER: Investigations, pending actions, warnings
 * - NEUTRAL_GRAY: Archived records, neutral status, inactive items
 *
 * All colors meet WCAG AA compliance (contrast ≥4.5:1) with appropriate text colors.
 */

export const COLORS = {
  // Primary danger color - Sanctions and urgent legal matters
  DANGER_RED: "#C41F2F",

  // Institutional trust - Government positions and official records
  INSTITUTIONAL_BLUE: "#2D5F7F",

  // Justice and legal victories - Convictions and positive outcomes
  JUSTICE_GREEN: "#2D7F3F",

  // Warnings and investigations - Pending actions
  WARNING_AMBER: "#E8A008",

  // Neutral status - Archived and inactive records
  NEUTRAL_GRAY: "#999999",
} as const;

/**
 * Color contrast information for WCAG AA compliance
 * All combinations meet minimum 4.5:1 ratio for normal text
 */
export const COLOR_CONTRAST = {
  DANGER_RED: {
    background: COLORS.DANGER_RED,
    text: "#FFFFFF",
    contrastRatio: 5.86, // Exceeds WCAG AA (4.5:1)
  },
  INSTITUTIONAL_BLUE: {
    background: COLORS.INSTITUTIONAL_BLUE,
    text: "#FFFFFF",
    contrastRatio: 6.87, // Exceeds WCAG AA
  },
  JUSTICE_GREEN: {
    background: COLORS.JUSTICE_GREEN,
    text: "#FFFFFF",
    contrastRatio: 4.98, // Exceeds WCAG AA
  },
  WARNING_AMBER: {
    background: COLORS.WARNING_AMBER,
    text: "#000000",
    contrastRatio: 9.46, // Exceeds WCAG AAA (7:1)
  },
  NEUTRAL_GRAY: {
    background: COLORS.NEUTRAL_GRAY,
    text: "#000000",
    contrastRatio: 7.37, // Exceeds WCAG AAA (7:1)
  },
} as const;

/**
 * Badge variant type for component props
 */
export type BadgeVariant = "danger" | "success" | "warning" | "neutral";

/**
 * Maps badge variants to their corresponding colors
 */
export const BADGE_VARIANT_COLORS: Record<BadgeVariant, keyof typeof COLORS> = {
  danger: "DANGER_RED",
  success: "JUSTICE_GREEN",
  warning: "WARNING_AMBER",
  neutral: "NEUTRAL_GRAY",
} as const;
