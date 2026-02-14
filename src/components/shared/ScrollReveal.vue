<script setup>
const props = defineProps({
  direction: {
    type: String,
    default: 'up',
    validator: (v) => ['up', 'left', 'scale', 'slow'].includes(v),
  },
  delay: {
    type: Number,
    default: 0,
  },
})

const classMap = {
  up: 'reveal',
  left: 'reveal-left',
  scale: 'reveal-scale',
  slow: 'reveal-slow',
}
</script>

<template>
  <div
    :class="classMap[direction]"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>
