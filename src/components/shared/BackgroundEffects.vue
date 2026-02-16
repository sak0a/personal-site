<script setup>
// Floating particles — tiny white dots that drift upward, matching the dotted grid aesthetic
const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 1 + Math.random() * 1,
  opacity: 0.06 + Math.random() * 0.1,
  duration: 18 + Math.random() * 22,
  delay: Math.random() * -40,
  drift: -30 + Math.random() * 60,
}))
</script>

<template>
  <div class="bg-effects" aria-hidden="true">
    <!-- Floating particles -->
    <div
      v-for="p in particles"
      :key="p.id"
      class="bg-particle"
      :style="{
        left: p.x + '%',
        width: p.size + 'px',
        height: p.size + 'px',
        opacity: p.opacity,
        '--drift': p.drift + 'px',
        animationDuration: p.duration + 's',
        animationDelay: p.delay + 's',
      }"
    />

    <!-- Ambient glow orbs — barely-visible rose warmth that drifts slowly -->
    <div class="bg-glow-orb bg-glow-orb-1" />
    <div class="bg-glow-orb bg-glow-orb-2" />
  </div>
</template>
