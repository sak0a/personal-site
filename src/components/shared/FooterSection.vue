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
  <footer class="py-12 px-6 border-t" :class="variant === 'rose' || variant === 'editorial' ? 'border-transparent' : variant === 'brutalist' ? 'border-zinc-700' : 'border-zinc-900'">
    <!-- V1 Neon: terminal shell prompt -->
    <div v-if="variant === 'neon'" class="font-mono text-sm text-zinc-600">
      <span class="text-zinc-500">$ </span>
      <span>echo </span>
      <span class="text-accent-cyan">'built by saka'</span>
      <span class="text-zinc-500"> | </span>
      <span>{{ year }}</span>
      <span class="cursor-blink text-accent-cyan ml-0.5">|</span>
    </div>

    <!-- V6 Brutalist: raw monospace with exposed pipe characters -->
    <div v-else-if="variant === 'brutalist'" class="font-mono text-sm text-zinc-600 uppercase tracking-widest">
      <span class="font-bold" :style="{ color: accentColor }">SAKA</span>
      <span class="mx-3 text-zinc-700">|</span>
      <span>{{ year }}</span>
      <span class="mx-3 text-zinc-700">|</span>
      <span>BUILT</span>
    </div>

    <!-- V7 Editorial: elegant centered with thin rules -->
    <div v-else-if="variant === 'editorial'" class="text-center">
      <div class="w-16 h-px mx-auto mb-4" :style="{ backgroundColor: accentColor + '40' }" />
      <p class="text-sm text-zinc-500 tracking-widest font-serif italic">
        &mdash; saka, {{ year }} &mdash;
      </p>
      <div class="w-16 h-px mx-auto mt-4" :style="{ backgroundColor: accentColor + '40' }" />
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
