<script lang="ts">
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';

  let isDrawerOpen = false;
  let menuButtonElement: HTMLButtonElement;
  let drawerElement: HTMLDivElement;

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
    
    if (isDrawerOpen) {
      // When opening, focus first link in drawer
      setTimeout(() => {
        const firstLink = drawerElement?.querySelector('a') as HTMLAnchorElement;
        firstLink?.focus();
      }, 100);
    } else {
      // When closing, return focus to menu button
      menuButtonElement?.focus();
    }
  }

  function closeDrawer() {
    const wasOpen = isDrawerOpen;
    isDrawerOpen = false;
    
    // Return focus to menu button when closing
    if (wasOpen) {
      menuButtonElement?.focus();
    }
  }

  function handleOverlayClick() {
    closeDrawer();
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
    }
  }

  function handleMenuButtonKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDrawer();
    } else if (event.key === 'Escape' && isDrawerOpen) {
      event.preventDefault();
      closeDrawer();
    }
  }

  function handleDrawerKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
    }
    
    // Focus trap: when tabbing
    if (event.key === 'Tab' && isDrawerOpen) {
      const focusableElements = drawerElement?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey && document.activeElement === firstElement) {
        // Shift+Tab on first element: focus last
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        // Tab on last element: focus first
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
</script>

<nav class="bg-white shadow-sm sticky top-0 z-50" aria-label="Navegación principal">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo - Touch-friendly target -->
      <a 
        href="/" 
        class="flex items-center gap-2 font-bold text-xl text-primary-900 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
        aria-label="La Memoria de Venezuela - Inicio"
      >
        <span class="text-2xl" aria-hidden="true">🇻🇪</span>
        <span class="hidden sm:inline">La Memoria</span>
      </a>

      <!-- Desktop Navigation (>=768px) -->
      <div class="hidden md:flex items-center gap-8" role="menubar" aria-label="Navegación del sitio">
        {#each navLinks as link}
          <a 
            href={link.href}
            role="menuitem"
            class="text-gray-600 hover:text-primary-600 font-medium transition-colors min-h-[44px] flex items-center px-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            class:text-primary-600={$page.url.pathname === link.href}
            class:font-semibold={$page.url.pathname === link.href}
            aria-current={$page.url.pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </a>
        {/each}
      </div>

      <!-- Search Icon (Desktop) - Touch-friendly -->
      <div class="hidden md:block">
        <a 
          href="/search"
          class="p-3 text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
          aria-label="Buscar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </a>
      </div>

      <!-- Mobile Hamburger Menu Button (<768px) - Touch-friendly -->
      <button
        bind:this={menuButtonElement}
        type="button"
        class="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
        on:click={toggleDrawer}
        on:keydown={handleMenuButtonKeydown}
        aria-label={isDrawerOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={isDrawerOpen}
        aria-controls="mobile-menu"
        aria-haspopup="true"
      >
        {#if isDrawerOpen}
          <!-- Close icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <!-- Hamburger icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Drawer (<768px) -->
  {#if isDrawerOpen}
    <!-- Overlay -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      on:click={handleOverlayClick}
      on:keydown={handleOverlayKeydown}
      role="button"
      tabindex="-1"
      aria-label="Cerrar menú de navegación"
    ></div>
    
    <!-- Drawer -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      bind:this={drawerElement}
      id="mobile-menu"
      class="fixed top-16 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
      on:keydown={handleDrawerKeydown}
    >
      <div class="px-4 py-8 space-y-2" role="menu" aria-label="Enlaces de navegación">
        {#each navLinks as link}
          <a 
            href={link.href}
            role="menuitem"
            class="block py-3 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors min-h-[48px] flex items-center text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
            class:text-primary-600={$page.url.pathname === link.href}
            class:bg-primary-50={$page.url.pathname === link.href}
            class:font-semibold={$page.url.pathname === link.href}
            aria-current={$page.url.pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </a>
        {/each}
        
        <!-- Search in mobile drawer -->
        <a 
          href="/search"
          role="menuitem"
          class="block py-3 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors min-h-[48px] flex items-center text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar
        </a>
      </div>
    </div>
  {/if}
</nav>
