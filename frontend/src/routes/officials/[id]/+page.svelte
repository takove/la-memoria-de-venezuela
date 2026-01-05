<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import type { Official } from '$lib/types';
  import ShareButtons from '$lib/components/ShareButtons.svelte';

  let official: Official | null = null;
  let loading = true;
  let error = '';

  $: officialId = $page.params.id;
  $: currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  $: ogImage = official ? `/api/og/${official.id}` : `/api/og/default`;
  $: metaTitle = official ? `${official.fullName} | La Memoria de Venezuela` : 'Funcionario | La Memoria de Venezuela';
  $: metaDescription = official 
    ? `Información sobre ${official.fullName}${official.positions?.[0] ? ` - ${official.positions[0].titleEs || official.positions[0].title}` : ''}. Sanciones, cargos y casos legales documentados.`
    : 'Perfil de funcionario del régimen venezolano';

  async function loadOfficial() {
    if (!officialId) return;
    
    loading = true;
    error = '';
    try {
      official = await api.getOfficial(officialId);
    } catch (err) {
      error = 'Error al cargar el funcionario';
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

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'deceased': 'Fallecido',
      'exiled': 'Exiliado',
      'imprisoned': 'Encarcelado'
    };
    return labels[status] || status;
  }

  function getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deceased': return 'bg-black text-white';
      case 'exiled': return 'bg-yellow-100 text-yellow-800';
      case 'imprisoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  onMount(() => {
    loadOfficial();
  });
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={metaDescription} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile" />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={currentUrl} />
  <meta name="twitter:title" content={metaTitle} />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">Cargando información...</p>
      </div>
    {:else if error || !official}
      <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p class="text-red-700 text-lg">{error || 'Funcionario no encontrado'}</p>
        <a href="/officials" class="inline-block mt-4 text-red-600 hover:underline">← Volver a la lista</a>
      </div>
    {:else}
      <!-- Back link -->
      <a href="/officials" class="inline-flex items-center text-gray-600 hover:text-red-600 mb-6">
        ← Volver a funcionarios
      </a>

      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Photo placeholder -->
          <div class="flex-shrink-0">
            {#if official.photoUrl}
              <img src={official.photoUrl} alt={official.fullName} class="w-32 h-32 rounded-lg object-cover" />
            {:else}
              <div class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                👤
              </div>
            {/if}
          </div>
          
          <!-- Basic info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold text-gray-900">{official.fullName}</h1>
              <span class="px-3 py-1 text-sm font-medium rounded-full {getStatusClass(official.status)}">
                {getStatusLabel(official.status)}
              </span>
            </div>
            
            {#if official.aliases?.length}
              <p class="text-gray-500 mb-2">
                <span class="font-medium">Alias:</span> {official.aliases.join(', ')}
              </p>
            {/if}
            
            <div class="grid grid-cols-2 gap-4 mt-4 text-sm">
              {#if official.birthDate}
                <div>
                  <span class="text-gray-500">Fecha de nacimiento:</span>
                  <span class="ml-2">{formatDate(official.birthDate)}</span>
                </div>
              {/if}
              {#if official.birthPlace}
                <div>
                  <span class="text-gray-500">Lugar de nacimiento:</span>
                  <span class="ml-2">{official.birthPlace}</span>
                </div>
              {/if}
              {#if official.nationality}
                <div>
                  <span class="text-gray-500">Nacionalidad:</span>
                  <span class="ml-2">{official.nationality}</span>
                </div>
              {/if}
              {#if official.cedula}
                <div>
                  <span class="text-gray-500">Cédula:</span>
                  <span class="ml-2">{official.cedula}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Biography -->
        {#if official.biographyEs || official.biography}
          <div class="mt-6 pt-6 border-t border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Biografía</h2>
            <p class="text-gray-600">{official.biographyEs || official.biography}</p>
          </div>
        {/if}

        <!-- Share Buttons -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <ShareButtons 
            url={currentUrl}
            title={official.fullName}
            description={metaDescription}
          />
        </div>
      </div>

      <!-- Positions -->
      {#if official.positions?.length}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Cargos</h2>
          <div class="space-y-4">
            {#each official.positions as position}
              <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{position.titleEs || position.title}</h3>
                  {#if position.organization}
                    <p class="text-gray-600">{position.organizationEs || position.organization}</p>
                  {/if}
                  <p class="text-sm text-gray-500 mt-1">
                    {formatDate(position.startDate)} - {position.isCurrent ? 'Presente' : formatDate(position.endDate)}
                  </p>
                </div>
                {#if position.isCurrent}
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Actual
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Sanctions -->
      {#if official.sanctions?.length}
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">🚫 Sanciones ({official.sanctions.length})</h2>
          <div class="space-y-4">
            {#each official.sanctions as sanction}
              <div class="p-4 border border-red-100 bg-red-50 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded">
                    {getSanctionTypeLabel(sanction.type)}
                  </span>
                  <span class="text-sm text-gray-600">{sanction.programCode}</span>
                </div>
                <h3 class="font-semibold text-gray-900">{sanction.programName}</h3>
                <p class="text-gray-600 mt-1">{sanction.reasonEs || sanction.reason}</p>
                <p class="text-sm text-gray-500 mt-2">
                  📅 Impuesta: {formatDate(sanction.imposedDate)}
                  {#if sanction.liftedDate}
                    | Levantada: {formatDate(sanction.liftedDate)}
                  {/if}
                </p>
                {#if sanction.sourceUrl}
                  <a href={sanction.sourceUrl} target="_blank" rel="noopener" 
                     class="inline-block mt-2 text-red-600 text-sm hover:underline">
                    Ver fuente →
                  </a>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Cases -->
      {#if official.caseInvolvements?.length}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">⚖️ Casos Legales ({official.caseInvolvements.length})</h2>
          <div class="space-y-4">
            {#each official.caseInvolvements as involvement}
              {#if involvement.case}
                <div class="p-4 border border-purple-100 bg-purple-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 text-xs font-medium bg-purple-200 text-purple-800 rounded">
                      {involvement.role}
                    </span>
                    <span class="text-sm text-gray-600">{involvement.case.caseNumber}</span>
                  </div>
                  <h3 class="font-semibold text-gray-900">{involvement.case.titleEs || involvement.case.title}</h3>
                  {#if involvement.case.court}
                    <p class="text-gray-600 text-sm">{involvement.case.court}</p>
                  {/if}
                  <p class="text-gray-600 mt-2">{involvement.detailsEs || involvement.details}</p>
                  {#if involvement.case.sourceUrl}
                    <a href={involvement.case.sourceUrl} target="_blank" rel="noopener" 
                       class="inline-block mt-2 text-purple-600 text-sm hover:underline">
                      Ver documento →
                    </a>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
