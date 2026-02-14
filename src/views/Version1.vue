<script setup>
import { ref, onMounted } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCustomCursor } from '../composables/useCustomCursor'
import HeroSection from '../components/shared/HeroSection.vue'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#22d3ee'
const container = ref(null)
const expandedId = ref(null)
const heroReady = ref(false)
useScrollReveal(container)
useCustomCursor({ variant: 'neon', color: accent }, container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// Trigger hero char stagger after mount
onMounted(() => {
  setTimeout(() => { heroReady.value = true }, 100)
})

const heroChars = ['s', 'a', 'k', 'a']
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
        <span class="char-reveal" :class="{ visible: heroReady }">
          <span
            v-for="(char, i) in heroChars"
            :key="i"
            class="drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            :style="{ transitionDelay: `${i * 60}ms` }"
          >{{ char }}</span><span class="text-accent-cyan" :style="{ transitionDelay: `${heroChars.length * 60}ms` }">.</span>
        </span>
      </template>
      <template #subtitle>
        creating all types of projects for things i'm interested in — specially web projects.<span class="cursor-blink text-accent-cyan ml-0.5">|</span>
      </template>
    </HeroSection>

    <!-- Projects timeline -->
    <section class="reveal-left pb-10">
      <h2 class="text-2xl font-bold font-mono mb-8 text-accent-cyan glitch-hover cursor-default">
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
      <h2 class="text-2xl font-bold font-mono mb-6 text-accent-cyan glitch-hover cursor-default">
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

    <FooterSection :accent-color="accent" variant="neon" />
  </div>
</template>
