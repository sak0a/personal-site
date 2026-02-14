<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useTypewriter } from '../composables/useTypewriter'
import { useCustomCursor } from '../composables/useCustomCursor'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#34d399'
const container = ref(null)
const expandedId = ref(null)
const scrollContainer = ref(null)
const scrollVelocity = ref(0)
useScrollReveal(container)
useCustomCursor({ variant: 'terminal', color: accent }, container)

// Typewriter for section headers
const { displayText: projectsText, start: startProjectsType } = useTypewriter('projects', 60)
const { displayText: linksText, start: startLinksType } = useTypewriter('links', 60)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// Scroll velocity tracking
let lastScrollLeft = 0
let velocityTimer = null
let fadeTimer = null

function onHorizontalScroll() {
  if (!scrollContainer.value) return
  const currentScroll = scrollContainer.value.scrollLeft
  const delta = Math.abs(currentScroll - lastScrollLeft)
  scrollVelocity.value = Math.min(delta / 2, 100)
  lastScrollLeft = currentScroll

  clearTimeout(fadeTimer)
  fadeTimer = setTimeout(() => {
    scrollVelocity.value = 0
  }, 150)
}

// Observe section headers to trigger typewriter
let projectsObserver = null
let linksObserver = null
const projectsHeader = ref(null)
const linksHeader = ref(null)

onMounted(() => {
  // Typewriter observers
  projectsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        startProjectsType()
        projectsObserver.disconnect()
      }
    },
    { threshold: 0.5 }
  )
  linksObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        startLinksType()
        linksObserver.disconnect()
      }
    },
    { threshold: 0.5 }
  )
  if (projectsHeader.value) projectsObserver.observe(projectsHeader.value)
  if (linksHeader.value) linksObserver.observe(linksHeader.value)

  // Scroll velocity listener
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', onHorizontalScroll, { passive: true })
  }
})

onUnmounted(() => {
  projectsObserver?.disconnect()
  linksObserver?.disconnect()
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', onHorizontalScroll)
  }
  clearTimeout(fadeTimer)
})
</script>

<template>
  <div ref="container" class="px-6">
    <div class="max-w-4xl mx-auto">
      <HeroSection
        :accent-color="accent"
        alignment="left"
        size="normal"
      >
        <template #title>
          saka<span class="text-accent-emerald">.</span>
        </template>
      </HeroSection>
    </div>

    <!-- Projects with typewriter header -->
    <section class="reveal max-w-4xl mx-auto pb-4">
      <h2 ref="projectsHeader" class="text-2xl font-bold mb-8 border-l-4 border-accent-emerald pl-4 font-mono">
        {{ projectsText }}<span class="cursor-blink text-accent-emerald">_</span>
      </h2>
    </section>

    <!-- Scroll velocity indicator -->
    <div class="max-w-5xl mx-auto h-0.5 mb-2 overflow-hidden">
      <div
        class="h-full bg-accent-emerald/40 transition-all duration-150 ease-out rounded-full"
        :style="{ width: scrollVelocity + '%', opacity: scrollVelocity > 0 ? 1 : 0 }"
      />
    </div>

    <div class="reveal relative max-w-5xl mx-auto">
      <div
        ref="scrollContainer"
        class="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scroll-emerald items-start"
      >
        <div
          v-for="(project, i) in projects"
          :key="project.id"
          v-motion
          :initial="{ opacity: 0, x: 40, scale: 0.95 }"
          :visible-once="{ opacity: 1, x: 0, scale: 1, transition: { duration: 500, delay: i * 100 } }"
        >
          <ProjectCard
            :project="project"
            variant="horizontal"
            :accent-color="accent"
            :expanded="expandedId === project.id"
            @toggle="toggleProject(project.id)"
          />
        </div>
      </div>
      <!-- Scroll hint -->
      <div class="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none flex items-center justify-end pr-2">
        <svg class="w-5 h-5 text-accent-emerald animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- Links with typewriter header -->
    <div class="max-w-4xl mx-auto">
      <section class="reveal py-16">
        <h2 ref="linksHeader" class="text-2xl font-bold mb-6 border-l-4 border-accent-emerald pl-4 font-mono">
          {{ linksText }}<span class="cursor-blink text-accent-emerald">_</span>
        </h2>
        <div class="flex flex-col gap-2">
          <LinkItem
            v-for="link in links"
            :key="link.name"
            :link="link"
            :accent-color="accent"
            variant="bar"
            class="link-bar-fill"
            :style="{ '--accent': accent }"
          />
        </div>
      </section>

      <FooterSection :accent-color="accent" variant="terminal" />
    </div>
  </div>
</template>
