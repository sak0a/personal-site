<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMagnetic } from '../composables/useMagnetic'
import ProjectCard from '../components/shared/ProjectCard.vue'
const GitHubHeatmap = defineAsyncComponent(() => import('../components/shared/GitHubHeatmap.vue'))
import FooterSection from '../components/shared/FooterSection.vue'
import TextEffect from '../components/shared/TextEffect.vue'
import ContactForm from '../components/shared/ContactForm.vue'
import { projects } from '../data/projects'
import { links } from '../data/links'
import { stack } from '../data/stack'

const accent = '#fb7185'
const container = ref(null)
const expandedId = ref(null)
const heroReady = ref(false)
const subtitleDone = ref(false)
const showScrollArrow = ref(false)
const dividerEls = ref([])
const projectEls = ref([])
const projectVisible = ref({})
useScrollReveal(container)
const { onMove: magneticMove, onLeave: magneticLeave } = useMagnetic(8)
const heroChars = ['s', 'a', 'k', 'a']

// --- Hero name morph: "saka" ↔ "laurin" ---
const morphWords = ['saka', 'laurin']
const morphProgress = ref(0) // 0 = first word, 1 = second word
let morphRaf = null
let morphPhase = 'hold-first' // 'hold-first' | 'morph-to-second' | 'hold-second' | 'morph-to-first'
let morphTimer = 0
const MORPH_HOLD_MS = 2500
const MORPH_DURATION_MS = 1200

function tickMorph(timestamp) {
  if (!morphTimer) morphTimer = timestamp
  const elapsed = timestamp - morphTimer

  switch (morphPhase) {
    case 'hold-first':
      morphProgress.value = 0
      if (elapsed >= MORPH_HOLD_MS) {
        morphPhase = 'morph-to-second'
        morphTimer = timestamp
      }
      break
    case 'morph-to-second': {
      const t = Math.min(elapsed / MORPH_DURATION_MS, 1)
      morphProgress.value = easeInOutCubic(t)
      if (t >= 1) {
        morphPhase = 'hold-second'
        morphTimer = timestamp
      }
      break
    }
    case 'hold-second':
      morphProgress.value = 1
      if (elapsed >= MORPH_HOLD_MS) {
        morphPhase = 'morph-to-first'
        morphTimer = timestamp
      }
      break
    case 'morph-to-first': {
      const t = Math.min(elapsed / MORPH_DURATION_MS, 1)
      morphProgress.value = 1 - easeInOutCubic(t)
      if (t >= 1) {
        morphPhase = 'hold-first'
        morphTimer = timestamp
      }
      break
    }
  }

  morphRaf = requestAnimationFrame(tickMorph)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Derived filter values for the SVG morph effect
const morphBlur = computed(() => {
  // Max blur at midpoint (progress = 0.5), zero at ends
  const distFromCenter = Math.abs(morphProgress.value - 0.5) * 2 // 0 at center, 1 at edges
  return Math.max(0, 1 - distFromCenter) * 8
})

const morphText1Opacity = computed(() => 1 - morphProgress.value)
const morphText2Opacity = computed(() => morphProgress.value)

// "I'm" label shifts right when "laurin" is showing to clear the 'l' ascender
const imLeft = computed(() => {
  const from = 0.25 // em — default position above "saka"
  const to = 1.8    // em — shifted right to clear "l" in "laurin"
  return (from + (to - from) * morphProgress.value) + 'em'
})

// Measure word widths for smooth container sizing
const morphText1El = ref(null)
const morphText2El = ref(null)
const morphWidth1 = ref(0)
const morphWidth2 = ref(0)

function measureMorphWidths() {
  if (morphText1El.value) morphWidth1.value = morphText1El.value.offsetWidth
  if (morphText2El.value) morphWidth2.value = morphText2El.value.offsetWidth
}

const morphContainerWidth = computed(() => {
  if (!morphWidth1.value || !morphWidth2.value) return 'auto'
  const w = morphWidth1.value + (morphWidth2.value - morphWidth1.value) * morphProgress.value
  return w + 'px'
})

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
  wideLayout.value ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2 relative z-[1]' : 'relative z-[1]',
)

// Timeline: vertical line + horizontal branches (wide mode only)
const gridWrapRef = ref(null)
const timelineHeight = ref(0)
const timelineBranches = ref([])

function updateTimeline() {
  if (!wideLayout.value || !gridWrapRef.value || projectEls.value.length === 0) {
    timelineHeight.value = 0
    timelineBranches.value = []
    return
  }

  // Batch all DOM reads in one pass to avoid forced reflows
  const wrapTop = gridWrapRef.value.getBoundingClientRect().top
  const rects = []
  for (let i = 0; i < projects.length; i++) {
    const el = projectEls.value[i]
    rects.push(el ? el.getBoundingClientRect() : null)
  }

  // Now compute from cached values (no more DOM reads)
  const branches = []
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    if (!r || r.height === 0) continue
    branches.push({ y: r.top + r.height / 2 - wrapTop, isLeft: i % 2 === 0 })
  }

  // Single batch write
  timelineHeight.value = branches.length > 0 ? branches[branches.length - 1].y : 0
  timelineBranches.value = branches
}

