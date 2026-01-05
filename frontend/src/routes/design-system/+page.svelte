<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
  import { COLORS, COLOR_CONTRAST } from '$lib/constants/colors';
</script>

<svelte:head>
  <title>Design System - La Memoria de Venezuela</title>
</svelte:head>

<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-8">Design System Foundation</h1>

  <!-- Color Palette -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6">Color Psychology</h2>
    <p class="text-gray-600 mb-6">
      Colors designed for emotional resonance and information hierarchy in accountability documentation.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Danger Red -->
      <div class="card p-6">
        <div
          class="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-white font-semibold"
          style="background-color: {COLORS.DANGER_RED}"
        >
          Danger Red
        </div>
        <h3 class="font-semibold mb-2">Danger Red</h3>
        <p class="text-sm text-gray-600 mb-2">
          {COLORS.DANGER_RED}
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Sanctions, legal actions, urgent matters
        </p>
        <p class="text-xs text-green-600">
          ✓ WCAG AA: {COLOR_CONTRAST.DANGER_RED.contrastRatio}:1
        </p>
      </div>

      <!-- Justice Green -->
      <div class="card p-6">
        <div
          class="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-white font-semibold"
          style="background-color: {COLORS.JUSTICE_GREEN}"
        >
          Justice Green
        </div>
        <h3 class="font-semibold mb-2">Justice Green</h3>
        <p class="text-sm text-gray-600 mb-2">
          {COLORS.JUSTICE_GREEN}
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Convictions, legal victories, positive outcomes
        </p>
        <p class="text-xs text-green-600">
          ✓ WCAG AA: {COLOR_CONTRAST.JUSTICE_GREEN.contrastRatio}:1
        </p>
      </div>

      <!-- Warning Amber -->
      <div class="card p-6">
        <div
          class="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-black font-semibold"
          style="background-color: {COLORS.WARNING_AMBER}"
        >
          Warning Amber
        </div>
        <h3 class="font-semibold mb-2">Warning Amber</h3>
        <p class="text-sm text-gray-600 mb-2">
          {COLORS.WARNING_AMBER}
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Investigations, pending actions, warnings
        </p>
        <p class="text-xs text-green-600">
          ✓ WCAG AAA: {COLOR_CONTRAST.WARNING_AMBER.contrastRatio}:1
        </p>
      </div>

      <!-- Institutional Blue -->
      <div class="card p-6">
        <div
          class="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-white font-semibold"
          style="background-color: {COLORS.INSTITUTIONAL_BLUE}"
        >
          Institutional Blue
        </div>
        <h3 class="font-semibold mb-2">Institutional Blue</h3>
        <p class="text-sm text-gray-600 mb-2">
          {COLORS.INSTITUTIONAL_BLUE}
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Government positions, official records, trust
        </p>
        <p class="text-xs text-green-600">
          ✓ WCAG AA: {COLOR_CONTRAST.INSTITUTIONAL_BLUE.contrastRatio}:1
        </p>
      </div>

      <!-- Neutral Gray -->
      <div class="card p-6">
        <div
          class="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-black font-semibold"
          style="background-color: {COLORS.NEUTRAL_GRAY}"
        >
          Neutral Gray
        </div>
        <h3 class="font-semibold mb-2">Neutral Gray</h3>
        <p class="text-sm text-gray-600 mb-2">
          {COLORS.NEUTRAL_GRAY}
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Archived records, neutral status, inactive items
        </p>
        <p class="text-xs text-green-600">
          ✓ WCAG AA: {COLOR_CONTRAST.NEUTRAL_GRAY.contrastRatio}:1
        </p>
      </div>
    </div>
  </section>

  <!-- Badge Component -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6">Badge Component</h2>
    <p class="text-gray-600 mb-6">
      Reusable badge component with semantic color variants and size options.
    </p>

    <!-- Variants -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Variants</h3>
      <div class="flex flex-wrap gap-4">
        <Badge variant="danger" text="Sanción Activa" />
        <Badge variant="success" text="Condenado" />
        <Badge variant="warning" text="Investigación" />
        <Badge variant="neutral" text="Archivado" />
      </div>
    </div>

    <!-- Sizes -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Sizes</h3>
      <div class="flex flex-wrap items-center gap-4">
        <Badge variant="danger" text="Small" size="sm" />
        <Badge variant="danger" text="Medium (Default)" size="md" />
        <Badge variant="danger" text="Large" size="lg" />
      </div>
    </div>

    <!-- Real-world Examples -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Real-world Examples</h3>
      <div class="space-y-4">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold mb-1">Nicolás Maduro</h4>
              <p class="text-sm text-gray-600">Presidente de Venezuela</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge variant="danger" text="OFAC SDN" />
              <Badge variant="danger" text="DOJ Indictment" />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold mb-1">Alex Saab</h4>
              <p class="text-sm text-gray-600">Testaferro</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge variant="success" text="Extraditado" />
              <Badge variant="warning" text="Juicio Pendiente" />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold mb-1">Hugo Chávez</h4>
              <p class="text-sm text-gray-600">Ex-Presidente</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge variant="neutral" text="Fallecido 2013" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Example -->
    <div class="bg-gray-900 text-gray-100 p-6 rounded-lg">
      <h3 class="text-lg font-semibold mb-4 text-white">Code Example</h3>
      <pre class="text-sm overflow-x-auto"><code>{`<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
</script>

<Badge variant="danger" text="Sanción Activa" />
<Badge variant="success" text="Condenado" />
<Badge variant="warning" text="Investigación" />
<Badge variant="neutral" text="Archivado" />

<!-- With size variants -->
<Badge variant="danger" text="Small" size="sm" />
<Badge variant="danger" text="Medium" size="md" />
<Badge variant="danger" text="Large" size="lg" />`}</code></pre>
    </div>

    <!-- Migration Guide -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-4 text-blue-900">
        Migration from CSS Classes
      </h3>
      <p class="text-sm text-blue-800 mb-4">
        Existing components using CSS badge classes can be gradually migrated to the new Badge component:
      </p>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <p class="text-xs font-semibold text-blue-700 mb-2">Before (CSS):</p>
          <pre class="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto"><code>{`<span class="badge-danger">
  Sanción Activa
</span>`}</code></pre>
        </div>
        <div>
          <p class="text-xs font-semibold text-blue-700 mb-2">After (Component):</p>
          <pre class="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto"><code>{`<Badge 
  variant="danger" 
  text="Sanción Activa" 
/>`}</code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- WCAG Compliance -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-6">WCAG Compliance</h2>
    <div class="card p-6">
      <p class="text-gray-600 mb-4">
        All color combinations meet or exceed WCAG AA standards for contrast ratio (≥4.5:1).
        Warning Amber exceeds WCAG AAA standards (≥7:1).
      </p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-green-600">7.36:1</p>
          <p class="text-sm text-gray-600">Danger Red</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-green-600">7.28:1</p>
          <p class="text-sm text-gray-600">Justice Green</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-green-600">10.89:1</p>
          <p class="text-sm text-gray-600">Warning Amber</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-green-600">4.61:1</p>
          <p class="text-sm text-gray-600">Neutral Gray</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Back to Home -->
  <div class="text-center">
    <a href="/" class="btn-primary">
      ← Volver al inicio
    </a>
  </div>
</div>
