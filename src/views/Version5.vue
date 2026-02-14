<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import ProjectCard from '../components/shared/ProjectCard.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div ref="container" class="max-w-2xl mx-auto px-6">
    <!-- Rose accent line at top -->
    <div class="w-full h-px bg-accent-rose/40" />

    <!-- Hero with spring animation -->
    <section class="pt-32 pb-24 cursor-crosshair">
      <h1
        v-motion
        :initial="{ opacity: 0, y: 50, scale: 0.95 }"
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }"
        class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6"
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
        <div v-if="i < projects.length - 1" class="my-2 w-full h-px bg-accent-rose/20" />
      </div>
    </div>

    <!-- Links -->
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
          <span v-if="i < links.length - 1" class="text-accent-rose/40 mx-1">/</span>
        </template>
      </div>
    </section>

    <FooterSection :accent-color="accent" />
  </div>
</template>
