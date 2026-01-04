<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Victim } from '$lib/types';

  let victim: Victim | null = null;
  let loading = true;
  let error = '';

  async function loadVictim() {
    try {
      loading = true;
      error = '';
      const victimId = $page.params.id;
      victim = await api.getVictim(victimId);
    } catch (e) {
      error = 'Error al cargar la información de la víctima';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'Fecha desconocida';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  onMount(loadVictim);
</script>

<svelte:head>
  {#if victim}
    <title>{victim.fullName} | Memorial | La Memoria de Venezuela</title>
    <meta name="description" content="Memorial de {victim.fullName}. Nunca olvidaremos." />
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
      <a href="/memorial/victims" class="text-red-500 hover:text-red-700 mt-4 inline-block">
        ← Volver al memorial
      </a>
    </div>
  </div>
{:else if victim}
  <!-- Header -->
  <section class="bg-gray-900 text-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <a href="/memorial/victims" class="text-gray-400 hover:text-white mb-4 inline-block">
        ← Volver a Los Caídos
      </a>
      <div class="flex items-center gap-4 mb-6">
        <div class="text-4xl">🕯️</div>
        <div>
          <h1 class="text-3xl font-bold">{victim.fullName}</h1>
          {#if victim.age}
            <p class="text-gray-300">{victim.age} años</p>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <section class="bg-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <!-- Info Cards -->
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-semibold text-gray-700 mb-2">📅 Fecha de Fallecimiento</h3>
          <p class="text-lg font-bold text-gray-900">{formatDate(victim.dateOfDeath)}</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-semibold text-gray-700 mb-2">📍 Lugar</h3>
          <p class="text-lg font-bold text-gray-900">{victim.placeOfDeath || 'Desconocido'}</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-semibold text-gray-700 mb-2">🏷️ Categoría</h3>
          <p class="text-lg font-bold text-gray-900 capitalize">
            {victim.category?.replace('_', ' ') || 'Otro'}
          </p>
        </div>
      </div>

      <!-- Biography -->
      {#if victim.biography || victim.biographyEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📖 Quién Fue</h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {victim.biography || victim.biographyEs}
          </p>
        </div>
      {/if}

      <!-- Circumstance -->
      {#if victim.circumstance || victim.circumstanceEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">⚠️ Circunstancias</h2>
          <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-red-500">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {victim.circumstance || victim.circumstanceEs}
            </p>
          </div>
        </div>
      {/if}

      <!-- Dreams/Legacy -->
      {#if victim.dreams || victim.dreamsEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">💭 Sueños y Legado</h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
            {victim.dreams || victim.dreamsEs}
          </p>
        </div>
      {/if}

      <!-- Family Testimony -->
      {#if victim.familyTestimony || victim.familyTestimonyEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">👨‍👩‍👧‍👦 Testimonio Familiar</h2>
          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {victim.familyTestimony || victim.familyTestimonyEs}
            </p>
          </div>
        </div>
      {/if}

      <!-- Confidence Level -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 Fuentes y Verificación</h2>
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">Nivel de Confianza</h3>
            <p class="text-lg font-bold text-gray-900">{getConfidenceBadge(victim.confidenceLevel)}</p>
          </div>

          {#if victim.evidenceSources && victim.evidenceSources.length > 0}
            <h3 class="font-semibold text-gray-700 mb-3">Fuentes de Evidencia</h3>
            <ul class="space-y-2">
              {#each victim.evidenceSources as source (source.url)}
                <li>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 hover:underline block"
                  >
                    📄 {source.title || source.organization}
                  </a>
                  <p class="text-sm text-gray-500 ml-6">{source.type?.replace('_', ' ') || 'Fuente'}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Memorial Message -->
      <div class="bg-gray-900 text-white p-8 rounded-lg text-center mt-12">
        <p class="text-xl italic mb-2">"Te recordamos. Contamos tu historia. No serás olvidado."</p>
        <p class="text-gray-400">La Memoria de Venezuela</p>
      </div>
    </div>
  </section>
{:else}
  <div class="max-w-4xl mx-auto px-4 py-12 text-center">
    <p class="text-gray-600">No se encontró la información de la víctima.</p>
    <a href="/memorial/victims" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">
      ← Volver al memorial
    </a>
  </div>
{/if}
