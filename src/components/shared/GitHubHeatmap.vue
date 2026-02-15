<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

const props = defineProps({
  username: { type: String, required: true },
  accentColor: { type: String, default: '#fb7185' },
})

const contributions = ref([])
const totalCount = ref(0)
const displayCount = ref(0) // stays 0 until scrolled into view
const loading = ref(true)
const error = ref(false)
const heatmapRoot = ref(null)
let observer = null

// Tooltip state — always mounted, uses opacity + CSS transitions for smooth feel
const tooltip = ref({ visible: false, x: 0, y: 0, count: 0, date: '' })
const heatmapWrapper = ref(null)
const scrollContainer = ref(null)
let hideTimer = null

function showTooltip(event, day) {
  // Cancel any pending hide so moving between cells stays smooth
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  const wrapperRect = heatmapWrapper.value.getBoundingClientRect()
  const wrapperWidth = wrapperRect.width

  // Position relative to wrapper (which has overflow:visible for tooltip)
  let x = event.clientX - wrapperRect.left
  const y = event.clientY - wrapperRect.top - 40

  // Clamp x so tooltip doesn't overflow left/right of wrapper
  const tooltipHalfWidth = 120 // rough estimate
  if (x < tooltipHalfWidth) x = tooltipHalfWidth
  if (x > wrapperWidth - tooltipHalfWidth) x = wrapperWidth - tooltipHalfWidth

  tooltip.value = {
    visible: true,
    x,
    y,
    count: day.count,
    date: formatDate(day.date),
  }
}

function hideTooltip() {
  // Short delay before hiding — prevents flicker when moving between adjacent cells
  hideTimer = setTimeout(() => {
    tooltip.value.visible = false
  }, 80)
}

// Generate 4 opacity levels from the accent color
const levels = computed(() => [
  'transparent',
  props.accentColor + '20',
  props.accentColor + '50',
  props.accentColor + '90',
  props.accentColor,
])

