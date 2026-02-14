<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#34d399'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
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

    <!-- Projects horizontal scroll -->
    <section class="reveal max-w-4xl mx-auto pb-4">
      <h2 class="text-2xl font-bold mb-8 border-l-4 border-accent-emerald pl-4">
        projects
      </h2>
    </section>

    <div class="reveal relative max-w-5xl mx-auto">
      <div
        class="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scroll-emerald items-start"
        v-motion
        :initial="{ opacity: 0, x: 40 }"
        :visible-once="{ opacity: 1, x: 0, transition: { duration: 600 } }"
      >
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          variant="horizontal"
          :accent-color="accent"
          :expanded="expandedId === project.id"
          @toggle="toggleProject(project.id)"
        />
      </div>
      <!-- Scroll hint -->
      <div class="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none flex items-center justify-end pr-2">
        <svg class="w-5 h-5 text-accent-emerald animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- Links -->
    <div class="max-w-4xl mx-auto">
      <section class="reveal py-16">
        <h2 class="text-2xl font-bold mb-6 border-l-4 border-accent-emerald pl-4">
          links
        </h2>
        <div class="flex flex-col gap-2">
          <LinkItem
            v-for="link in links"
            :key="link.name"
            :link="link"
            :accent-color="accent"
            variant="bar"
          />
        </div>
      </section>

      <FooterSection :accent-color="accent" />
    </div>
  </div>
</template>
