<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCardTilt } from '../composables/useCardTilt'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#a78bfa'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)
const { onTiltMove, onTiltLeave } = useCardTilt(4)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div ref="container" class="max-w-6xl mx-auto px-6">
    <HeroSection
      :accent-color="accent"
      alignment="left"
      size="normal"
    >
      <template #title>
        <span class="drop-shadow-[0_0_30px_rgba(167,139,250,0.15)]">saka</span><span class="text-accent-violet">.</span>
      </template>
    </HeroSection>

    <!-- Projects grid -->
    <section class="reveal pb-6">
      <h2 class="text-2xl font-bold mb-8">
        projects
      </h2>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="reveal-scale-tilt"
        :class="{ 'card-glow-border': expandedId !== project.id }"
        :style="{ transitionDelay: `${i * 100}ms`, borderRadius: '1rem' }"
        @mousemove="expandedId !== project.id && onTiltMove($event, $event.currentTarget)"
        @mouseleave="onTiltLeave($event.currentTarget)"
      >
        <ProjectCard
          :project="project"
          variant="card"
          :accent-color="accent"
          :expanded="expandedId === project.id"
          @toggle="toggleProject(project.id)"
        />
      </div>
    </div>

    <!-- Links -->
    <section class="reveal py-12">
      <h2 class="text-2xl font-bold mb-6">
        links
      </h2>
      <div class="flex flex-wrap gap-3">
        <LinkItem
          v-for="link in links"
          :key="link.name"
          :link="link"
          :accent-color="accent"
          variant="pill"
        />
      </div>
    </section>

    <FooterSection :accent-color="accent" />
  </div>
</template>
