<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { PoliticalPrisoner, PaginatedResponse } from '$lib/types';

  let prisoners: PoliticalPrisoner[] = [];
  let loading = true;
  let error = '';
  let page = 1;
  let totalPages = 1;
  let total = 0;

  // Filters
  let search = '';
  let status = '';
  let facilityType = '';
  let showTortured = false;
  let showCurrentlyDetained = false;

  const statusLabels: Record<string, string> = {
    imprisoned: '🔒 Detenido',
    released: '🕊️ Liberado',
    exiled: '✈️ Exiliado',
    house_arrest: '🏠 Arresto Domiciliario',
    disappeared: '❓ Desaparecido',
    deceased: '✝️ Fallecido',
    unknown: '❔ Desconocido',
  };

  const facilityLabels: Record<string, string> = {
    sebin_helicoide: 'SEBIN - El Helicoide',
    sebin_plaza: 'SEBIN - Plaza Venezuela',
    dgcim: 'DGCIM',
    cicpc: 'CICPC',
    gnb: 'GNB',
    prison: 'Cárcel',
    military_base: 'Base Militar',
    unknown: 'Desconocido',
  };

  async function loadPrisoners() {
    try {
      loading = true;
      error = '';
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (facilityType) params.facilityType = facilityType;
      if (showTortured) params.torture = true;
      if (showCurrentlyDetained) params.currentlyDetained = true;

      const response: PaginatedResponse<PoliticalPrisoner> = await api.getPrisoners(params);
      prisoners = response.data;
      totalPages = response.meta.totalPages;
      total = response.meta.total;
    } catch (e) {
      error = 'Error al cargar los presos políticos';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    page = 1;
    loadPrisoners();
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function calculateDays(dateArrested?: string, dateReleased?: string): string {
    if (!dateArrested) return '';
    const start = new Date(dateArrested);
    const end = dateReleased ? new Date(dateReleased) : new Date();
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} días`;
  }

  onMount(loadPrisoners);
</script>

<svelte:head>
  <title>Presos Políticos | Memorial | La Memoria de Venezuela</title>
  <meta name="description" content="Venezolanos detenidos por sus ideas. Documentamos su lucha." />
</svelte:head>

<!-- Header -->
<section class="bg-gray-900 text-white py-12">
  <div class="max-w-5xl mx-auto px-4 text-center">
    <a href="/memorial" class="text-gray-400 hover:text-white mb-4 inline-block">
      ← Volver al Memorial
    </a>
    <div class="text-5xl mb-4">⛓️</div>
    <h1 class="text-3xl sm:text-4xl font-bold mb-2">Presos Políticos</h1>
    <p class="text-gray-300">
      Venezolanos detenidos por pensar diferente
    </p>
    {#if !loading && total > 0}
      <p class="text-sm text-gray-500 mt-2">{total} casos documentados</p>
    {/if}
  </div>
</section>

<!-- Filters -->
<section class="bg-gray-100 py-6">
  <div class="max-w-6xl mx-auto px-4">
    <form on:submit|preventDefault={handleSearch} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          bind:value={search}
          placeholder="Buscar por nombre..."
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <select 
          bind:value={status}
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los estados</option>
          {#each Object.entries(statusLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
        <select 
          bind:value={facilityType}
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las instalaciones</option>
          {#each Object.entries(facilityLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
        <button
          type="submit"
          class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Buscar
        </button>
      </div>
      <div class="flex flex-wrap gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={showTortured}
            on:change={handleSearch}
            class="rounded text-primary-600"
          />
          <span class="text-sm text-gray-700">⚠️ Solo torturados</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={showCurrentlyDetained}
            on:change={handleSearch}
            class="rounded text-primary-600"
          />
          <span class="text-sm text-gray-700">🔒 Solo detenidos actualmente</span>
        </label>
      </div>
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
          on:click={loadPrisoners}
          class="mt-4 text-primary-600 hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    {:else if prisoners.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">No se encontraron registros.</p>
        <p class="text-gray-500 mt-2">
          Si conoces a alguien que debería estar aquí, 
          <a href="/memorial/submit" class="text-primary-600 hover:underline">envía su historia</a>.
        </p>
      </div>
    {:else}
      <!-- Prisoners Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each prisoners as prisoner}
          <a 
            href="/memorial/prisoners/{prisoner.id}" 
            class="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border-l-4"
            class:border-red-600={prisoner.status === 'imprisoned'}
            class:border-green-600={prisoner.status === 'released'}
            class:border-blue-600={prisoner.status === 'exiled'}
            class:border-gray-400={!['imprisoned', 'released', 'exiled'].includes(prisoner.status)}
          >
            <div class="p-6">
              <div class="flex gap-4">
                {#if prisoner.photoUrl && !prisoner.anonymous}
                  <img 
                    src={prisoner.photoUrl} 
                    alt={prisoner.fullName}
                    class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                {:else}
                  <div class="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                    ⛓️
                  </div>
                {/if}

                <div class="flex-1">
                  <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">
                    {prisoner.anonymous ? 'Preso Político Anónimo' : prisoner.fullName}
                  </h3>

                  {#if prisoner.occupationEs || prisoner.occupation}
                    <p class="text-sm text-gray-500">{prisoner.occupationEs || prisoner.occupation}</p>
                  {/if}

                  <div class="mt-2 flex flex-wrap gap-2">
                    <span class="text-xs px-2 py-1 rounded"
                      class:bg-red-100={prisoner.status === 'imprisoned'}
                      class:text-red-800={prisoner.status === 'imprisoned'}
                      class:bg-green-100={prisoner.status === 'released'}
                      class:text-green-800={prisoner.status === 'released'}
                      class:bg-blue-100={prisoner.status === 'exiled'}
                      class:text-blue-800={prisoner.status === 'exiled'}
                      class:bg-gray-100={!['imprisoned', 'released', 'exiled'].includes(prisoner.status)}
                      class:text-gray-800={!['imprisoned', 'released', 'exiled'].includes(prisoner.status)}
                    >
                      {statusLabels[prisoner.status] || prisoner.status}
                    </span>

                    {#if prisoner.torture}
                      <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        ⚠️ Tortura reportada
                      </span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                {#if prisoner.dateArrested}
                  <div>
                    <span class="text-gray-500">Detenido:</span>
                    <span class="ml-1">{formatDate(prisoner.dateArrested)}</span>
                  </div>
                {/if}
                {#if prisoner.dateReleased}
                  <div>
                    <span class="text-gray-500">Liberado:</span>
                    <span class="ml-1">{formatDate(prisoner.dateReleased)}</span>
                  </div>
                {:else if prisoner.dateArrested && prisoner.status === 'imprisoned'}
                  <div>
                    <span class="text-gray-500">Tiempo detenido:</span>
                    <span class="ml-1 text-red-600 font-semibold">
                      {calculateDays(prisoner.dateArrested)}
                    </span>
                  </div>
                {/if}
              </div>

              {#if prisoner.primaryFacilityType}
                <p class="mt-2 text-sm text-gray-500">
                  📍 {facilityLabels[prisoner.primaryFacilityType] || prisoner.primaryFacilityType}
                </p>
              {/if}

              {#if prisoner.charges && prisoner.charges.length > 0}
                <p class="mt-2 text-sm text-gray-600">
                  <span class="text-gray-500">Cargos:</span>
                  {prisoner.chargesEs?.join(', ') || prisoner.charges.join(', ')}
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
            on:click={() => { page--; loadPrisoners(); }}
            disabled={page === 1}
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Anterior
          </button>
          <span class="px-4 py-2 text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            on:click={() => { page++; loadPrisoners(); }}
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

<!-- Organizations Section -->
<section class="py-12 bg-gray-100">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-xl font-bold mb-6">Organizaciones de Derechos Humanos</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <a 
        href="https://foropenal.com" 
        target="_blank" 
        rel="noopener noreferrer"
        class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold">Foro Penal</h3>
        <p class="text-sm text-gray-600">Documentación y asistencia legal</p>
      </a>
      <a 
        href="https://provea.org" 
        target="_blank" 
        rel="noopener noreferrer"
        class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold">PROVEA</h3>
        <p class="text-sm text-gray-600">Programa Venezolano de Derechos Humanos</p>
      </a>
      <a 
        href="https://www.hrw.org/americas/venezuela" 
        target="_blank" 
        rel="noopener noreferrer"
        class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold">Human Rights Watch</h3>
        <p class="text-sm text-gray-600">Monitoreo internacional</p>
      </a>
    </div>
  </div>
</section>
