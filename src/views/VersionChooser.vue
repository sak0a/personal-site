<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const container = ref(null)
useScrollReveal(container)

const versions = [
  { path: '/1', label: '01', name: 'Neon', color: 'border-accent-cyan', glow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]', text: 'text-accent-cyan', hex: '#22d3ee' },
  { path: '/2', label: '02', name: 'Warm', color: 'border-accent-amber', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]', text: 'text-accent-amber', hex: '#f59e0b' },
  { path: '/3', label: '03', name: 'Violet', color: 'border-accent-violet', glow: 'hover:shadow-[0_0_30px_rgba(167,139,250,0.15)]', text: 'text-accent-violet', hex: '#a78bfa' },
  { path: '/4', label: '04', name: 'Terminal', color: 'border-accent-emerald', glow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]', text: 'text-accent-emerald', hex: '#34d399' },
  { path: '/5', label: '05', name: 'Minimal', color: 'border-accent-rose', glow: 'hover:shadow-[0_0_30px_rgba(251,113,133,0.15)]', text: 'text-accent-rose', hex: '#fb7185' },
]
</script>

<template>
  <div ref="container" class="min-h-screen flex flex-col items-center justify-center px-6 py-20">
    <div class="reveal text-center mb-16">
      <h1 class="text-6xl md:text-7xl font-black tracking-tight mb-4">saka<span class="text-zinc-600">.</span></h1>
      <p class="text-zinc-500 text-lg">choose a vibe</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-5xl">
      <RouterLink
        v-for="(v, i) in versions"
        :key="v.path"
        :to="v.path"
        class="reveal group relative border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center aspect-[3/4] sm:aspect-auto sm:h-48 transition-all duration-500 hover:border-opacity-100 bg-zinc-950/50 tile-glow"
        :class="[v.color, v.glow]"
        :style="{ transitionDelay: `${i * 80}ms`, '--tile-color': v.hex }"
      >
        <span class="text-4xl font-black mb-2 transition-colors duration-300" :class="'group-hover:' + v.text">
          {{ v.label }}
        </span>
        <span class="text-xs text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
          {{ v.name }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>
