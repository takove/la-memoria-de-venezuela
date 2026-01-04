<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ExileStory, PaginatedResponse } from '$lib/types';

  let stories: ExileStory[] = [];
  let loading = true;
  let error = '';
  let page = 1;
  let totalPages = 1;
  let total = 0;

  // Filters
  let search = '';
  let reason = '';
  let journeyRoute = '';
  let destination = '';
  let yearFrom = '';
  let yearTo = '';

  const reasonLabels: Record<string, string> = {
    political_persecution: '✊ Persecución Política',
    economic: '💰 Crisis Económica',
    healthcare: '🏥 Falta de Medicina',
    violence: '💀 Violencia',
    family_reunification: '👨‍👩‍👧 Reunificación Familiar',
    professional: '💼 Oportunidades Profesionales',
    mixed: '🔄 Múltiples Razones',
  };

  const routeLabels: Record<string, string> = {
    legal: '✈️ Legal (Visa/Pasaporte)',
    darien_gap: '🌳 Selva del Darién',
    border_crossing: '🚶 Cruce de Frontera',
    maritime: '🚢 Marítimo',
    mixed: '🔄 Ruta Mixta',
  };

  const topDestinations = [
    'Colombia', 'Perú', 'Chile', 'Ecuador', 'España', 
    'Estados Unidos', 'Argentina', 'Brasil', 'México', 'Panamá'
  ];

  async function loadStories() {
    try {
      loading = true;
      error = '';
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (reason) params.reason = reason;
      if (journeyRoute) params.journeyRoute = journeyRoute;
      if (destination) params.destination = destination;
      if (yearFrom) params.yearFrom = parseInt(yearFrom);
      if (yearTo) params.yearTo = parseInt(yearTo);

      const response: PaginatedResponse<ExileStory> = await api.getExileStories(params);
      stories = response.data;
      totalPages = response.meta.totalPages;
      total = response.meta.total;
    } catch (e) {
      error = 'Error al cargar las historias';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    page = 1;
    loadStories();
  }

  onMount(loadStories);
</script>

<svelte:head>
  <title>El Éxodo | Memorial | La Memoria de Venezuela</title>
  <meta name="description" content="Historias de los 7+ millones de venezolanos que tuvieron que huir. Sus testimonios, sus viajes, sus sueños." />
</svelte:head>

<!-- Header -->
<section class="bg-gray-900 text-white py-12">
  <div class="max-w-5xl mx-auto px-4 text-center">
    <a href="/memorial" class="text-gray-400 hover:text-white mb-4 inline-block">
      ← Volver al Memorial
    </a>
    <div class="text-5xl mb-4">🌎</div>
    <h1 class="text-3xl sm:text-4xl font-bold mb-2">El Éxodo</h1>
    <p class="text-gray-300">
      Historias de los 7+ millones de venezolanos que tuvieron que huir
    </p>
    {#if !loading && total > 0}
      <p class="text-sm text-gray-500 mt-2">{total} historias documentadas</p>
    {/if}
  </div>
</section>

<!-- Statistics Banner -->
<section class="bg-blue-900 text-white py-8">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div>
        <p class="text-3xl font-bold">7M+</p>
        <p class="text-blue-200 text-sm">Venezolanos en el exterior</p>
      </div>
      <div>
        <p class="text-3xl font-bold">25%</p>
        <p class="text-blue-200 text-sm">De la población emigró</p>
      </div>
      <div>
        <p class="text-3xl font-bold">17+</p>
        <p class="text-blue-200 text-sm">Países de destino principales</p>
      </div>
      <div>
        <p class="text-3xl font-bold">500K+</p>
        <p class="text-blue-200 text-sm">Cruzaron el Darién</p>
      </div>
    </div>
  </div>
</section>

<!-- Filters -->
<section class="bg-gray-100 py-6">
  <div class="max-w-6xl mx-auto px-4">
    <form on:submit|preventDefault={handleSearch} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <input
          type="text"
          bind:value={search}
          placeholder="Buscar historias..."
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <select 
          bind:value={reason}
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las razones</option>
          {#each Object.entries(reasonLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
        <select 
          bind:value={journeyRoute}
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las rutas</option>
          {#each Object.entries(routeLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
        <select 
          bind:value={destination}
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los destinos</option>
          {#each topDestinations as dest}
            <option value={dest}>{dest}</option>
          {/each}
        </select>
        <input
          type="number"
          bind:value={yearFrom}
          placeholder="Año desde"
          min="2000"
          max="2026"
          class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Buscar
        </button>
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
          on:click={loadStories}
          class="mt-4 text-primary-600 hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    {:else if stories.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">No se encontraron historias.</p>
        <p class="text-gray-500 mt-2">
          ¿Eres parte del éxodo? 
          <a href="/memorial/submit" class="text-primary-600 hover:underline">Comparte tu historia</a>.
        </p>
      </div>
    {:else}
      <!-- Stories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each stories as story}
          <a 
            href="/memorial/exiles/{story.id}" 
            class="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-start gap-4">
                {#if story.photoUrl && !story.anonymous}
                  <img 
                    src={story.photoUrl} 
                    alt={story.displayName || 'Emigrante'}
                    class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                {:else}
                  <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                    🌎
                  </div>
                {/if}

                <div class="flex-1">
                  <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">
                    {story.anonymous ? 'Venezolano(a) Anónimo(a)' : (story.displayName || story.fullName)}
                  </h3>

                  <div class="flex flex-wrap gap-2 mt-1">
                    {#if story.cityOfOrigin || story.stateOfOrigin}
                      <span class="text-sm text-gray-500">
                        📍 {[story.cityOfOrigin, story.stateOfOrigin].filter(Boolean).join(', ')}
                      </span>
                    {/if}
                    {#if story.yearLeft}
                      <span class="text-sm text-gray-500">→ {story.yearLeft}</span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                {#if story.destination}
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    🎯 {story.destination}
                  </span>
                {/if}
                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {reasonLabels[story.reason] || story.reason}
                </span>
                {#if story.journeyRoute}
                  <span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {routeLabels[story.journeyRoute] || story.journeyRoute}
                  </span>
                {/if}
              </div>

              {#if story.journeyRoute === 'darien_gap'}
                <div class="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                  ⚠️ Cruzó la Selva del Darién
                  {#if story.journeyDays}
                    - {story.journeyDays} días de travesía
                  {/if}
                </div>
              {/if}

              {#if story.familySeparated}
                <div class="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
                  👨‍👩‍👧 Familia separada por la migración
                </div>
              {/if}

              {#if story.storyEs || story.story}
                <p class="mt-4 text-sm text-gray-600 line-clamp-3 italic">
                  "{story.storyEs || story.story}"
                </p>
              {/if}

              {#if story.messageToVenezuelaEs || story.messageToVenezuela}
                <p class="mt-3 text-sm text-primary-700 font-medium">
                  💬 "{story.messageToVenezuelaEs || story.messageToVenezuela}"
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
            on:click={() => { page--; loadStories(); }}
            disabled={page === 1}
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Anterior
          </button>
          <span class="px-4 py-2 text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            on:click={() => { page++; loadStories(); }}
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

<!-- Share Your Story Section -->
<section class="py-12 bg-blue-50">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-2xl font-bold mb-4">¿Eres Parte del Éxodo?</h2>
    <p class="text-gray-600 mb-6">
      Tu historia merece ser contada. Cada testimonio ayuda a documentar
      lo que pasó y por qué tantos venezolanos tuvieron que irse.
    </p>
    <a 
      href="/memorial/submit" 
      class="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
    >
      📝 Compartir Mi Historia
    </a>
    <p class="mt-4 text-sm text-gray-500">
      Puedes elegir permanecer anónimo(a). Todas las historias son revisadas antes de publicarse.
    </p>
  </div>
</section>

<!-- Quote -->
<section class="py-12 bg-gray-900 text-white">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <blockquote class="text-xl italic text-gray-300">
      "No nos fuimos por gusto. Nos fuimos porque no había otra opción."
    </blockquote>
    <p class="mt-4 text-gray-500">— Testimonio de emigrante venezolano</p>
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
