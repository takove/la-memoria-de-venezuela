<script lang="ts">
  export let official: {
    id: string;
    fullName: string;
    photoUrl?: string;
    status: string;
    sanctions?: any[];
    positions?: any[];
  };

  const statusColors: Record<string, string> = {
    active: 'badge-danger',
    exiled: 'badge-warning',
    imprisoned: 'badge-success',
    deceased: 'badge bg-gray-100 text-gray-700',
  };
</script>

<a href="/officials/{official.id}" class="card group hover:shadow-lg transition-all duration-200 block">
  <div class="p-4 sm:p-6">
    <div class="flex items-start gap-3 sm:gap-4">
      <!-- Photo - Touch-friendly -->
      <div class="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full overflow-hidden">
        {#if official.photoUrl}
          <img 
            src={official.photoUrl} 
            alt={official.fullName}
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-gray-400">
            👤
          </div>
        {/if}
      </div>
      
      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {official.fullName}
        </h3>
        
        {#if official.positions && official.positions.length > 0}
          <p class="text-sm text-gray-600 truncate mt-1">
            {official.positions[0].title}
          </p>
        {/if}
        
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="{statusColors[official.status] || 'badge-info'} text-xs">
            {official.status}
          </span>
          
          {#if official.sanctions && official.sanctions.length > 0}
            <span class="badge-danger text-xs">
              🚫 {official.sanctions.length} sanción(es)
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Bottom bar -->
  <div class="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 group-hover:bg-primary-50 transition-colors">
    <span class="text-sm text-gray-600 group-hover:text-primary-600">
      Ver perfil completo →
    </span>
  </div>
</a>
