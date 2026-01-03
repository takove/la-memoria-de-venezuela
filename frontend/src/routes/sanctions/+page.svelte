<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Sanction } from '$lib/types';

  let sanctions: Sanction[] = [];
  let loading = true;
  let error = '';
  let searchQuery = '';
  let selectedType = '';

  const sanctionTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'ofac_sdn', label: 'OFAC SDN' },
    { value: 'eu', label: 'Unión Europea' },
    { value: 'canada', label: 'Canadá' },
    { value: 'uk', label: 'Reino Unido' },
    { value: 'other', label: 'Otros' }
  ];

  async function loadSanctions() {
    loading = true;
    error = '';
    try {
      const params: Record<string, string> = {};
      if (selectedType) params.type = selectedType;
      
      const response = await api.getSanctions(params);
      sanctions = response.data;
    } catch (err) {
      error = 'Error al cargar las sanciones';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getSanctionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'ofac_sdn': 'OFAC SDN',
      'ofac_ns_plc': 'OFAC NS-PLC',
      'eu': 'Unión Europea',
      'canada': 'Canadá',
      'uk': 'Reino Unido',
      'other': 'Otro'
    };
    return labels[type] || type;
  }

  function getSanctionStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'lifted': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getSanctionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Activa',
      'lifted': 'Levantada',
      'modified': 'Modificada'
    };
    return labels[status] || status;
  }

  onMount(() => {
    loadSanctions();
  });

  $: filteredSanctions = sanctions.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.programName?.toLowerCase().includes(query) ||
      s.reason?.toLowerCase().includes(query) ||
      s.reasonEs?.toLowerCase().includes(query) ||
      s.official?.fullName?.toLowerCase().includes(query)
    );
  });
</script>

<svelte:head>
  <title>Sanciones | La Memoria de Venezuela</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Sanciones Internacionales</h1>
      <p class="mt-2 text-gray-600">
        Base de datos de sanciones impuestas a funcionarios del régimen venezolano por gobiernos y organismos internacionales
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Buscar por programa, razón o funcionario..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            bind:value={selectedType}
            on:change={loadSanctions}
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {#each sanctionTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">Cargando sanciones...</p>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    {:else if filteredSanctions.length === 0}
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <p class="text-gray-500">No se encontraron sanciones</p>
        <p class="text-sm text-gray-400 mt-2">Los datos se cargarán después de poblar la base de datos</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredSanctions as sanction}
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {getSanctionTypeLabel(sanction.type)}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full {getSanctionStatusClass(sanction.status)}">
                    {getSanctionStatusLabel(sanction.status)}
                  </span>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900">
                  {sanction.programName}
                </h3>
                
                {#if sanction.official}
                  <p class="text-sm text-gray-600 mt-1">
                    <span class="font-medium">Funcionario:</span> 
                    <a href="/officials/{sanction.official.id}" class="text-red-600 hover:underline">
                      {sanction.official.fullName}
                    </a>
                  </p>
                {/if}
                
                <p class="text-gray-600 mt-2">
                  {sanction.reasonEs || sanction.reason || 'Sin descripción'}
                </p>
                
                <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span>📅 Impuesta: {formatDate(sanction.imposedDate)}</span>
                  {#if sanction.liftedDate}
                    <span>✅ Levantada: {formatDate(sanction.liftedDate)}</span>
                  {/if}
                  <span>🏷️ Código: {sanction.programCode}</span>
                </div>
              </div>
              
              {#if sanction.sourceUrl}
                <a 
                  href={sanction.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Ver fuente →
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
