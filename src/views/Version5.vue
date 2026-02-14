<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMagnetic } from '../composables/useMagnetic'
import ProjectCard from '../components/shared/ProjectCard.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
const scrollProgress = ref(0)
useScrollReveal(container)
const { onMove: magneticMove, onLeave: magneticLeave } = useMagnetic(8)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// Scroll progress tracking
function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div ref="container" class="max-w-2xl mx-auto px-6">
    <!-- Scroll progress accent line (replaces static rose line) -->
    <div class="fixed top-0 left-0 right-0 h-0.5 z-50">
      <div
        class="h-full bg-accent-rose transition-[width] duration-75 ease-linear"
        :style="{ width: scrollProgress + '%' }"
      />
    </div>

    <!-- Hero with spring animation + magnetic title -->
    <section class="pt-32 pb-24 cursor-crosshair">
      <h1
        v-motion
        :initial="{ opacity: 0, y: 50, scale: 0.95 }"
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }"
        class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6 inline-block"
        @mousemove="magneticMove"
        @mouseleave="magneticLeave"
      >
        saka<span class="text-accent-rose">.</span>
      </h1>
      <p
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 800 } }"
        class="text-xl text-zinc-500 leading-relaxed"
      >
        creating all types of projects for things i'm interested in — specially web projects.
      </p>
    </section>

    <!-- Projects -->
    <section class="reveal-slow pb-6">
      <h2 class="text-2xl font-bold mb-10">
        projects
      </h2>
    </section>

    <div>
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="reveal-slow"
        :style="{ transitionDelay: `${i * 80}ms` }"
      >
        <ProjectCard
          :project="project"
          variant="large-type"
          :accent-color="accent"
          :expanded="expandedId === project.id"
          @toggle="toggleProject(project.id)"
        />
        <!-- Divider that draws on scroll -->
        <div v-if="i < projects.length - 1" class="reveal-slow divider-draw my-2 w-full h-px bg-accent-rose/20 origin-left" />
      </div>
    </div>

    <!-- Links with rotating slash separators -->
    <section class="reveal-slow py-20">
      <div class="flex flex-wrap items-center gap-x-1 gap-y-2">
        <template v-for="(link, i) in links" :key="link.name">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-zinc-500 hover:text-accent-rose transition-colors duration-300 hover:underline underline-offset-4"
          >
            {{ link.name }}
          </a>
          <span
            v-if="i < links.length - 1"
            class="text-accent-rose/40 mx-1 inline-block transition-transform duration-500 hover:rotate-[360deg] cursor-default"
          >/</span>
        </template>
      </div>
    </section>

    <FooterSection :accent-color="accent" />
  </div>
</template>