let timelineRaf = null
function scheduleTimelineUpdate() {
  if (timelineRaf) cancelAnimationFrame(timelineRaf)
  timelineRaf = requestAnimationFrame(updateTimeline)
}

// Marquee — JS-driven for smooth speed transitions on hover
const marqueeEl = ref(null)
const marqueeHovered = ref(false)

const SPEED_NORMAL = 0.5 // px per frame
const SPEED_SLOW = 0.1
let marqueeOffset = 0
let currentSpeed = SPEED_NORMAL
let marqueeRaf = null
let marqueeHalfWidth = 0 // cached to avoid reading scrollWidth every frame

function tickMarquee() {
  if (!marqueeEl.value) return
  // Lerp speed toward target for smooth transition
  const target = marqueeHovered.value ? SPEED_SLOW : SPEED_NORMAL
  currentSpeed += (target - currentSpeed) * 0.06

  marqueeOffset += currentSpeed
  // Half-width = one full set of items; reset seamlessly
  if (marqueeOffset >= marqueeHalfWidth) marqueeOffset -= marqueeHalfWidth

  marqueeEl.value.style.transform = `translateX(-${marqueeOffset}px)`
  marqueeRaf = requestAnimationFrame(tickMarquee)
}

// Divider replay observer — toggles .visible on/off each time
let dividerObserver = null
// Project card scroll-triggered visibility
let projectObserver = null

onMounted(() => {
  setTimeout(() => { heroReady.value = true }, 400)

  // Measure morph word widths after fonts loaded and DOM settled
  nextTick(() => {
    measureMorphWidths()
    // Re-measure after fonts finish loading
    document.fonts?.ready?.then(measureMorphWidths)
  })
  window.addEventListener('resize', measureMorphWidths)

  // Start morph loop after initial char reveal settles
  setTimeout(() => {
    measureMorphWidths()
    morphRaf = requestAnimationFrame(tickMorph)
  }, 1800)

  // Start marquee loop — cache scrollWidth once to avoid per-frame reflow
  nextTick(() => {
    if (marqueeEl.value) marqueeHalfWidth = marqueeEl.value.scrollWidth / 2
  })
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
    // Initial timeline measurement — run once early, then again after cards settle
    scheduleTimelineUpdate()
    setTimeout(scheduleTimelineUpdate, 900)
  }, 100)

  window.addEventListener('resize', scheduleTimelineUpdate)
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
  // Recalculate timeline after layout switch
  setTimeout(scheduleTimelineUpdate, 350)
}, { flush: 'post' })

// Recalculate timeline when expand/collapse changes card heights
watch(expandedId, () => {
  setTimeout(scheduleTimelineUpdate, 550)
})

// Recalculate timeline as project cards become visible (scroll reveal settles)
watch(projectVisible, () => {
  // Cards animate in with 700ms transition, wait for them to settle
  setTimeout(scheduleTimelineUpdate, 800)
}, { deep: true })

// Scroll-down arrow: show after subtitle animation, hide on first scroll
function onScrollHideArrow() {
  if (window.scrollY > 50) {
    showScrollArrow.value = false
    window.removeEventListener('scroll', onScrollHideArrow)
  }
}

watch(subtitleDone, (done) => {
  if (done) {
    showScrollArrow.value = true
    window.addEventListener('scroll', onScrollHideArrow, { passive: true })
  }
})

onUnmounted(() => {
  dividerObserver?.disconnect()
  projectObserver?.disconnect()
  if (marqueeRaf) cancelAnimationFrame(marqueeRaf)
  if (timelineRaf) cancelAnimationFrame(timelineRaf)
  if (morphRaf) cancelAnimationFrame(morphRaf)
  window.removeEventListener('resize', scheduleTimelineUpdate)
  window.removeEventListener('resize', measureMorphWidths)
  window.removeEventListener('scroll', onScrollHideArrow)
})
</script>

