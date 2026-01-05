<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import OfficialCard from '$lib/components/OfficialCard.svelte';

  // Sample data - will be replaced with API calls
  const stats = [
    { label: 'Funcionarios', value: '150+', icon: 'users' },
    { label: 'Sancionados OFAC', value: '131', icon: 'ban' },
    { label: 'Casos Legales', value: '25+', icon: 'gavel' },
    { label: 'Años Documentados', value: '26', icon: 'calendar' },
  ];

  const featuredOfficials: any[] = [];
</script>

<svelte:head>
  <title>La Memoria de Venezuela | Accountability Database</title>
  <meta name="description" content="Base de datos pública de funcionarios del régimen venezolano bajo sanciones internacionales y procesos legales" />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-venezuela-blue via-primary-900 to-gray-900 text-white">
  <div class="absolute inset-0 bg-black/20"></div>
  <div class="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
        La Memoria de Venezuela
      </h1>
      <p class="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed">
        La base de datos más completa de funcionarios del régimen chavista-madurista
        bajo sanciones internacionales y procesos legales (1999-2026)
      </p>
      
      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto">
        <SearchBar />
      </div>
      
      <p class="mt-4 text-sm text-gray-300">
        Busca por nombre, cargo, o tipo de sanción
      </p>
    </div>
  </div>
  
  <!-- Wave decoration -->
  <div class="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" class="w-full h-12 sm:h-16 lg:h-24">
      <path fill="#f9fafb" d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
    </svg>
  </div>
</section>

<!-- Stats Section -->
<section class="py-12 sm:py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {#each stats as stat}
        <StatCard {...stat} />
      {/each}
    </div>
  </div>
</section>

<!-- Data Sources -->
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Fuentes de Datos</h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card p-6 text-center hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🇺🇸</span>
        </div>
        <h3 class="font-semibold mb-2">OFAC - Treasury</h3>
        <p class="text-sm text-gray-600">Sanciones del Departamento del Tesoro de Estados Unidos</p>
      </div>
      
      <div class="card p-6 text-center hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">⚖️</span>
        </div>
        <h3 class="font-semibold mb-2">DOJ - Indictments</h3>
        <p class="text-sm text-gray-600">Acusaciones federales del Departamento de Justicia</p>
      </div>
      
      <div class="card p-6 text-center hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🌎</span>
        </div>
        <h3 class="font-semibold mb-2">CIDH - OEA</h3>
        <p class="text-sm text-gray-600">Comisión Interamericana de Derechos Humanos</p>
      </div>
      
      <div class="card p-6 text-center hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🔍</span>
        </div>
        <h3 class="font-semibold mb-2">DEA</h3>
        <p class="text-sm text-gray-600">Drug Enforcement Administration - Narcotráfico</p>
      </div>
    </div>
  </div>
</section>

<!-- Featured Officials -->
<section class="py-12 sm:py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
      <h2 class="text-2xl sm:text-3xl font-bold">Funcionarios Destacados</h2>
      <a href="/officials" class="text-primary-600 hover:text-primary-700 font-medium min-h-[44px] flex items-center">
        Ver todos →
      </a>
    </div>
    
    {#if featuredOfficials.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {#each featuredOfficials as official}
          <OfficialCard {official} />
        {/each}
      </div>
    {:else}
      <div class="card p-8 sm:p-12 text-center">
        <p class="text-gray-500 mb-4">Los datos se cargarán después de configurar la base de datos</p>
        <a href="/officials" class="btn-primary">Explorar funcionarios</a>
      </div>
    {/if}
  </div>
</section>

<!-- Call to Action -->
<section class="py-12 sm:py-16 bg-primary-900 text-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-2xl sm:text-3xl font-bold mb-4">Transparencia y Justicia</h2>
    <p class="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8">
      Esta plataforma documenta información pública sobre funcionarios del régimen venezolano.
      Toda la información proviene de fuentes oficiales y públicas.
    </p>
    <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
      <a href="/about" class="btn bg-white text-primary-900 hover:bg-gray-100">
        Conocer más
      </a>
      <a href="/officials" class="btn border-2 border-white hover:bg-white/10">
        Explorar base de datos
      </a>
    </div>
  </div>
</section>
