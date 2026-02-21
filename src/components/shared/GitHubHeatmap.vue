<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

const props = defineProps({
  username: { type: String, required: true },
  accentColor: { type: String, default: '#fb7185' },
})

// Responsive cell sizing
const containerWidth = ref(0)
let resizeObserverInstance = null

const contributions = ref([])
const totalCount = ref(0)
const displayCount = ref(0)
const loading = ref(true)
const error = ref(false)
const heatmapRoot = ref(null)
const heatmapWrapper = ref(null)
const scrollContainer = ref(null)
let observer = null
let visibilityObserver = null

// Tooltip state
const tooltip = ref({ visible: false, x: 0, y: 0, count: 0, date: '' })
let hideTimer = null

function showTooltip(event, day) {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  const wrapperRect = heatmapWrapper.value.getBoundingClientRect()
  const wrapperWidth = wrapperRect.width

  let x = event.clientX - wrapperRect.left
  const y = event.clientY - wrapperRect.top - 40

  const tooltipHalfWidth = 120
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
  hideTimer = setTimeout(() => {
    tooltip.value.visible = false
  }, 80)
}

// 4 opacity levels from accent color
const levels = computed(() => [
  'transparent',
  props.accentColor + '20',
  props.accentColor + '50',
  props.accentColor + '90',
  props.accentColor,
])

// Group contributions into weeks (columns)
const weeks = computed(() => {
  if (!contributions.value.length) return []

  const cols = []
  let currentWeek = []

  contributions.value.forEach((day) => {
    const d = new Date(day.date)
    const dow = d.getDay()

    if (dow === 0 && currentWeek.length > 0) {
      cols.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  })

  if (currentWeek.length > 0) cols.push(currentWeek)
  return cols
})

// Dynamic cell sizing — fill the container width exactly
const cellStep = computed(() => {
  const w = containerWidth.value
  const wks = weeks.value.length
  if (!wks || !w) return 14
  const step = Math.floor(w / wks)
  return Math.max(10, step)
})

const cellSize = computed(() => Math.max(7, cellStep.value - Math.max(2, Math.round(cellStep.value * 0.2))))
const cellRadius = computed(() => Math.max(2, Math.round(cellSize.value * 0.2)))

const svgWidth = computed(() => weeks.value.length * cellStep.value + 2)
const svgHeight = computed(() => 7 * cellStep.value + 20)

// Month labels
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
        x: wi * cellStep.value,
      })
    }
  })

  return labels
})

// Year separator lines — drawn between last week of prev year and first week of current year
const yearSeparator = computed(() => {
  if (!weeks.value.length) return null

  for (let wi = 1; wi < weeks.value.length; wi++) {
    const prevDate = new Date(weeks.value[wi - 1][0].date)
    const currDate = new Date(weeks.value[wi][0].date)
    if (currDate.getFullYear() > prevDate.getFullYear()) {
      return {
        x: wi * cellStep.value - Math.floor(cellStep.value / 2),
        year: currDate.getFullYear(),
      }
    }
  }
  return null
})

// Date range label
const dateRange = computed(() => {
  if (!contributions.value.length) return ''
  const first = new Date(contributions.value[0].date)
  const last = new Date(contributions.value[contributions.value.length - 1].date)
  const fmt = (d) => d.toLocaleString('en', { month: 'short', year: 'numeric' })
  return `${fmt(first)} – ${fmt(last)}`
})

async function fetchContributions() {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const prevYear = currentYear - 1
    const todayStr = now.toISOString().split('T')[0]

    // Fetch previous full year + current year in parallel
    const [resPrev, resCurr] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${props.username}?y=${prevYear}`),
      fetch(`https://github-contributions-api.jogruber.de/v4/${props.username}?y=${currentYear}`),
    ])

    if (!resPrev.ok || !resCurr.ok) throw new Error('Failed to fetch')

    const [dataPrev, dataCurr] = await Promise.all([resPrev.json(), resCurr.json()])

    // Full previous year (Jan 1 – Dec 31) + current year up to today
    const prevContribs = dataPrev.contributions.filter((d) => {
      const date = new Date(d.date)
      return date.getFullYear() === prevYear
    })

    const currContribs = dataCurr.contributions.filter((d) => {
      return d.date <= todayStr
    })

    const allContribs = [...prevContribs, ...currContribs]

    contributions.value = allContribs
    totalCount.value = allContribs.reduce((sum, d) => sum + d.count, 0)

    // Switch to rendered state so the heatmap DOM exists
    loading.value = false

    await nextTick()

    // Measure container first, then scroll
    measureContainer()

    // Scroll to end (most recent)
    scrollToEnd()

    // IntersectionObserver for count animation
    setupScrollTrigger()

    // Watch for resizes
    if (scrollContainer.value) {
      resizeObserverInstance = new ResizeObserver(() => measureContainer())
      resizeObserverInstance.observe(scrollContainer.value)
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!heatmapRoot.value) return

  // Defer API fetch until the component is near the viewport
  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        visibilityObserver.disconnect()
        visibilityObserver = null
        fetchContributions()
      }
    },
    { rootMargin: '200px' },
  )
  visibilityObserver.observe(heatmapRoot.value)
})

function measureContainer() {
  if (scrollContainer.value) {
    containerWidth.value = scrollContainer.value.clientWidth
  }
}

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
    { threshold: 0.2 },
  )
  observer.observe(heatmapRoot.value)
}

onUnmounted(() => {
  if (visibilityObserver) {
    visibilityObserver.disconnect()
    visibilityObserver = null
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (resizeObserverInstance) {
    resizeObserverInstance.disconnect()
    resizeObserverInstance = null
  }
})

function scrollToEnd() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
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
        <AnimatedNumber
          :value="displayCount"
          :spring-options="{ stiffness: 100, damping: 80, mass: 0.5 }"
          class="text-2xl font-bold"
          :style="{ color: accentColor }"
        />
        <span class="text-sm text-zinc-500">contributions</span>
        <span class="text-xs text-zinc-700">{{ dateRange }}</span>
      </div>

      <!-- Wrapper for tooltip positioning -->
      <div ref="heatmapWrapper" class="relative">
        <!-- Scrollable SVG container -->
        <div ref="scrollContainer" class="overflow-x-auto pb-2 heatmap-scroll">
          <svg
            :width="svgWidth"
            :height="svgHeight"
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

            <!-- Year separator line -->
            <g v-if="yearSeparator">
              <line
                :x1="yearSeparator.x"
                :x2="yearSeparator.x"
                y1="14"
                :y2="7 * cellStep + 16"
                :stroke="accentColor + '30'"
                stroke-width="1"
                stroke-dasharray="3 3"
              />
            </g>

            <!-- Day cells -->
            <g transform="translate(0, 16)">
              <template v-for="(week, wi) in weeks" :key="wi">
                <rect
                  v-for="day in week"
                  :key="day.date"
                  :x="wi * cellStep"
                  :y="new Date(day.date).getDay() * cellStep"
                  :width="cellSize"
                  :height="cellSize"
                  :rx="cellRadius"
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

        <!-- Tooltip -->
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

      <!-- Legend -->
      <div class="flex items-center justify-between mt-2">
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
/* Smooth tooltip */
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
