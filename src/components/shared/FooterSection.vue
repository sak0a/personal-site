<script setup>
defineProps({
  accentColor: {
    type: String,
    default: '#22d3ee',
  },
})
</script>

<template>
  <footer class="py-12 px-6 border-t border-zinc-900">
    <p class="text-sm text-zinc-600">
      <span class="font-bold" :style="{ color: accentColor }">saka</span>
      <span class="mx-2">&middot;</span>
      {{ new Date().getFullYear() }}
    </p>
  </footer>
</template>
