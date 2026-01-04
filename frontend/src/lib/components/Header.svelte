<script lang="ts">
  let isMenuOpen = false;

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/memorial', label: '🕯️ Memorial' },
    { href: '/officials', label: 'Funcionarios' },
    { href: '/sanctions', label: 'Sanciones' },
    { href: '/cases', label: 'Casos' },
    { href: '/about', label: 'Acerca de' },
  ];
</script>

<header class="bg-white shadow-sm sticky top-0 z-50">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 font-bold text-xl text-primary-900">
        <span class="text-2xl">🇻🇪</span>
        <span class="hidden sm:inline">La Memoria</span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        {#each navLinks as link}
          <a 
            href={link.href}
            class="text-gray-600 hover:text-primary-600 font-medium transition-colors"
          >
            {link.label}
          </a>
        {/each}
      </div>

      <!-- Search Icon (Desktop) -->
      <div class="hidden md:block">
        <a 
          href="/search"
          class="p-2 text-gray-600 hover:text-primary-600 transition-colors"
          aria-label="Buscar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 text-gray-600"
        on:click={() => isMenuOpen = !isMenuOpen}
        aria-label="Menu"
      >
        {#if isMenuOpen}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Mobile Navigation -->
    {#if isMenuOpen}
      <div class="md:hidden py-4 border-t">
        {#each navLinks as link}
          <a 
            href={link.href}
            class="block py-2 text-gray-600 hover:text-primary-600 font-medium"
            on:click={() => isMenuOpen = false}
          >
            {link.label}
          </a>
        {/each}
      </div>
    {/if}
  </nav>
</header>
