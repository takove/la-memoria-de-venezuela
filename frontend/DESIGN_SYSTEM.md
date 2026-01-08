# Design System - La Memoria de Venezuela

## Overview

This design system foundation implements color psychology principles to enhance user trust, emotional resonance, and information hierarchy in accountability documentation.

## Color Palette

### Color Psychology

Each color is carefully chosen to convey specific meaning and emotional resonance:

| Color                  | Hex       | Purpose                                          | WCAG Ratio   |
| ---------------------- | --------- | ------------------------------------------------ | ------------ |
| **Danger Red**         | `#C41F2F` | Sanctions, legal actions, urgent matters         | 5.86:1 (AA)  |
| **Justice Green**      | `#2D7F3F` | Convictions, legal victories, positive outcomes  | 4.98:1 (AA)  |
| **Warning Amber**      | `#E8A008` | Investigations, pending actions, warnings        | 9.46:1 (AAA) |
| **Institutional Blue** | `#2D5F7F` | Government positions, official records, trust    | 6.87:1 (AA)  |
| **Neutral Gray**       | `#999999` | Archived records, neutral status, inactive items | 7.37:1 (AAA) |

All colors meet or exceed WCAG AA standards (≥4.5:1 contrast ratio).

## Components

### Badge Component

A reusable badge component with semantic color variants.

#### Usage

```svelte
<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
</script>

<!-- Variants -->
<Badge variant="danger" text="Sanción Activa" />
<Badge variant="success" text="Condenado" />
<Badge variant="warning" text="Investigación" />
<Badge variant="neutral" text="Archivado" />

<!-- Sizes -->
<Badge variant="danger" text="Small" size="sm" />
<Badge variant="danger" text="Medium" size="md" />
<Badge variant="danger" text="Large" size="lg" />
```

#### Props

| Prop      | Type                                              | Default     | Description                              |
| --------- | ------------------------------------------------- | ----------- | ---------------------------------------- |
| `variant` | `'danger' \| 'success' \| 'warning' \| 'neutral'` | `'neutral'` | Visual variant based on semantic meaning |
| `text`    | `string`                                          | required    | Text content to display                  |
| `size`    | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | Size of the badge                        |

## Using Colors in Your Code

### TypeScript/JavaScript

```typescript
import { COLORS, COLOR_CONTRAST } from "$lib/constants/colors";

// Access color values
const dangerColor = COLORS.DANGER_RED; // '#C41F2F'

// Access contrast information
const ratio = COLOR_CONTRAST.DANGER_RED.contrastRatio; // 5.86
```

### Tailwind CSS

```html
<!-- Use the custom memoria color palette -->
<div class="bg-memoria-danger text-white">Danger Red Background</div>
<div class="bg-memoria-justice text-white">Justice Green Background</div>
<div class="bg-memoria-warning text-black">Warning Amber Background</div>
<div class="bg-memoria-institutional text-white">
  Institutional Blue Background
</div>
<div class="bg-memoria-neutral text-black">Neutral Gray Background</div>
```

### CSS Custom Properties

```css
/* Use CSS variables for dynamic theming */
.custom-element {
  background-color: var(--color-danger);
  color: var(--color-danger-text);
}
```

## Migration Guide

Existing components using CSS badge classes can be gradually migrated:

### Before (CSS Classes)

```html
<span class="badge-danger">Sanción Activa</span>
```

### After (Component)

```svelte
<Badge variant="danger" text="Sanción Activa" />
```

## Accessibility

All color combinations are WCAG AA compliant:

- Minimum contrast ratio: 4.5:1 for normal text
- Some colors exceed WCAG AAA (7:1): Warning Amber, Neutral Gray

### Best Practices

1. **Always use semantic variants** - Choose variants based on meaning, not just appearance
2. **Don't rely on color alone** - Supplement with icons or text when critical
3. **Test with screen readers** - Ensure badge content is accessible
4. **Maintain contrast** - Use provided color combinations to ensure readability

## Demo

Visit `/design-system` in the app to see an interactive demo with:

- Color palette showcase
- Badge component examples
- Real-world usage examples
- Code snippets
- WCAG compliance information

## Files

- `src/lib/constants/colors.ts` - Color constants and types
- `src/lib/components/Badge.svelte` - Badge component
- `src/lib/components/__tests__/badge.spec.ts` - Component tests
- `tailwind.config.js` - Tailwind color configuration
- `src/app.css` - CSS custom properties

## Testing

Run tests for the Badge component:

```bash
pnpm test -- src/lib/components/__tests__/badge.spec.ts
```

All 24 Badge component tests should pass.

## Future Enhancements

This foundational design system can be extended with:

- Additional component variants (buttons, alerts, cards)
- Dark mode support
- Animation/transition utilities
- More semantic color tokens
- Component composition patterns

## Contributing

When adding new colors or components:

1. Ensure WCAG AA compliance (≥4.5:1 contrast)
2. Document color psychology rationale
3. Add comprehensive unit tests
4. Update this README
5. Update the design system demo page
