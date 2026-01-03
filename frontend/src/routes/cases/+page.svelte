<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { Case } from '$lib/types';

  let cases: Case[] = [];
  let loading = true;
  let error = '';
  let searchQuery = '';
  let selectedType = '';
  let selectedJurisdiction = '';

  const caseTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'indictment', label: 'Acusación Federal' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'civil', label: 'Civil' },
    { value: 'iachr', label: 'CIDH' },
    { value: 'icc', label: 'CPI' },
    { value: 'other', label: 'Otro' }
  ];

  const jurisdictions = [
    { value: '', label: 'Todas las jurisdicciones' },
    { value: 'usa', label: 'Estados Unidos' },
    { value: 'venezuela', label: 'Venezuela' },
    { value: 'spain', label: 'España' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'iachr', label: 'CIDH' },
    { value: 'icc', label: 'Corte Penal Internacional' },
    { value: 'other', label: 'Otra' }
  ];

  async function loadCases() {
    loading = true;
    error = '';
    try {
      const params: Record<string, string> = {};
      if (selectedType) params.type = selectedType;
      if (selectedJurisdiction) params.jurisdiction = selectedJurisdiction;
      
      const response = await api.getCases(params);
      cases = response.data;
    } catch (err) {
      error = 'Error al cargar los casos';
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

  function getCaseTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'indictment': 'Acusación Federal',
      'criminal': 'Criminal',
      'civil': 'Civil',
      'iachr': 'CIDH',
      'icc': 'CPI',
      'other': 'Otro'
    };
    return labels[type] || type;
  }

  function getJurisdictionLabel(jurisdiction: string): string {
    const labels: Record<string, string> = {
      'usa': '🇺🇸 Estados Unidos',
      'venezuela': '🇻🇪 Venezuela',
      'spain': '🇪🇸 España',
      'colombia': '🇨🇴 Colombia',
      'iachr': '🌎 CIDH',
      'icc': '⚖️ CPI',
      'other': 'Otra'
    };
    return labels[jurisdiction] || jurisdiction;
  }

  function getCaseStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-gray-100 text-gray-600';
      case 'conviction': return 'bg-red-100 text-red-800';
      case 'acquittal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getCaseStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Abierto',
      'closed': 'Cerrado',
      'pending': 'Pendiente',
      'dismissed': 'Desestimado',
      'conviction': 'Condena',
      'acquittal': 'Absolución'
    };
    return labels[status] || status;
  }

  onMount(() => {
    loadCases();
  });

  $: filteredCases = cases.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(query) ||
      c.titleEs?.toLowerCase().includes(query) ||
      c.caseNumber?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.descriptionEs?.toLowerCase().includes(query)
    );
  });
</script>

<svelte:head>
  <title>Casos Legales | La Memoria de Venezuela</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Casos Legales</h1>
      <p class="mt-2 text-gray-600">
        Acusaciones federales, casos criminales y procesos ante organismos internacionales contra funcionarios del régimen
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Buscar por título, número de caso..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            bind:value={selectedType}
            on:change={loadCases}
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {#each caseTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <select
            bind:value={selectedJurisdiction}
            on:change={loadCases}
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {#each jurisdictions as j}
              <option value={j.value}>{j.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">Cargando casos...</p>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    {:else if filteredCases.length === 0}
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <p class="text-gray-500">No se encontraron casos legales</p>
        <p class="text-sm text-gray-400 mt-2">Los datos se cargarán después de poblar la base de datos</p>
      </div>
    {:else}
      <div class="space-y-6">
        {#each filteredCases as caseItem}
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col gap-4">
              <!-- Header -->
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {getCaseTypeLabel(caseItem.type)}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {getJurisdictionLabel(caseItem.jurisdiction)}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full {getCaseStatusClass(caseItem.status)}">
                  {getCaseStatusLabel(caseItem.status)}
                </span>
              </div>
              
              <!-- Title -->
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {caseItem.titleEs || caseItem.title}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  Caso No. {caseItem.caseNumber}
                </p>
                {#if caseItem.court}
                  <p class="text-sm text-gray-500">
                    {caseItem.court}
                  </p>
                {/if}
              </div>
              
              <!-- Description -->
              <p class="text-gray-600">
                {caseItem.descriptionEs || caseItem.description || 'Sin descripción disponible'}
              </p>
              
              <!-- Charges -->
              {#if caseItem.chargesEs?.length || caseItem.charges?.length}
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Cargos:</h4>
                  <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {#each (caseItem.chargesEs || caseItem.charges || []) as charge}
                      <li>{charge}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
              
              <!-- Involved Officials -->
              {#if caseItem.involvements?.length}
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Funcionarios involucrados:</h4>
                  <div class="flex flex-wrap gap-2">
                    {#each caseItem.involvements as involvement}
                      <a 
                        href="/officials/{involvement.official?.id}"
                        class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {involvement.official?.fullName || 'Desconocido'}
                        <span class="ml-1 text-xs text-gray-500">({involvement.role})</span>
                      </a>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <!-- Footer -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  {#if caseItem.filingDate}
                    <span>📅 Presentado: {formatDate(caseItem.filingDate)}</span>
                  {/if}
                  {#if caseItem.resolutionDate}
                    <span>⚖️ Resolución: {formatDate(caseItem.resolutionDate)}</span>
                  {/if}
                </div>
                
                {#if caseItem.sourceUrl}
                  <a 
                    href={caseItem.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Ver documento →
                  </a>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
