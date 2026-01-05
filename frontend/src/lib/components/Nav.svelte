<script lang="ts">
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';

  let isDrawerOpen = false;

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/memorial', label: '🕯️ Memorial' },
    { href: '/officials', label: 'Funcionarios' },
    { href: '/sanctions', label: 'Sanciones' },
    { href: '/cases', label: 'Casos' },
    { href: '/about', label: 'Acerca de' },
  ];

  // Close drawer on route change
  afterNavigate(() => {
    isDrawerOpen = false;
  });

  function toggleDrawer() {
    isDrawerOpen = !isDrawerOpen;
  }

  function closeDrawer() {
    isDrawerOpen = false;
  }
</script>

<nav class="bg-white shadow-sm sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo - Touch-friendly target -->
      <a 
        href="/" 
        class="flex items-center gap-2 font-bold text-xl text-primary-900 min-h-[44px] min-w-[44px]"
        aria-label="La Memoria de Venezuela - Inicio"
      >
        <span class="text-2xl">🇻🇪</span>
        <span class="hidden sm:inline">La Memoria</span>
      </a>

      <!-- Desktop Navigation (>=768px) -->
      <div class="hidden md:flex items-center gap-8">
        {#each navLinks as link}
          <a 
            href={link.href}
            class="text-gray-600 hover:text-primary-600 font-medium transition-colors min-h-[44px] flex items-center px-2"
            class:text-primary-600={$page.url.pathname === link.href}
            class:font-semibold={$page.url.pathname === link.href}
          >
            {link.label}
          </a>
        {/each}
      </div>

      <!-- Search Icon (Desktop) - Touch-friendly -->
      <div class="hidden md:block">
        <a 
          href="/search"
          class="p-3 text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
          aria-label="Buscar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </a>
      </div>

      <!-- Mobile Hamburger Menu Button (<768px) - Touch-friendly -->
      <button
        class="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
        on:click={toggleDrawer}
        aria-label={isDrawerOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isDrawerOpen}
      >
        {#if isDrawerOpen}
          <!-- Close icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <!-- Hamburger icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Drawer (<768px) -->
  {#if isDrawerOpen}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      on:click={closeDrawer}
      on:keydown={(e) => e.key === 'Escape' && closeDrawer()}
      role="button"
      tabindex="0"
      aria-label="Cerrar menú"
    ></div>
    
    <!-- Drawer -->
    <div class="fixed top-16 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto">
      <div class="px-4 py-8 space-y-2">
        {#each navLinks as link}
          <a 
            href={link.href}
            class="block py-3 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors min-h-[48px] flex items-center text-base"
            class:text-primary-600={$page.url.pathname === link.href}
            class:bg-primary-50={$page.url.pathname === link.href}
            class:font-semibold={$page.url.pathname === link.href}
          >
            {link.label}
          </a>
        {/each}
        
        <!-- Search in mobile drawer -->
        <a 
          href="/search"
          class="block py-3 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors min-h-[48px] flex items-center text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar
        </a>
      </div>
    </div>
  {/if}
</nav>
