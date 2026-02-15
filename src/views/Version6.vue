<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCustomCursor } from '../composables/useCustomCursor'
import ProjectCard from '../components/shared/ProjectCard.vue'
import LinkItem from '../components/shared/LinkItem.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#38bdf8'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)
useCustomCursor({ variant: 'brutalist', color: accent }, container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function padIndex(i) {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <div ref="container" class="max-w-4xl mx-auto px-6">
    <!-- Brutalist Hero -->
    <section class="pt-32 pb-20">
      <div class="reveal border-3 border-white p-8 md:p-12 inline-block" style="border-width: 3px">
        <h1 class="font-mono text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none">
          SAKA<span :style="{ color: accent }">.</span>
        </h1>
      </div>
      <div class="reveal mt-6 border-l-4 pl-6" :style="{ borderLeftColor: accent }">
        <p class="font-mono text-zinc-500 text-sm md:text-base uppercase tracking-wide leading-relaxed">
          Creating all types of projects for things I'm interested in — specially web projects.
        </p>
      </div>
    </section>

    <!-- Projects -->
    <section class="reveal pb-6">
      <h2 class="font-mono text-lg font-bold uppercase tracking-widest border-b-4 pb-3 inline-block" :style="{ borderBottomColor: accent }">
        Projects
      </h2>
    </section>

    <div>
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="reveal"
        :style="{ transitionDelay: `${i * 100}ms` }"
      >
        <!-- Numbered prefix -->
        <div class="flex items-start gap-6">
          <span
            class="font-mono text-3xl md:text-4xl font-black shrink-0 mt-6 transition-colors duration-150"
            :style="{ color: accent + '30' }"
          >{{ padIndex(i) }}</span>
          <div class="flex-1">
            <ProjectCard
              :project="project"
              variant="brutalist"
              :accent-color="accent"
              :expanded="expandedId === project.id"
              @toggle="toggleProject(project.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Links -->
    <section class="reveal py-20">
      <h2 class="font-mono text-lg font-bold uppercase tracking-widest border-b-4 pb-3 inline-block mb-8" :style="{ borderBottomColor: accent }">
        Links
      </h2>
      <div class="space-y-0">
        <a
          v-for="link in links"
          :key="link.name"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block border-l-4 border-zinc-800 px-6 py-4 font-mono text-sm uppercase tracking-widest text-zinc-500 transition-all duration-150 hover:text-white"
          :style="{ '--accent': accent }"
          @mouseenter="$event.currentTarget.style.borderLeftColor = accent; $event.currentTarget.style.backgroundColor = accent + '08'"
          @mouseleave="$event.currentTarget.style.borderLeftColor = ''; $event.currentTarget.style.backgroundColor = ''"
        >
          {{ link.name }}
        </a>
      </div>
    </section>

    <FooterSection :accent-color="accent" variant="brutalist" />
  </div>
</template>