// Group contributions into weeks (columns) for the heatmap grid
const weeks = computed(() => {
  if (!contributions.value.length) return []

  const cols = []
  let currentWeek = []

  contributions.value.forEach((day) => {
    const d = new Date(day.date)
    const dow = d.getDay() // 0=Sun, 6=Sat

    if (dow === 0 && currentWeek.length > 0) {
      cols.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  })

  if (currentWeek.length > 0) cols.push(currentWeek)
  return cols
})

// Month labels positioned above the grid
const monthLabels = computed(() => {
  if (!weeks.value.length) return []

  const labels = []
  let lastMonth = -1

  weeks.value.forEach((week, wi) => {
    const firstDay = week[0]
    const d = new Date(firstDay.date)
    const month = d.getMonth()

    if (month !== lastMonth) {
      lastMonth = month
      labels.push({
        text: d.toLocaleString('en', { month: 'short' }),
        x: wi * 14,
      })
    }
  })

  return labels
})

onMounted(async () => {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${props.username}?y=last`
    )
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()

    // Filter to exactly the last 12 months (from today back 365 days)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const cutoff = new Date(today)
    cutoff.setFullYear(cutoff.getFullYear() - 1)

    const filtered = data.contributions.filter((d) => {
      const date = new Date(d.date)
      return date >= cutoff && date <= today
    })

    contributions.value = filtered
    totalCount.value = filtered.reduce((sum, d) => sum + d.count, 0)

    // Scroll to the right (most recent) after render
    await nextTick()
    scrollToEnd()

    // Start IntersectionObserver to trigger count animation on scroll into view
    setupScrollTrigger()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

// Trigger animated count only when the section scrolls into view
function setupScrollTrigger() {
  if (!heatmapRoot.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        displayCount.value = totalCount.value
        observer.disconnect()
        observer = null
      }
    },
    { threshold: 0.2 }
  )
  observer.observe(heatmapRoot.value)
}

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// Reliable scroll-to-end with a small retry to handle late layout
function scrollToEnd() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
  // Double-check after a frame in case layout wasn't fully settled
  requestAnimationFrame(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
    }
  })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div ref="heatmapRoot" class="github-heatmap">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center gap-2 text-zinc-600 text-sm">
      <div class="w-3 h-3 rounded-full animate-pulse" :style="{ backgroundColor: accentColor }" />
      Loading contributions...
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-sm text-zinc-600">
      Could not load GitHub activity.
    </div>

    <!-- Heatmap -->
    <div v-else>
      <div class="flex items-baseline gap-3 mb-4">
   
        <!--<span class="text-2xl font-bold" :style="{ color: accentColor }">{{ totalCount.toLocaleString() }}</span>-->
        <AnimatedNumber
        :value="displayCount"
        :spring-options="{ stiffness: 100, damping: 80, mass: 0.5 }"
        class="text-2xl font-bold"
        :style="{ color: accentColor }" />
        <span class="text-sm text-zinc-500">contributions in the last 12 months</span>
      </div>

      <!-- Wrapper for tooltip positioning (no overflow hidden) -->
      <div ref="heatmapWrapper" class="relative">
        <!-- Scrollable SVG container -->
        <div ref="scrollContainer" class="overflow-x-auto pb-2 heatmap-scroll">
          <svg
            :width="weeks.length * 14 + 2"
            :height="7 * 14 + 20"
            class="block"
          >
            <!-- Month labels -->
            <text
              v-for="label in monthLabels"
              :key="label.text + label.x"
              :x="label.x"
              y="10"
              class="fill-zinc-600"
              style="font-size: 10px"
            >{{ label.text }}</text>

            <!-- Day cells -->
            <g transform="translate(0, 16)">
              <template v-for="(week, wi) in weeks" :key="wi">
                <rect
                  v-for="day in week"
                  :key="day.date"
                  :x="wi * 14"
                  :y="new Date(day.date).getDay() * 14"
                  width="11"
                  height="11"
                  rx="2"
                  :fill="levels[day.level]"
                  :stroke="day.level === 0 ? accentColor + '10' : 'none'"
                  stroke-width="1"
                  class="heatmap-cell"
                  @mouseenter="showTooltip($event, day)"
                  @mousemove="showTooltip($event, day)"
                  @mouseleave="hideTooltip"
                />
              </template>
            </g>
          </svg>
        </div>

        <!-- Tooltip — always mounted, smoothly transitions position + opacity -->
        <div
          class="heatmap-tooltip absolute pointer-events-none z-50 px-3 py-1.5 rounded-md text-xs whitespace-nowrap"
          :class="{ active: tooltip.visible }"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translateX(-50%)',
            backgroundColor: '#18181b',
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 8px ${accentColor}10`,
          }"
        >
          <span class="font-bold" :style="{ color: accentColor }">{{ tooltip.count }}</span>
          <span class="text-zinc-400"> contribution{{ tooltip.count !== 1 ? 's' : '' }}</span>
          <span class="text-zinc-600 ml-1.5">{{ tooltip.date }}</span>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="flex items-center justify-between mt-2">
        <!-- Legend -->
        <div class="flex items-center gap-2 text-xs text-zinc-600">
          <span>Less</span>
          <div
            v-for="(color, i) in levels"
            :key="i"
            class="w-[11px] h-[11px] rounded-sm"
            :style="{ backgroundColor: color, border: i === 0 ? `1px solid ${accentColor}10` : 'none' }"
          />
          <span>More</span>
        </div>
        <span class="text-xs text-zinc-700">← scroll for older</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth tooltip — always mounted, transitions position + opacity */
.heatmap-tooltip {
  opacity: 0;
  transition: opacity 0.15s ease, left 0.12s ease, top 0.1s ease;
}
.heatmap-tooltip.active {
  opacity: 1;
}

/* Thin custom scrollbar */
.heatmap-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.heatmap-scroll::-webkit-scrollbar {
  height: 4px;
}
.heatmap-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.heatmap-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.heatmap-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
