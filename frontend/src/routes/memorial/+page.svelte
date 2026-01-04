<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { MemorialStatistics } from '$lib/types';

  let stats: MemorialStatistics | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      stats = await api.getMemorialStatistics();
    } catch (e) {
      error = 'Error al cargar las estadísticas';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  }
</script>

<svelte:head>
  <title>Memorial: Nunca Olvidaremos | La Memoria de Venezuela</title>
  <meta name="description" content="Un tributo a las víctimas de la crisis venezolana. Por esto existimos." />
</svelte:head>

<!-- Hero Section - Dark and Solemn -->
<section class="bg-gray-900 text-white py-20">
  <div class="max-w-5xl mx-auto px-4 text-center">
    <div class="text-6xl mb-6">🕯️</div>
    <h1 class="text-4xl sm:text-5xl font-bold mb-4">
      Nunca Olvidaremos
    </h1>
    <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
      Este memorial está dedicado a todos los venezolanos que han sufrido
      bajo el régimen. A los que murieron, a los que fueron encarcelados,
      a los millones que tuvieron que huir.
    </p>
    <p class="text-lg italic text-gray-400">
      "Por esto existimos. Por esto documentamos. Para que nunca se olvide."
    </p>
  </div>
</section>

<!-- Statistics Overview -->
<section class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4">
    {#if loading}
      <div class="text-center py-12">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    {:else if error}
      <p class="text-center text-red-600">{error}</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Victims Card -->
        <a href="/memorial/victims" class="group">
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow border-t-4 border-red-600">
            <div class="text-5xl mb-4">⚰️</div>
            <h2 class="text-2xl font-bold mb-2 group-hover:text-red-600 transition-colors">
              Los Caídos
            </h2>
            <p class="text-4xl font-bold text-red-600 mb-2">
              {stats?.victims.total ? formatNumber(stats.victims.total) : '—'}
            </p>
            <p class="text-gray-600 mb-4">
              Venezolanos que perdieron la vida
            </p>
            <p class="text-sm text-gray-500">
              Protestas, ejecuciones, tortura, hambre, falta de medicina, 
              y más tragédias que pudieron evitarse.
            </p>
            <div class="mt-4 text-red-600 font-medium group-hover:underline">
              Ver memorial →
            </div>
          </div>
        </a>

        <!-- Political Prisoners Card -->
        <a href="/memorial/prisoners" class="group">
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow border-t-4 border-amber-600">
            <div class="text-5xl mb-4">⛓️</div>
            <h2 class="text-2xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
              Presos Políticos
            </h2>
            <p class="text-4xl font-bold text-amber-600 mb-2">
              {stats?.politicalPrisoners.total ? formatNumber(stats.politicalPrisoners.total) : '—'}
            </p>
            <p class="text-gray-600 mb-4">
              Detenidos por sus ideas
            </p>
            {#if stats?.politicalPrisoners.currentlyDetained}
              <p class="text-sm text-gray-500 mb-2">
                <span class="font-semibold text-red-600">{stats.politicalPrisoners.currentlyDetained}</span> actualmente detenidos
              </p>
            {/if}
            {#if stats?.politicalPrisoners.tortured}
              <p class="text-sm text-gray-500">
                <span class="font-semibold text-red-600">{stats.politicalPrisoners.tortured}</span> reportaron tortura
              </p>
            {/if}
            <div class="mt-4 text-amber-600 font-medium group-hover:underline">
              Ver historias →
            </div>
          </div>
        </a>

        <!-- Exiles Card -->
        <a href="/memorial/exiles" class="group">
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <div class="text-5xl mb-4">🌎</div>
            <h2 class="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
              El Éxodo
            </h2>
            <p class="text-4xl font-bold text-blue-600 mb-2">
              {stats?.exiles.officialEstimate ? formatNumber(stats.exiles.officialEstimate) : '7M+'}
            </p>
            <p class="text-gray-600 mb-4">
              Venezolanos que tuvieron que huir
            </p>
            <p class="text-sm text-gray-500 mb-2">
              <span class="font-semibold">{stats?.exiles.totalStories || 0}</span> historias documentadas
            </p>
            {#if stats?.exiles.darienCrossings}
              <p class="text-sm text-gray-500">
                <span class="font-semibold">{stats.exiles.darienCrossings}</span> cruzaron el Darién
              </p>
            {/if}
            <div class="mt-4 text-blue-600 font-medium group-hover:underline">
              Leer testimonios →
            </div>
          </div>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Message Section -->
<section class="py-16 bg-white">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold mb-8">¿Por Qué Este Memorial?</h2>
    
    <div class="prose prose-lg mx-auto text-gray-700">
      <p class="mb-6">
        <strong>La Lista Tascón</strong> persiguió a 3.4 millones de ciudadanos 
        por firmar un referendo revocatorio. Fue una herramienta de persecución 
        contra el pueblo.
      </p>
      
      <p class="mb-6">
        <strong>La Memoria de Venezuela</strong> documenta a los pocos poderosos 
        que robaron a 30 millones de venezolanos. Somos exactamente lo opuesto, 
        moral y técnicamente.
      </p>
      
      <p class="mb-6">
        Este memorial existe para recordar a las víctimas, no para perseguir. 
        Para documentar la verdad, no para difamar. Para que la historia no 
        se repita, no para venganza.
      </p>
      
      <p class="text-xl font-semibold text-primary-800">
        Te recordaremos. Contaremos tu historia. No serás olvidado.
      </p>
    </div>
  </div>
</section>

<!-- Submit Story Section -->
<section class="py-16 bg-gray-100">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-2xl font-bold mb-4">Comparte Tu Historia</h2>
    <p class="text-gray-600 mb-8">
      Si tú o alguien que conoces fue víctima del régimen, su historia merece 
      ser contada. Todas las historias son revisadas y se respeta la privacidad.
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a 
        href="/memorial/submit" 
        class="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        📝 Enviar Historia
      </a>
      <a 
        href="/about" 
        class="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        ℹ️ Cómo Funciona
      </a>
    </div>
  </div>
</section>

<!-- Final Quote -->
<section class="py-12 bg-gray-900 text-white">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <blockquote class="text-xl italic text-gray-300">
      "El que no conoce su historia está condenado a repetirla."
    </blockquote>
    <p class="mt-4 text-gray-500">— George Santayana</p>
  </div>
</section>
