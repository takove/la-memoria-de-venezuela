<script lang="ts">
  import type { BadgeVariant } from '$lib/constants/colors';

  /**
   * Badge Component - Design System Foundation
   * 
   * A reusable badge component with color psychology variants:
   * - danger: Red for sanctions and urgent matters
   * - success: Green for convictions and legal victories
   * - warning: Amber for investigations and pending actions
   * - neutral: Gray for archived/inactive status
   * 
   * All variants meet WCAG AA compliance (contrast ≥4.5:1)
   */

  export let variant: BadgeVariant = 'neutral';
  export let text: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  // Variant classes using Tailwind colors
  const variantClasses = {
    danger: 'bg-memoria-danger text-white',
    success: 'bg-memoria-justice text-white',
    warning: 'bg-memoria-warning text-black',
    neutral: 'bg-memoria-neutral text-black',
  };

  // Combine classes
  $: badgeClasses = `inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]}`;
</script>

<span class={badgeClasses} data-testid="badge" data-variant={variant} data-size={size}>
  {text}
</span>
