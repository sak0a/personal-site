<script setup>
defineProps({
  accentColor: {
    type: String,
    default: '#22d3ee',
  },
  variant: {
    type: String,
    default: 'default',
  },
})

const year = new Date().getFullYear()
</script>

<template>
  <footer class="py-12 px-6 border-t" :class="variant === 'rose' ? 'border-transparent' : 'border-zinc-900'">
    <!-- V1 Neon: terminal shell prompt -->
    <div v-if="variant === 'neon'" class="font-mono text-sm text-zinc-600">
      <span class="text-zinc-500">$ </span>
      <span>echo </span>
      <span class="text-accent-cyan">'built by saka'</span>
      <span class="text-zinc-500"> | </span>
      <span>{{ year }}</span>
      <span class="cursor-blink text-accent-cyan ml-0.5">|</span>
    </div>

    <!-- V2 Warm: centered with pulsing dot -->
    <p v-else-if="variant === 'warm'" class="text-sm text-zinc-600 text-center">
      {{ year }}
      <span class="inline-block mx-3 w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: accentColor }" />
      <span class="font-bold" :style="{ color: accentColor }">saka</span>
    </p>

    <!-- V3 Violet: card-style box -->
    <div v-else-if="variant === 'violet'" class="inline-block border border-zinc-800 rounded-lg px-6 py-3">
      <div class="h-0.5 w-12 rounded-full mb-3 bg-gradient-to-r from-accent-violet to-accent-cyan" />
      <p class="text-sm text-zinc-500">
        <span class="font-bold" :style="{ color: accentColor }">saka</span>
        <span class="mx-2 text-zinc-700">/</span>
        <span>{{ year }}</span>
      </p>
    </div>

    <!-- V4 Terminal: mono prompt with blinking underscore -->
    <div v-else-if="variant === 'terminal'" class="font-mono text-sm text-zinc-600">
      <span class="font-bold" :style="{ color: accentColor }">saka</span><span class="cursor-blink" :style="{ color: accentColor }">_</span>
      <span class="ml-4 text-zinc-700">// {{ year }}</span>
    </div>

    <!-- V5 Rose: scattered footer with gradient line + logo mark + pulsing dots -->
    <div v-else-if="variant === 'rose'">
      <div
        class="w-full h-px mb-8 origin-left"
        :style="{ background: `linear-gradient(to right, ${accentColor}, transparent)` }"
      />
      <slot name="links" />
      <div class="flex items-end justify-between">
        <div class="group/mark">
          <p class="text-3xl font-black tracking-tight leading-none">
            <span :style="{ color: accentColor }">s</span><span class="inline-block transition-transform duration-500 group-hover/mark:rotate-[360deg]" :style="{ color: accentColor }">.</span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <span
              v-for="d in 3"
              :key="d"
              class="w-1 h-1 rounded-full animate-pulse"
              :style="{ backgroundColor: accentColor, animationDelay: `${d * 200}ms` }"
            />
          </div>
          <span class="text-xs text-zinc-600 tracking-widest">{{ year }}</span>
        </div>
      </div>
    </div>

    <!-- Default fallback -->
    <p v-else class="text-sm text-zinc-600">
      <span class="font-bold" :style="{ color: accentColor }">saka</span>
      <span class="mx-2">&middot;</span>
      {{ year }}
    </p>
  </footer>
</template>
