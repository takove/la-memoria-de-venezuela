<script lang="ts">
  export let label: string;
  export let value: string;
  export let icon: string;

  const iconMap: Record<string, string> = {
    users: '👥',
    ban: '🚫',
    gavel: '⚖️',
    calendar: '📅',
  };
</script>

<div class="card p-6 text-center hover:shadow-md transition-shadow">
  <div class="text-4xl mb-3">{iconMap[icon] || '📊'}</div>
  <div class="text-3xl font-bold text-primary-600 mb-1">{value}</div>
  <div class="text-gray-600">{label}</div>
</div>
