<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMagnetic } from '../composables/useMagnetic'
import { useCustomCursor } from '../composables/useCustomCursor'
import ProjectCard from '../components/shared/ProjectCard.vue'
import GitHubHeatmap from '../components/shared/GitHubHeatmap.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'
import { stack } from '../data/stack'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
const heroReady = ref(false)
const dividerEls = ref([])
useScrollReveal(container)
const { onMove: magneticMove, onLeave: magneticLeave } = useMagnetic(8)
useCustomCursor({ variant: 'rose', color: accent })

const heroChars = ['s', 'a', 'k', 'a']

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// Divider replay observer — toggles .visible on/off each time
let dividerObserver = null

onMounted(() => {
  setTimeout(() => { heroReady.value = true }, 100)

  // Set up divider replay observer
  dividerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        } else {
          entry.target.classList.remove('visible')
        }
      })
    },
    { threshold: 0.3 }
  )

  // Observe all dividers after DOM settles
  setTimeout(() => {
    dividerEls.value.forEach((el) => {
      if (el) dividerObserver.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  dividerObserver?.disconnect()
})
</script>

<template>
  <div>
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
      <h2 class="text-2xl font-bold mb-10 v5-heading-line" :style="{ '--accent': accent }">
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
          :stagger-title="true"
          @toggle="toggleProject(project.id)"
        />
        <!-- Divider that replays animation on each scroll -->
        <div
          v-if="i < projects.length - 1"
          :ref="el => { if (el) dividerEls[i] = el }"
          class="divider-draw my-2 w-full h-px bg-accent-rose/20 origin-left"
        />
      </div>
    </div>

    <!-- Tech Stack -->
    <section class="reveal-slow pt-20 pb-6">
      <h2 class="text-2xl font-bold mb-10 v5-heading-line" :style="{ '--accent': accent }">
        stack
      </h2>
    </section>

    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div
        v-for="(tech, i) in stack"
        :key="tech.name"
        class="reveal-slow v5-stack-item group"
        :style="{ transitionDelay: `${i * 60}ms`, '--accent': accent }"
      >
        <div class="flex flex-col items-center gap-2.5 py-4 px-3 rounded-lg border border-zinc-800/50 transition-all duration-300 group-hover:border-zinc-700">
          <div class="w-8 h-8 transition-transform duration-300 group-hover:scale-110" v-html="tech.icon" />
          <span class="text-xs text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">{{ tech.name }}</span>
        </div>
      </div>
    </div>

    <!-- GitHub Activity -->
    <section class="reveal-slow pt-20 pb-6">
      <h2 class="text-2xl font-bold mb-10 v5-heading-line" :style="{ '--accent': accent }">
        activity
      </h2>
    </section>

    <div class="reveal-slow">
      <GitHubHeatmap username="sak0a" :accent-color="accent" />
    </div>

  </div>

    <!-- Wider footer area -->
    <div class="max-w-3xl mx-auto px-6">
      <FooterSection :accent-color="accent" variant="rose">
        <template #links>
          <div class="flex flex-wrap items-center gap-x-1 gap-y-2 mb-8">
            <template v-for="(link, i) in links" :key="link.name">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="v5-link"
              >
                <span class="v5-link-text text-zinc-500">{{ link.name }}</span>
                <span class="v5-link-line" />
              </a>
              <span
                v-if="i < links.length - 1"
                class="slash-morph text-accent-rose/40 mx-1 cursor-default"
              >
                <span class="slash-morph-from">/</span>
                <span class="slash-morph-to absolute inset-0 flex items-center justify-center">~</span>
              </span>
            </template>
          </div>
        </template>
      </FooterSection>
    </div>
  </div>
</template>
