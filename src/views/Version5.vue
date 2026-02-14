<script setup>
import { ref, onMounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMagnetic } from '../composables/useMagnetic'
import { useCustomCursor } from '../composables/useCustomCursor'
import ProjectCard from '../components/shared/ProjectCard.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
const heroReady = ref(false)
useScrollReveal(container)
const { onMove: magneticMove, onLeave: magneticLeave } = useMagnetic(8)
useCustomCursor({ variant: 'minimal', color: accent }, container)

const heroChars = ['s', 'a', 'k', 'a']

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

onMounted(() => {
  setTimeout(() => { heroReady.value = true }, 100)
})
</script>

<template>
  <div ref="container" class="max-w-2xl mx-auto px-6">
    <!-- Hero with char-reveal + magnetic title -->
    <section class="pt-32 pb-24">
      <h1
        class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6 inline-block"
        @mousemove="magneticMove"
        @mouseleave="magneticLeave"
      >
        <span class="char-reveal" :class="{ visible: heroReady }">
          <span
            v-for="(char, i) in heroChars"
            :key="i"
            :style="{ transitionDelay: `${i * 60}ms` }"
          >{{ char }}</span><span class="text-accent-rose" :style="{ transitionDelay: `${heroChars.length * 60}ms` }">.</span>
        </span>
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

    <!-- Links with playful slash separators -->
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
            class="text-accent-rose/40 mx-1 inline-block cursor-default slash-pop"
          >/</span>
        </template>
      </div>
    </section>

    <FooterSection :accent-color="accent" />
  </div>
</template>
