<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMagnetic } from '../composables/useMagnetic'
import { useCustomCursor } from '../composables/useCustomCursor'
import ProjectCard from '../components/shared/ProjectCard.vue'
import GitHubHeatmap from '../components/shared/GitHubHeatmap.vue'
import FooterSection from '../components/shared/FooterSection.vue'
import TextEffect from '../components/shared/TextEffect.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'
import { stack } from '../data/stack'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
const heroReady = ref(false)
const subtitleDone = ref(false)
const dividerEls = ref([])
const projectEls = ref([])
const projectVisible = ref({})
useScrollReveal(container)
const { onMove: magneticMove, onLeave: magneticLeave } = useMagnetic(8)
useCustomCursor({ variant: 'rose', color: accent })

const heroChars = ['s', 'a', 'k', 'a']

function toggleProject(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// Layout toggle — defaults to wide, persisted in localStorage
const STORAGE_KEY = 'v5-layout-wide'
const wideLayout = ref(true)

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) wideLayout.value = stored === 'true'
}

watch(wideLayout, (val) => {
  localStorage.setItem(STORAGE_KEY, String(val))
})

function toggleLayout() {
  wideLayout.value = !wideLayout.value
}

const containerClass = computed(() => [
  'mx-auto v5-layout-transition',
  wideLayout.value ? 'max-w-6xl px-6 lg:px-8' : 'max-w-2xl px-6',
])

const footerContainerClass = computed(() => [
  'mx-auto v5-layout-transition',
  wideLayout.value ? 'max-w-6xl px-6 lg:px-8' : 'max-w-3xl px-6',
])

const projectGridClass = computed(() =>
  wideLayout.value ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2' : '',
)

// Marquee — JS-driven for smooth speed transitions on hover
const marqueeEl = ref(null)
const marqueeHovered = ref(false)

const SPEED_NORMAL = 0.5 // px per frame
const SPEED_SLOW = 0.1
let marqueeOffset = 0
let currentSpeed = SPEED_NORMAL
let marqueeRaf = null

function tickMarquee() {
  if (!marqueeEl.value) return
  // Lerp speed toward target for smooth transition
  const target = marqueeHovered.value ? SPEED_SLOW : SPEED_NORMAL
  currentSpeed += (target - currentSpeed) * 0.06

  marqueeOffset += currentSpeed
  // Half-width = one full set of items; reset seamlessly
  const halfWidth = marqueeEl.value.scrollWidth / 2
  if (marqueeOffset >= halfWidth) marqueeOffset -= halfWidth

  marqueeEl.value.style.transform = `translateX(-${marqueeOffset}px)`
  marqueeRaf = requestAnimationFrame(tickMarquee)
}

// Divider replay observer — toggles .visible on/off each time
let dividerObserver = null
// Project card scroll-triggered visibility
let projectObserver = null

onMounted(() => {
  setTimeout(() => { heroReady.value = true }, 100)

  // Start marquee loop
  marqueeRaf = requestAnimationFrame(tickMarquee)

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

  // Set up project card observer — staggered reveals on scroll
  projectObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.projectIdx)
          // Stagger: each card waits 150ms after the previous visible sibling
          const alreadyVisible = Object.keys(projectVisible.value).length
          const delay = alreadyVisible > 0 ? 150 : 0
          setTimeout(() => {
            projectVisible.value = { ...projectVisible.value, [idx]: true }
          }, delay)
          projectObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  )

  // Observe projects + dividers after DOM settles
  setTimeout(() => {
    projectEls.value.forEach((el) => {
      if (el) projectObserver.observe(el)
    })
    if (!wideLayout.value) {
      dividerEls.value.forEach((el) => {
        if (el) dividerObserver.observe(el)
      })
    }
  }, 100)
})

// Re-observe dividers when switching back to compact mode
watch(wideLayout, async (wide) => {
  await nextTick()
  dividerObserver?.disconnect()
  if (!wide) {
    dividerEls.value = []
    await nextTick()
    dividerEls.value.forEach((el) => {
      if (el) dividerObserver.observe(el)
    })
  }
}, { flush: 'post' })

onUnmounted(() => {
  dividerObserver?.disconnect()
  projectObserver?.disconnect()
  if (marqueeRaf) cancelAnimationFrame(marqueeRaf)
})
</script>

