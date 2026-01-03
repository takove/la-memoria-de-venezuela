<script lang="ts">
  import { page } from '$app/stores';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import OfficialCard from '$lib/components/OfficialCard.svelte';

  $: query = $page.url.searchParams.get('q') || '';
  
  let results = {
    officials: [],
    sanctions: [],
    cases: [],
    totalResults: 0
  };
  let isLoading = false;
</script>

<svelte:head>
  <title>Buscar: {query} | La Memoria de Venezuela</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Search Bar -->
  <div class="max-w-2xl mx-auto mb-12">
    <SearchBar />
  </div>

  {#if query}
    <h1 class="text-2xl font-bold text-gray-900 mb-8">
      Resultados para: "{query}"
      {#if results.totalResults > 0}
        <span class="text-gray-500 font-normal">({results.totalResults} encontrados)</span>
      {/if}
    </h1>

    {#if isLoading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-r-transparent"></div>
        <p class="mt-4 text-gray-600">Buscando...</p>
      </div>
    {:else if results.totalResults === 0}
      <div class="card p-12 text-center">
        <p class="text-gray-500 text-lg mb-4">
          No se encontraron resultados para "{query}"
        </p>
        <p class="text-gray-400 text-sm">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    {:else}
      <!-- Officials Results -->
      {#if results.officials.length > 0}
        <section class="mb-12">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Funcionarios ({results.officials.length})
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each results.officials as official}
              <OfficialCard {official} />
            {/each}
          </div>
        </section>
      {/if}

      <!-- Sanctions Results -->
      {#if results.sanctions.length > 0}
        <section class="mb-12">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Sanciones ({results.sanctions.length})
          </h2>
          <div class="grid gap-4">
            {#each results.sanctions as sanction}
              <div class="card p-4">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-medium text-gray-900">
                      {sanction.official?.fullName || 'Desconocido'}
                    </h3>
                    <p class="text-sm text-gray-600">{sanction.programName}</p>
                    <p class="text-sm text-gray-500">{sanction.reason}</p>
                  </div>
                  <span class="badge-danger">
                    {sanction.type.toUpperCase()}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Cases Results -->
      {#if results.cases.length > 0}
        <section class="mb-12">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Casos Legales ({results.cases.length})
          </h2>
          <div class="grid gap-4">
            {#each results.cases as caseItem}
              <a href="/cases/{caseItem.id}" class="card p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-medium text-gray-900">{caseItem.title}</h3>
                    <p class="text-sm text-gray-600">{caseItem.caseNumber}</p>
                    <p class="text-sm text-gray-500">{caseItem.court}</p>
                  </div>
                  <span class="badge-info">
                    {caseItem.jurisdiction.toUpperCase()}
                  </span>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg">
        Ingresa un término de búsqueda para comenzar
      </p>
    </div>
  {/if}
</div>
