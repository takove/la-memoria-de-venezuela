<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ExileStory } from '$lib/types';

  let exile: ExileStory | null = null;
  let loading = true;
  let error = '';

  async function loadExile() {
    try {
      loading = true;
      error = '';
      const exileId = $page.params.id;
      exile = await api.getExileStory(exileId);
    } catch (e) {
      error = 'Error al cargar la historia de exilio';
      console.error(e);
    } finally {
      loading = false;
    }
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

  onMount(loadExile);
</script>

<svelte:head>
  {#if exile}
    <title>{exile.displayName || exile.fullName || 'Historia de Exilio'} | La Memoria de Venezuela</title>
    <meta name="description" content="Historia de un venezolano en el exilio." />
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
      <a href="/memorial/exiles" class="text-red-500 hover:text-red-700 mt-4 inline-block">
        ← Volver al memorial
      </a>
    </div>
  </div>
{:else if exile}
  <!-- Header -->
  <section class="bg-gray-900 text-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <a href="/memorial/exiles" class="text-gray-400 hover:text-white mb-4 inline-block">
        ← Volver a El Éxodo
      </a>
      <div class="flex items-center gap-4 mb-6">
        <div class="text-4xl">🌎</div>
        <div>
          <h1 class="text-3xl font-bold">
            {exile.displayName || exile.fullName || 'Historia de Exilio'}
          </h1>
          {#if exile.anonymous}
            <p class="text-gray-400 text-sm">Nombre anónimo por seguridad</p>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <section class="bg-white py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Journey Overview -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 class="font-semibold text-blue-900 mb-2">📅 Año de Salida</h3>
          <p class="text-lg font-bold text-blue-900">
            {exile.yearLeft}
            {#if exile.monthLeft}
              <span class="text-sm font-normal text-blue-700 ml-2">({exile.monthLeft}/12)</span>
            {/if}
          </p>
        </div>

        <div class="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 class="font-semibold text-green-900 mb-2">🏁 Destino</h3>
          <p class="text-lg font-bold text-green-900">
            {exile.destination}
          </p>
          {#if exile.destinationCity}
            <p class="text-sm text-green-700 mt-1">{exile.destinationCity}</p>
          {/if}
        </div>
      </div>

      <!-- Why They Left -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">❓ ¿Por Qué Se Fueron?</h2>
        <div class="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
          <p class="text-sm text-gray-600 mb-2 uppercase font-semibold">Razón principal</p>
          <p class="text-lg font-bold text-gray-900 mb-4 capitalize">
            {exile.reason?.replace('_', ' ') || 'Sin especificar'}
          </p>
          {#if exile.reasonDetailEs}
            <p class="text-gray-700 leading-relaxed">{exile.reasonDetailEs}</p>
          {/if}
        </div>
      </div>

      <!-- The Journey -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🗺️ El Viaje</h2>
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-1">Ruta del viaje</p>
            <p class="text-lg font-bold text-gray-900 capitalize">
              {exile.journeyRoute?.replace('_', ' ') || 'No especificada'}
            </p>
          </div>

          {#if exile.journeyDays}
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-1">Duración</p>
              <p class="text-lg font-bold text-gray-900">{exile.journeyDays} días</p>
            </div>
          {/if}

          {#if exile.countriesCrossed && exile.countriesCrossed.length > 0}
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">Países atravesados</p>
              <div class="flex flex-wrap gap-2">
                {#each exile.countriesCrossed as country}
                  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {country}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          {#if exile.journeyDescriptionEs}
            <div class="mt-4 pt-4 border-t border-gray-300">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {exile.journeyDescriptionEs}
              </p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Family & Life Impact -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        {#if exile.familySeparated !== undefined || exile.familySituation}
          <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 class="font-semibold text-purple-900 mb-4">👨‍👩‍👧‍👦 Situación Familiar</h3>
            {#if exile.familySeparated}
              <p class="text-red-600 font-semibold mb-2">Familia separada</p>
            {/if}
            {#if exile.familySituation}
              <p class="text-gray-700">{exile.familySituation}</p>
            {/if}
          </div>
        {/if}

        {#if exile.careerLost}
          <div class="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 class="font-semibold text-orange-900 mb-4">💼 Carrera Profesional</h3>
            <p class="text-red-600 font-semibold mb-2">Carrera perdida</p>
            {#if exile.careerDescription}
              <p class="text-gray-700">{exile.careerDescription}</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Current Status -->
      {#if exile.currentStatus}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📍 Situación Actual</h2>
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p class="text-lg font-bold text-gray-900 capitalize">
              {exile.currentStatus?.replace('_', ' ') || 'No especificada'}
            </p>
          </div>
        </div>
      {/if}

      <!-- Their Story -->
      {#if exile.storyEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📖 Su Historia</h2>
          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <p class="text-lg italic text-gray-700 leading-relaxed">
              {exile.storyEs}
            </p>
          </div>
        </div>
      {/if}

      <!-- Message to Venezuela -->
      {#if exile.messageToVenezuelaEs}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">💬 Mensaje a Venezuela</h2>
          <div class="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {exile.messageToVenezuelaEs}
            </p>
          </div>
        </div>
      {/if}

      <!-- Sources -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 Fuentes</h2>
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">Nivel de Confianza</h3>
            <p class="text-lg font-bold text-gray-900">{getConfidenceBadge(exile.confidenceLevel)}</p>
          </div>

          {#if exile.evidenceSources && exile.evidenceSources.length > 0}
            <h3 class="font-semibold text-gray-700 mb-3">Referencias</h3>
            <ul class="space-y-2">
              {#each exile.evidenceSources as source}
                <li>
                  {#if source.url}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800 hover:underline block"
                    >
                      📄 {source.description || source.title}
                    </a>
                  {:else}
                    <p class="text-gray-700">📄 {source.description || source.title}</p>
                  {/if}
                  {#if source.date}
                    <p class="text-sm text-gray-500 ml-6">{source.date}</p>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Memorial Message -->
      <div class="bg-gray-900 text-white p-8 rounded-lg text-center mt-12">
        <p class="text-xl italic mb-2">"Tu coraje nos da esperanza. No estás solo."</p>
        <p class="text-gray-400">La Memoria de Venezuela</p>
      </div>
    </div>
  </section>
{:else}
  <div class="max-w-4xl mx-auto px-4 py-12 text-center">
    <p class="text-gray-600">No se encontró la historia de exilio.</p>
    <a href="/memorial/exiles" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">
      ← Volver al memorial
    </a>
  </div>
{/if}