<template>
  <div>
  <div ref="container" :class="containerClass">
    <!-- Hero with char-reveal + magnetic title -->
    <section class="pt-32 pb-24" :class="wideLayout ? 'lg:pb-32' : ''">
      <div class="inline-block mb-6">
        <h1
          class="v5-hero-title font-black tracking-tighter leading-none inline-block relative"
          :class="[
            wideLayout ? 'text-8xl md:text-9xl lg:text-[11rem]' : 'text-7xl md:text-8xl lg:text-9xl',
            { 'v5-hero-ready': heroReady }
          ]"
          :style="{ '--accent': accent }"
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
      </div>
      <TextEffect
        text="Software developer from Germany — building full-stack web apps, native tools, and anything that sparks my curiosity."
        per="char"
        preset="fade-in-blur"
        :trigger="heroReady"
        :delay="0.3"
        :speed-reveal="1.6"
        :speed-segment="0.8"
        class="text-zinc-500 leading-relaxed"
        :class="wideLayout ? 'text-xl lg:text-2xl max-w-2xl' : 'text-xl'"
        @animation-complete="subtitleDone = true"
      />
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-sm text-zinc-600">
        <TextEffect tag="span" text="full-stack" per="char" preset="blur" :trigger="subtitleDone" :delay="0" :speed-reveal="2" :speed-segment="0.7" class="inline" />
        <span class="transition-opacity duration-500" :class="subtitleDone ? 'opacity-40' : 'opacity-0'" style="transition-delay:0.15s;color:#fb7185">·</span>
        <TextEffect tag="span" text="open source" per="char" preset="blur" :trigger="subtitleDone" :delay="0.1" :speed-reveal="2" :speed-segment="0.7" class="inline" />
        <span class="transition-opacity duration-500" :class="subtitleDone ? 'opacity-40' : 'opacity-0'" style="transition-delay:0.3s;color:#fb7185">·</span>
        <TextEffect tag="span" text="gaming" per="char" preset="blur" :trigger="subtitleDone" :delay="0.2" :speed-reveal="2" :speed-segment="0.7" class="inline" />
        <span class="transition-opacity duration-500" :class="subtitleDone ? 'opacity-40' : 'opacity-0'" style="transition-delay:0.45s;color:#fb7185">·</span>
        <TextEffect tag="span" text="native apps" per="char" preset="blur" :trigger="subtitleDone" :delay="0.3" :speed-reveal="2" :speed-segment="0.7" class="inline" />
      </div>
    </section>

    <!-- Projects -->
    <section class="reveal-slow pb-2">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        projects
      </h2>
    </section>

    <div :class="projectGridClass">
      <template
        v-for="(project, i) in projects"
        :key="project.id"
      >
        <div
          :ref="el => { if (el) projectEls[i] = el }"
          :data-project-idx="i"
          class="transition-all duration-700 ease-out"
          :class="projectVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <ProjectCard
            :project="project"
            variant="large-type"
            :accent-color="accent"
            :expanded="expandedId === project.id"
            :stagger-title="true"
            :visible="!!projectVisible[i]"
            @toggle="toggleProject(project.id)"
          />
        </div>
        <!-- Divider: compact mode only -->
        <div
          v-if="!wideLayout && i < projects.length - 1"
          :ref="el => { if (el) dividerEls[i] = el }"
          class="divider-draw my-2 w-full h-px bg-accent-rose/20 origin-left"
        />
      </template>
    </div>

    <!-- Tech Stack -->
    <section class="reveal-slow pt-20 pb-2">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        stack
      </h2>
    </section>

    <div
      class="reveal-slow stack-marquee-wrap overflow-hidden"
      :style="{ '--accent': accent }"
      @mouseenter="marqueeHovered = true"
      @mouseleave="marqueeHovered = false"
    >
      <div ref="marqueeEl" class="stack-marquee">
        <div
          v-for="(tech, i) in [...stack, ...stack]"
          :key="i + '-' + tech.name"
          class="v5-stack-item group shrink-0"
        >
          <div class="flex flex-col items-center gap-2.5 py-3 px-5 rounded-lg border border-zinc-800/50 transition-all duration-300 group-hover:border-zinc-700">
            <div class="w-8 h-8 transition-transform duration-300 group-hover:scale-110" v-html="tech.icon" />
            <span class="text-xs text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- GitHub Activity -->
    <section class="reveal-slow pt-20 pb-2">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        activity
      </h2>
    </section>

    <div class="reveal-slow">
      <GitHubHeatmap username="sak0a" :accent-color="accent" />
    </div>

  </div>

    <!-- Footer area -->
    <div :class="footerContainerClass">
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

            <!-- Layout toggle -->
            <span class="slash-morph text-accent-rose/40 mx-1 cursor-default">
              <span class="slash-morph-from">/</span>
              <span class="slash-morph-to absolute inset-0 flex items-center justify-center">~</span>
            </span>
            <button class="v5-link group/toggle" @click.prevent="toggleLayout">
              <span class="v5-link-text text-zinc-500">{{ wideLayout ? 'compact' : 'wide' }}</span>
              <span class="v5-link-line" />
            </button>
          </div>
        </template>
      </FooterSection>
    </div>
  </div>
</template>
