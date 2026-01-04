<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Victim, PaginatedResponse } from '$lib/types';

  let victims: Victim[] = [];
  let loading = true;
  let error = '';
  let page = 1;
  let totalPages = 1;
  let total = 0;

  // Filters
  let search = '';
  let category = '';
  let yearFrom = '';
  let yearTo = '';

  const categoryLabels: Record<string, string> = {
    protest: '✊ Protesta',
    political_execution: '🔫 Ejecución Política',
    torture: '⛓️ Tortura',
    detention: '🔒 Detención',
    healthcare: '🏥 Falta de Medicina',
    hunger: '🍞 Hambre',
    violence: '💀 Violencia',
    blackout: '💡 Apagón',
    exodus: '🚶 Éxodo',
    other: '📋 Otro',
  };

  async function loadVictims() {
    try {
      loading = true;
      error = '';
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (yearFrom) params.yearFrom = parseInt(yearFrom);
      if (yearTo) params.yearTo = parseInt(yearTo);

      const response: PaginatedResponse<Victim> = await api.getVictims(params);
      victims = response.data;
      totalPages = response.meta.totalPages;
      total = response.meta.total;
    } catch (e) {
      error = 'Error al cargar las víctimas';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    page = 1;
    loadVictims();
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'Fecha desconocida';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  onMount(loadVictims);
</script>

<svelte:head>
  <title>Los Caídos | Memorial | La Memoria de Venezuela</title>
  <meta name="description" content="Memorial de venezolanos que perdieron la vida durante la crisis. Nunca olvidaremos." />
</svelte:head>

<!-- Header -->
<section class="bg-gray-900 text-white py-12">
  <div class="max-w-5xl mx-auto px-4 text-center">
    <a href="/memorial" class="text-gray-400 hover:text-white mb-4 inline-block">
      ← Volver al Memorial
    </a>
    <div class="text-5xl mb-4">⚰️</div>
    <h1 class="text-3xl sm:text-4xl font-bold mb-2">Los Caídos</h1>
    <p class="text-gray-300">
      En memoria de los venezolanos que perdieron la vida
    </p>
    {#if !loading && total > 0}
      <p class="text-sm text-gray-500 mt-2">{total} vidas documentadas</p>
    {/if}
  </div>
</section>

<!-- Filters -->
<section class="bg-gray-100 py-6">
  <div class="max-w-6xl mx-auto px-4">
    <form on:submit|preventDefault={handleSearch} class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <input
        type="text"
        bind:value={search}
        placeholder="Buscar por nombre..."
        class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      <select 
        bind:value={category}
        class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Todas las categorías</option>
        {#each Object.entries(categoryLabels) as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
      <input
        type="number"
        bind:value={yearFrom}
        placeholder="Año desde"
        min="1999"
        max="2026"
        class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      />
      <input
        type="number"
        bind:value={yearTo}
        placeholder="Año hasta"
        min="1999"
        max="2026"
        class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="submit"
        class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Buscar
      </button>
    </form>
  </div>
</section>

<!-- Content -->
<section class="py-12 bg-white">
  <div class="max-w-6xl mx-auto px-4">
    {#if loading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando...</p>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <p class="text-red-600">{error}</p>
        <button 
          on:click={loadVictims}
          class="mt-4 text-primary-600 hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    {:else if victims.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">No se encontraron registros.</p>
        <p class="text-gray-500 mt-2">
          Si conoces a alguien que debería estar aquí, 
          <a href="/memorial/submit" class="text-primary-600 hover:underline">envía su historia</a>.
        </p>
      </div>
    {:else}
      <!-- Memorial Wall Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each victims as victim}
          <a 
            href="/memorial/victims/{victim.id}" 
            class="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="p-6">
              {#if victim.photoUrl && !victim.anonymous}
                <img 
                  src={victim.photoUrl} 
                  alt={victim.fullName}
                  class="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                />
              {:else}
                <div class="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-3xl">
                  🕯️
                </div>
              {/if}

              <h3 class="text-lg font-semibold text-center group-hover:text-primary-600 transition-colors">
                {victim.anonymous ? 'Víctima Anónima' : victim.fullName}
              </h3>

              {#if victim.age}
                <p class="text-center text-gray-500 text-sm">{victim.age} años</p>
              {/if}

              <div class="mt-3 flex items-center justify-center gap-2">
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {categoryLabels[victim.category] || victim.category}
                </span>
              </div>

              <p class="mt-3 text-sm text-gray-600 text-center">
                {formatDate(victim.dateOfDeath)}
              </p>

              {#if victim.placeOfDeathEs || victim.placeOfDeath}
                <p class="text-xs text-gray-500 text-center mt-1">
                  📍 {victim.placeOfDeathEs || victim.placeOfDeath}
                </p>
              {/if}

              {#if victim.biographyEs || victim.biography}
                <p class="mt-4 text-sm text-gray-600 line-clamp-3">
                  {victim.biographyEs || victim.biography}
                </p>
              {/if}
            </div>
          </a>
        {/each}
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="mt-12 flex justify-center gap-2">
          <button
            on:click={() => { page--; loadVictims(); }}
            disabled={page === 1}
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Anterior
          </button>
          <span class="px-4 py-2 text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            on:click={() => { page++; loadVictims(); }}
            disabled={page === totalPages}
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Siguiente →
          </button>
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Light a Candle Section -->
<section class="py-12 bg-gray-900 text-white">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <div class="text-4xl mb-4">🕯️</div>
    <p class="text-lg text-gray-300 italic">
      "Cada nombre aquí representa una vida, una familia, sueños que fueron truncados."
    </p>
    <p class="mt-4 text-gray-400">
      Te recordamos. Contamos tu historia. No serás olvidado.
    </p>
  </div>
</section>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
