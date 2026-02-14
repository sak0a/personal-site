<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#22d3ee'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div ref="container" class="max-w-3xl ml-auto mr-auto md:ml-[15%] md:mr-auto px-6">
    <HeroSection
      :accent-color="accent"
      alignment="left"
      size="normal"
      font-class="font-mono"
    >
      <template #title>
        <span class="drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">saka</span><span class="text-accent-cyan">.</span>
      </template>
    </HeroSection>

    <!-- Projects timeline -->
    <section class="reveal-left pb-10">
      <h2 class="text-2xl font-bold font-mono mb-8 text-accent-cyan">
        projects
      </h2>
    </section>

    <div class="relative ml-1">
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="reveal-left"
        :style="{ transitionDelay: `${i * 100}ms` }"
      >
        <ProjectCard
          :project="project"
          variant="timeline"
          :accent-color="accent"
          :expanded="expandedId === project.id"
          @toggle="toggleProject(project.id)"
        />
      </div>
    </div>

    <!-- Links -->
    <section class="reveal py-16">
      <h2 class="text-2xl font-bold font-mono mb-6 text-accent-cyan">
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
