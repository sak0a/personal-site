<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const versions = [
  { path: '/1', label: '1', color: 'bg-accent-cyan', hex: '#22d3ee' },
  { path: '/4', label: '4', color: 'bg-accent-emerald', hex: '#34d399' },
  { path: '/5', label: '5', color: 'bg-accent-rose', hex: '#fb7185' },
  { path: '/55', label: '55', color: 'bg-accent-rose', hex: '#fb7185' },
]

const isVersionPage = computed(() => /^\/(1|4|5|55)$/.test(route.path))
</script>

<template>
  <nav
    v-if="isVersionPage"
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-3 bg-black/80 backdrop-blur-sm border-b border-white/5"
  >
    <RouterLink
      v-for="v in versions"
      :key="v.path"
      :to="v.path"
      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
      :class="[
        route.path === v.path
          ? `${v.color} text-black scale-110`
          : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'
      ]"
      @mouseenter="route.path !== v.path && ($event.currentTarget.style.boxShadow = `0 0 12px ${v.hex}40, 0 0 4px ${v.hex}60`)"
      @mouseleave="$event.currentTarget.style.boxShadow = ''"
    >
      {{ v.label }}
    </RouterLink>
    <RouterLink
      to="/"
      class="ml-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
    >
      all
    </RouterLink>
  </nav>
</template>
