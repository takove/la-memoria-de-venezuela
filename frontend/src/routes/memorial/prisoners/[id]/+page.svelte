<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { PoliticalPrisoner } from '$lib/types';

  let prisoner: PoliticalPrisoner | null = null;
  let loading = true;
  let error = '';

  async function loadPrisoner() {
    try {
      loading = true;
      error = '';
      const prisonerId = $page.params.id;
      prisoner = await api.getPrisoner(prisonerId);
    } catch (e) {
      error = 'Error al cargar la información del preso político';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr?: string | Date): string {
    if (!dateStr) return 'Fecha desconocida';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getDaysDetained(from?: string | Date, to?: string | Date): number | null {
    if (!from) return null;
    const startDate = new Date(from);
    const endDate = to ? new Date(to) : new Date();
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getConfidenceBadge(level: number): string {
    const labels: Record<number, string> = {
      1: '📌 Rumor',
      2: '⚠️ No Verificado',
      3: '✓ Creíble',
      4: '✓✓ Verificado',
      5: '📋 Oficial',
    };
    return labels[level] || 'Desconocido';
  }

  onMount(loadPrisoner);
</script>

<svelte:head>
  {#if prisoner}
    <title>{prisoner.fullName} | Presos Políticos | La Memoria de Venezuela</title>
    <meta name="description" content="Historia de {prisoner.fullName}. Preso político en Venezuela." />
  {/if}
</svelte:head>

{#if loading}
  <div class="max-w-4xl mx-auto px-4 py-12 text-center">
    <p class="text-gray-600">Cargando...</p>
  </div>
{:else if error}
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{error}</p>
      <a href="/memorial/prisoners" class="text-red-500 hover:text-red-700 mt-4 inline-block">
        ← Volver al memorial
      </a>
    </div>
  </div>
{:else if prisoner}
  <!-- Header -->
  <section class="bg-gray-900 text-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <a href="/memorial/prisoners" class="text-gray-400 hover:text-white mb-4 inline-block">
        ← Volver a Presos Políticos
      </a>
      <div class="flex items-center gap-4 mb-6">
        <div class="text-4xl">⛓️</div>
        <div>
          <h1 class="text-3xl font-bold">{prisoner.fullName}</h1>
          {#if prisoner.profession}
            <p class="text-gray-300">{prisoner.profession}</p>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <section class="bg-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Detention Timeline -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div class="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 class="font-semibold text-amber-900 mb-2">📅 Fecha de Detención</h3>
          <p class="text-lg font-bold text-amber-900">{formatDate(prisoner.dateArrested)}</p>
        </div>

        <div class="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 class="font-semibold text-amber-900 mb-2">🔓 Condición Actual</h3>
          <p class="text-lg font-bold text-amber-900 capitalize">
            {prisoner.status === 'released' ? 'Liberado' : 'Detenido'}
          </p>
          {#if prisoner.dateReleased}
            <p class="text-sm text-amber-700 mt-2">Liberado: {formatDate(prisoner.dateReleased)}</p>
          {/if}
        </div>
      </div>

      <!-- Detention Duration -->
      {#if getDaysDetained(prisoner.dateArrested, prisoner.dateReleased)}
        <div class="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 mb-8">
          <p class="text-sm text-gray-600 mb-1">Días en cautiverio</p>
          <p class="text-3xl font-bold text-red-600">
            {getDaysDetained(prisoner.dateArrested, prisoner.dateReleased)} días
          </p>
        </div>
      {/if}

      <!-- Facilities -->
      {#if prisoner.facilities && prisoner.facilities.length > 0}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">🏢 Lugares de Detención</h2>
          <ul class="space-y-2">
            {#each prisoner.facilities as facility}
              <li class="bg-gray-50 p-4 rounded border border-gray-200">
                <p class="font-semibold text-gray-900">{facility}</p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Charges -->
      {#if prisoner.charges && prisoner.charges.length > 0}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">⚖️ Cargos</h2>
          <div class="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <ul class="space-y-2 mb-4">
              {#each prisoner.charges as charge}
                <li class="text-gray-700">• {charge}</li>
              {/each}
            </ul>
            {#if prisoner.chargesDescriptionEs}
              <p class="text-gray-700 leading-relaxed">{prisoner.chargesDescriptionEs}</p>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Torture/Abuse -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div class="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 class="font-semibold text-red-900 mb-4">🔴 Abuso y Tortura</h3>
          <div class="space-y-3">
            {#if prisoner.torture}
              <div class="flex items-center gap-2">
                <span class="text-red-600">✓</span>
                <span class="text-gray-700">Tortura reportada</span>
              </div>
            {/if}
            {#if prisoner.solitaryConfinement}
              <div class="flex items-center gap-2">
                <span class="text-red-600">✓</span>
                <span class="text-gray-700">Confinamiento solitario</span>
              </div>
            {/if}
            {#if prisoner.medicalAttentionDenied}
              <div class="flex items-center gap-2">
                <span class="text-red-600">✓</span>
                <span class="text-gray-700">Atención médica negada</span>
              </div>
            {/if}
            {#if prisoner.familyVisitsDenied}
              <div class="flex items-center gap-2">
                <span class="text-red-600">✓</span>
                <span class="text-gray-700">Visitas familiares negadas</span>
              </div>
            {/if}
          </div>
        </div>

        <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 class="font-semibold text-blue-900 mb-4">📋 Estado Legal</h3>
          <p class="text-gray-700 mb-4 capitalize">{prisoner.legalStatus}</p>
          {#if prisoner.responsibleEntities}
            <p class="text-sm text-gray-600 mb-2"><strong>Responsables:</strong></p>
            <p class="text-gray-700">{prisoner.responsibleEntities}</p>
          {/if}
        </div>
      </div>

      <!-- Biography -->
      {#if prisoner.biographyEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📖 Quién Es</h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {prisoner.biographyEs}
          </p>
        </div>
      {/if}

      <!-- Sources -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 Fuentes y Documentación</h2>
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">Nivel de Confianza</h3>
            <p class="text-lg font-bold text-gray-900">{getConfidenceBadge(prisoner.confidenceLevel)}</p>
          </div>

          {#if prisoner.evidenceSources && prisoner.evidenceSources.length > 0}
            <h3 class="font-semibold text-gray-700 mb-3">Fuentes de Evidencia</h3>
            <ul class="space-y-2">
              {#each prisoner.evidenceSources as source (source.url)}
                <li>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 hover:underline block"
                  >
                    📄 {source.title || source.organization}
                  </a>
                  <p class="text-sm text-gray-500 ml-6">{source.organization}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Memorial Message -->
      <div class="bg-gray-900 text-white p-8 rounded-lg text-center mt-12">
        <p class="text-xl italic mb-2">"Tu resistencia nos inspira. Tu libertad es nuestra causa."</p>
        <p class="text-gray-400">La Memoria de Venezuela</p>
      </div>
    </div>
  </section>
{:else}
  <div class="max-w-4xl mx-auto px-4 py-12 text-center">
    <p class="text-gray-600">No se encontró la información del preso político.</p>
    <a href="/memorial/prisoners" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">
      ← Volver al memorial
    </a>
  </div>
{/if}
