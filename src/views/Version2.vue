<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCustomCursor } from '../composables/useCustomCursor'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#f59e0b'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)
useCustomCursor({ variant: 'warm', color: accent }, container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div ref="container" class="relative">
    <!-- Ambient glow blob with breathing animation -->
    <div class="absolute top-20 left-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none blob-breathe" :style="{ backgroundColor: accent + '0d' }" />

    <div class="relative max-w-3xl mx-auto px-6">
      <HeroSection
        :accent-color="accent"
        alignment="center"
        size="large"
      >
        <template #title>
          saka<span class="text-accent-amber">.</span>
        </template>
        <!-- Decorative underline that grows on scroll -->
        <div class="reveal underline-grow mt-6 mx-auto h-1 rounded-full bg-gradient-to-r from-transparent via-accent-amber to-transparent" />
      </HeroSection>

      <!-- Projects -->
      <section class="reveal text-center pb-6">
        <h2 class="text-2xl font-bold mb-10">
          projects
        </h2>
      </section>

      <div class="space-y-16">
        <div
          v-for="(project, i) in projects"
          :key="project.id"
          class="reveal"
          :style="{ transitionDelay: `${i * 80}ms` }"
        >
          <ProjectCard
            :project="project"
            variant="minimal"
            :accent-color="accent"
            :expanded="expandedId === project.id"
            @toggle="toggleProject(project.id)"
          />
          <!-- Separator that draws from center on scroll -->
          <div v-if="i < projects.length - 1" class="reveal separator-draw mt-12 mx-auto h-px" :style="{ backgroundColor: accent + '4d' }" />
        </div>
      </div>

      <!-- Links -->
      <section class="reveal py-20 text-center">
        <h2 class="text-2xl font-bold mb-8">
          links
        </h2>
        <div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <LinkItem
            v-for="link in links"
            :key="link.name"
            :link="link"
            :accent-color="accent"
            variant="pill"
          />
        </div>
      </section>

      <FooterSection :accent-color="accent" variant="warm" />
    </div>
  </div>
</template>
