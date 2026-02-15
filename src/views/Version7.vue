<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCustomCursor } from '../composables/useCustomCursor'
import ProjectCard from '../components/shared/ProjectCard.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'

const accent = '#eab308'
const container = ref(null)
const expandedId = ref(null)
useScrollReveal(container)
useCustomCursor({ variant: 'editorial', color: accent }, container)

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div ref="container" class="max-w-5xl mx-auto px-6">
    <!-- Editorial Hero — asymmetric layout -->
    <section class="pt-32 pb-24">
      <div class="reveal-slow grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <h1 class="font-serif text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
            saka<span :style="{ color: accent }">.</span>
          </h1>
        </div>
        <div class="md:pb-3">
          <p class="text-zinc-400 text-lg leading-relaxed">
            Creating all types of projects for things I'm interested in — specially web projects.
          </p>
        </div>
      </div>
      <!-- Thin decorative rule -->
      <div class="reveal-slow mt-10 h-px w-full" :style="{ background: `linear-gradient(to right, ${accent}60, transparent)` }" />
    </section>

    <!-- Projects -->
    <section class="reveal-slow pb-8">
      <h2 class="font-serif text-xl tracking-widest uppercase" :style="{ color: accent }">
        Projects
      </h2>
    </section>

    <div>
      <div
        v-for="(project, i) in projects"
        :key="project.id"
        class="reveal-slow"
        :style="{ transitionDelay: `${i * 120}ms` }"
      >
        <ProjectCard
          :project="project"
          variant="editorial"
          :accent-color="accent"
          :expanded="expandedId === project.id"
          @toggle="toggleProject(project.id)"
        />
        <!-- Thin separator -->
        <div
          v-if="i < projects.length - 1"
          class="h-px my-2"
          :style="{ backgroundColor: accent + '15' }"
        />
      </div>
    </div>

    <!-- Links — editorial colophon style -->
    <section class="reveal-slow py-24">
      <div class="h-px w-full mb-12" :style="{ backgroundColor: accent + '20' }" />
      <p class="text-zinc-400 text-lg leading-relaxed">
        Find me on
        <template v-for="(link, i) in links" :key="link.name">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="editorial-link font-serif italic"
            :style="{ color: accent, '--accent': accent }"
          >{{ link.name }}</a><span v-if="i < links.length - 2" class="text-zinc-400">, </span><span v-else-if="i === links.length - 2" class="text-zinc-400">, and </span>
        </template><span class="text-zinc-400">.</span>
      </p>
    </section>

    <FooterSection :accent-color="accent" variant="editorial" />
  </div>
</template>
