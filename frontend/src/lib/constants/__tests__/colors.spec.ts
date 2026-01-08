import { describe, it, expect } from 'vitest';
import { COLORS, COLOR_CONTRAST, BADGE_VARIANT_COLORS, type BadgeVariant } from '../colors';

describe('Color Constants', () => {
  describe('COLORS', () => {
    it('exports all required color values', () => {
      expect(COLORS.DANGER_RED).toBe('#C41F2F');
      expect(COLORS.INSTITUTIONAL_BLUE).toBe('#2D5F7F');
      expect(COLORS.JUSTICE_GREEN).toBe('#2D7F3F');
      expect(COLORS.WARNING_AMBER).toBe('#E8A008');
      expect(COLORS.NEUTRAL_GRAY).toBe('#999999');
    });

    it('all colors are valid hex codes', () => {
      Object.values(COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('COLOR_CONTRAST', () => {
    it('has contrast info for all colors', () => {
      expect(COLOR_CONTRAST.DANGER_RED).toBeDefined();
      expect(COLOR_CONTRAST.INSTITUTIONAL_BLUE).toBeDefined();
      expect(COLOR_CONTRAST.JUSTICE_GREEN).toBeDefined();
      expect(COLOR_CONTRAST.WARNING_AMBER).toBeDefined();
      expect(COLOR_CONTRAST.NEUTRAL_GRAY).toBeDefined();
    });

    it('all entries have required properties', () => {
      Object.values(COLOR_CONTRAST).forEach(contrast => {
        expect(contrast).toHaveProperty('background');
        expect(contrast).toHaveProperty('text');
        expect(contrast).toHaveProperty('contrastRatio');
      });
    });

    it('all contrast ratios meet WCAG AA minimum (4.5:1)', () => {
      Object.values(COLOR_CONTRAST).forEach(contrast => {
        expect(contrast.contrastRatio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('DANGER_RED has white text', () => {
      expect(COLOR_CONTRAST.DANGER_RED.text).toBe('#FFFFFF');
    });

    it('WARNING_AMBER has black text for high contrast', () => {
      expect(COLOR_CONTRAST.WARNING_AMBER.text).toBe('#000000');
    });

    it('backgrounds match COLORS values', () => {
      expect(COLOR_CONTRAST.DANGER_RED.background).toBe(COLORS.DANGER_RED);
      expect(COLOR_CONTRAST.JUSTICE_GREEN.background).toBe(COLORS.JUSTICE_GREEN);
    });
  });

  describe('BADGE_VARIANT_COLORS', () => {
    it('maps all badge variants to colors', () => {
      expect(BADGE_VARIANT_COLORS.danger).toBe('DANGER_RED');
      expect(BADGE_VARIANT_COLORS.success).toBe('JUSTICE_GREEN');
      expect(BADGE_VARIANT_COLORS.warning).toBe('WARNING_AMBER');
      expect(BADGE_VARIANT_COLORS.neutral).toBe('NEUTRAL_GRAY');
    });

    it('all mapped colors exist in COLORS', () => {
      Object.values(BADGE_VARIANT_COLORS).forEach(colorKey => {
        expect(COLORS[colorKey]).toBeDefined();
      });
    });

    it('has all required badge variants', () => {
      const variants: BadgeVariant[] = ['danger', 'success', 'warning', 'neutral'];
      variants.forEach(variant => {
        expect(BADGE_VARIANT_COLORS[variant]).toBeDefined();
      });
    });
  });
});