<template>
  <div class="relative overflow-x-hidden">
  <!-- Full-width dotted grid background -->
  <div class="v5-checker-bg-full" />
  <main ref="container" :class="containerClass">
    <!-- Hero with char-reveal + magnetic title -->
    <section class="relative min-h-screen flex flex-col justify-center pb-16 pt-24" :class="wideLayout ? 'lg:pb-20' : ''">
      <div class="mb-6">
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
          <!-- "I'm" label — shifts right when "laurin" shows -->
          <span
            class="v5-hero-im"
            :class="{ visible: heroReady }"
            :style="{ left: imLeft }"
          >I'm</span>
          <!-- SVG morph filter (hidden, referenced by CSS) -->
          <svg class="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter id="hero-morph-filter">
                <feGaussianBlur in="SourceGraphic" :stdDeviation="morphBlur" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>
          <span
            class="hero-morph-container"
            :class="{ visible: heroReady }"
            :style="{ width: morphContainerWidth }"
          >
            <span
              class="hero-morph-words"
              :style="{ filter: morphBlur > 0.1 ? 'url(#hero-morph-filter)' : 'none' }"
            >
              <span
                ref="morphText1El"
                class="hero-morph-text"
                :style="{ opacity: morphText1Opacity }"
              >{{ morphWords[0] }}</span>
              <span
                ref="morphText2El"
                class="hero-morph-text hero-morph-text-alt"
                :style="{ opacity: morphText2Opacity }"
              >{{ morphWords[1] }}</span>
            </span>
          </span><span class="text-accent-rose hero-morph-dot" :class="{ visible: heroReady }">.</span>
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

      <!-- Scroll-down arrow -->
      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500"
        :class="showScrollArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <svg
          class="w-5 h-5 text-zinc-600 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </div>
    </section>

    <!-- Full-page dotted background wrapper (projects → activity) -->
    <div ref="gridWrapRef" :class="wideLayout ? 'v5-project-grid-wrap' : ''" class="relative">

      <!-- Dynamic timeline: vertical line + horizontal branches -->
      <div
        v-if="wideLayout && timelineHeight > 0"
        class="v5-timeline-line hidden lg:block"
        :style="{ height: timelineHeight + 'px' }"
      />
      <div
        v-for="(branch, bi) in timelineBranches"
        :key="'branch-' + bi"
        class="v5-timeline-branch hidden lg:block"
        :class="branch.isLeft ? 'v5-branch-left' : 'v5-branch-right'"
        :style="{ top: branch.y + 'px' }"
      />

    <!-- Projects -->
    <section class="reveal-slow pb-2 relative z-[1]">
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
        <!-- Wide mode zigzag spacers: empty cells to create alternating layout -->
        <!-- Left spacer before odd project -->
        <div v-if="wideLayout && i % 2 === 1" class="hidden lg:block" />

        <!-- Project card — expansion happens inside the same elevated container -->
        <div
          :ref="el => { if (el) projectEls[i] = el }"
          :data-project-idx="i"
          class="transition-all duration-700 ease-out"
          :class="[
            projectVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            wideLayout ? 'v5-project-card-elevated' : ''
          ]"
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

        <!-- Right spacer after even project -->
        <div v-if="wideLayout && i % 2 === 0" class="hidden lg:block" />

        <!-- Divider: compact mode only -->
        <div
          v-if="!wideLayout && i < projects.length - 1"
          :ref="el => { if (el) dividerEls[i] = el }"
          class="divider-draw my-2 w-full h-px bg-accent-rose/20 origin-left"
        />
      </template>
      </div>

    <!-- Tech Stack -->
    <section class="reveal-slow pt-20 pb-2 relative z-[1]">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        stack
      </h2>
    </section>

    <div
      class="reveal-slow stack-marquee-wrap overflow-hidden relative z-[1]"
      :class="wideLayout ? 'v5-section-elevated' : ''"
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
    <section class="reveal-slow pt-20 pb-2 relative z-[1]">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        activity
      </h2>
    </section>

    <div class="reveal-slow relative z-[1] pb-12" :class="wideLayout ? 'v5-section-elevated' : ''">
      <GitHubHeatmap username="sak0a" :accent-color="accent" />
    </div>

    <!-- Contact -->
    <section class="reveal-slow pt-20 pb-2 relative z-[1]">
      <h2
        class="font-bold mb-10 v5-heading-line"
        :class="wideLayout ? 'text-2xl lg:text-3xl' : 'text-2xl'"
        :style="{ '--accent': accent }"
      >
        contact
      </h2>
    </section>

    <div class="reveal-slow relative z-[1] pb-12" :class="wideLayout ? 'v5-section-elevated' : ''">
      <div class="flex items-center gap-3 mb-5">
        <a
          href="mailto:hello@saka.at"
          class="v5-contact-link group/mail inline-flex items-center gap-2"
          :style="{ '--accent': accent }"
        >
          <span class="v5-contact-icon">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </span>
          <span class="v5-contact-text">hello@saka.at</span>
          <span class="v5-contact-arrow">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </span>
        </a>
        <span class="text-zinc-700 text-sm">or</span>
      </div>
      <ContactForm :accent-color="accent" />
    </div>

    </div> <!-- end v5-project-grid-wrap -->

    <div class="h-24 lg:h-32" />
  </main>

    <!-- Footer area -->
    <div :class="footerContainerClass">
      <FooterSection :accent-color="accent" variant="rose">
        <template #links>
          <div class="flex flex-wrap items-center gap-x-1 gap-y-2 mb-8">
            <template v-for="(link, i) in links" :key="link.name">
              <router-link
                v-if="link.internal"
                :to="link.url"
                class="v5-link"
              >
                <span class="v5-link-text text-zinc-500">{{ link.name }}</span>
                <span class="v5-link-line" />
              </router-link>
              <a
                v-else
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
