<script setup>
defineProps({
  accentColor: {
    type: String,
    default: '#22d3ee',
  },
  alignment: {
    type: String,
    default: 'left',
  },
  size: {
    type: String,
    default: 'normal',
  },
  fontClass: {
    type: String,
    default: 'font-sans',
  },
})

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const sizeClass = {
  normal: 'text-5xl md:text-6xl',
  large: 'text-6xl md:text-7xl',
  massive: 'text-7xl md:text-8xl lg:text-9xl',
}
</script>

<template>
  <section
    class="reveal pt-32 pb-20 px-6"
    :class="alignClass[alignment]"
  >
    <h1
      class="font-black tracking-tight leading-none mb-4"
      :class="[sizeClass[size], fontClass]"
    >
      <slot name="title">
        saka<span :style="{ color: accentColor }">.</span>
      </slot>
    </h1>
    <p class="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed" :class="{ 'mx-auto': alignment === 'center' }">
      <slot name="subtitle">
        creating all types of projects for things i'm interested in — specially web projects.
      </slot>
    </p>
    <slot />
  </section>
</template>
