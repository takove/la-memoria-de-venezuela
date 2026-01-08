<script lang="ts">
  import { goto } from '$app/navigation';

  let searchQuery = '';
  let suggestions: any[] = [];
  let showSuggestions = false;
  let isLoading = false;

  async function handleSearch() {
    if (searchQuery.trim()) {
      goto(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="relative">
  <div class="relative">
    <input
      type="text"
      bind:value={searchQuery}
      on:keydown={handleKeydown}
      placeholder="Buscar funcionarios, sanciones, casos..."
      class="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 text-base sm:text-lg rounded-xl border-0 shadow-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[48px]"
      aria-label="Buscar en La Memoria de Venezuela"
    />
    <button
      type="button"
      on:click={handleSearch}
      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Buscar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 sm:h-6 sm:w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  </div>

  <!-- Autocomplete suggestions -->
  {#if showSuggestions && suggestions.length > 0}
    <ul
      class="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      role="listbox"
      aria-label="Sugerencias de búsqueda"
    >
      {#each suggestions as suggestion, index}
        <li role="option" aria-selected={index === 0}>
          <a
            href="/officials/{suggestion.id}"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors min-h-[48px]"
          >
            <div
              class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
            >
              {#if suggestion.photoUrl}
                <img
                  src={suggestion.photoUrl}
                  alt=""
                  class="w-10 h-10 rounded-full object-cover"
                />
              {:else}
                <span class="text-gray-500" aria-hidden="true">👤</span>
              {/if}
            </div>
            <span class="text-gray-900 text-base">{suggestion.name}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
