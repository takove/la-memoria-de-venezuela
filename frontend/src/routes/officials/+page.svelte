<script lang="ts">
  import { onMount } from 'svelte';
  import OfficialCard from '$lib/components/OfficialCard.svelte';
  import { api } from '$lib/api';

  let officials: any[] = [];
  let isLoading = true;
  let currentPage = 1;
  let totalPages = 1;
  let searchQuery = '';
  let statusFilter = '';

  // Status options for filtering
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'exiled', label: 'Exiliado' },
    { value: 'imprisoned', label: 'Encarcelado' },
    { value: 'deceased', label: 'Fallecido' },
  ];

  async function loadOfficials() {
    isLoading = true;
    try {
      const params: Record<string, any> = { page: currentPage };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.getOfficials(params);
      officials = response.data || [];
      totalPages = response.meta?.totalPages || 1;
    } catch (err) {
      console.error('Error loading officials:', err);
      officials = [];
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    currentPage = 1;
    loadOfficials();
  }

  onMount(() => {
    loadOfficials();
  });
</script>

<svelte:head>
  <title>Funcionarios | La Memoria de Venezuela</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Funcionarios del Régimen</h1>
    <p class="text-gray-600">
      Base de datos de funcionarios del régimen chavista-madurista documentados en fuentes oficiales
    </p>
  </div>

  <!-- Filters -->
  <div class="card p-4 mb-8">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Buscar por nombre..."
          class="input w-full"
        />
      </div>
      <select bind:value={statusFilter} on:change={handleSearch} class="input w-full sm:w-48">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <button class="btn-primary" on:click={handleSearch}>
        Buscar
      </button>
    </div>
  </div>

  <!-- Results -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-r-transparent"></div>
      <p class="mt-4 text-gray-600">Cargando funcionarios...</p>
    </div>
  {:else if officials.length === 0}
    <div class="card p-12 text-center">
      <p class="text-gray-500 text-lg mb-4">
        No se encontraron funcionarios.
      </p>
      <p class="text-gray-400 text-sm">
        Configura la base de datos e ingresa los datos para ver resultados.
      </p>
    </div>
  {:else}
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {#each officials as official}
        <OfficialCard {official} />
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex justify-center gap-2">
        <button
          class="btn-secondary"
          disabled={currentPage === 1}
          on:click={() => currentPage--}
        >
          Anterior
        </button>
        <span class="px-4 py-2 text-gray-600">
          Página {currentPage} de {totalPages}
        </span>
        <button
          class="btn-secondary"
          disabled={currentPage === totalPages}
          on:click={() => currentPage++}
        >
          Siguiente
        </button>
      </div>
    {/if}
  {/if}
</div>
