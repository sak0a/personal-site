<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// ---------------------------------------------------------------------------
// Spring physics engine (self-contained, no external dependencies)
// ---------------------------------------------------------------------------

export type SpringOptions = {
  stiffness?: number
  damping?: number
  mass?: number
}

function createSpring(options: SpringOptions = {}) {
  const { stiffness = 280, damping = 18, mass = 0.3 } = options

  let current = 0
  let target = 0
  let velocity = 0
  let animating = false
  let rafId: number | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let onUpdateCb: ((value: number) => void) | null = null
  let onCompleteCb: (() => void) | null = null
  let lastTime: number | null = null

  function schedule() {
    if (typeof document !== 'undefined' && document.hidden) {
      timeoutId = setTimeout(() => {
        timeoutId = null
        tick(performance.now())
      }, 16)
    } else {
      rafId = requestAnimationFrame(tick)
    }
  }

  function cancelScheduled() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function tick(time: number) {
    rafId = null
    timeoutId = null

    if (lastTime === null) {
      lastTime = time
      schedule()
      return
    }

    const dt = Math.min((time - lastTime) / 1000, 0.064)
    lastTime = time

    const displacement = current - target
    const springForce = -stiffness * displacement
    const dampingForce = -damping * velocity
    const acceleration = (springForce + dampingForce) / mass

    velocity += acceleration * dt
    current += velocity * dt

    if (Math.abs(velocity) < 0.01 && Math.abs(current - target) < 0.001) {
      current = target
      velocity = 0
      animating = false
      onUpdateCb?.(current)
      onCompleteCb?.()
      lastTime = null
      return
    }

    onUpdateCb?.(current)
    schedule()
  }

  return {
    set(newTarget: number) {
      target = newTarget
      lastTime = null
      cancelScheduled()
      animating = true
      schedule()
    },
    initialize(value: number) {
      current = value
      target = value
      velocity = 0
    },
    subscribe(callback: (value: number) => void) {
      onUpdateCb = callback
    },
    onComplete(callback: () => void) {
      onCompleteCb = callback
    },
    destroy() {
      cancelScheduled()
      animating = false
      lastTime = null
    },
    get() {
      return current
    },
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const props = withDefaults(
  defineProps<{
    value: number
    springOptions?: SpringOptions
  }>(),
  {
    springOptions: () => ({}),
  },
)

const display = ref(Math.round(props.value).toLocaleString())

let spring: ReturnType<typeof createSpring> | null = null

onMounted(() => {
  spring = createSpring(props.springOptions)
  spring.initialize(props.value)
  spring.subscribe((v) => {
    display.value = Math.round(v).toLocaleString()
  })
})

watch(
  () => props.value,
  (newVal) => {
    spring?.set(newVal)
  },
)

onUnmounted(() => {
  spring?.destroy()
  spring = null
})
</script>

<template>
  <span class="tabular-nums">{{ display }}</span>
</template>
