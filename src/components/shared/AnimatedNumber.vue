<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// ---------------------------------------------------------------------------
// Spring physics engine – sub-stepped for mobile stability
// Fixed-size physics steps (4 ms) prevent numerical explosion when
// requestAnimationFrame fires after long gaps (background tabs, throttling).
// ---------------------------------------------------------------------------

export type SpringOptions = {
  stiffness?: number
  damping?: number
  mass?: number
}

const FIXED_DT = 0.004 // 4 ms fixed physics step
const MAX_STEPS = 100 // cap sub-steps per frame (= 400 ms max catch-up)
const MAX_DURATION = 5000 // hard timeout — snap to target

function createSpring(options: SpringOptions = {}) {
  const { stiffness = 280, damping = 18, mass = 0.3 } = options

  let current = 0
  let target = 0
  let velocity = 0
  let rafId: number | null = null
  let onUpdateCb: ((value: number) => void) | null = null
  let lastTime: number | null = null
  let startTime: number | null = null

  function cancel() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function tick(time: number) {
    rafId = null

    if (lastTime === null) {
      lastTime = time
      if (startTime === null) startTime = time
      rafId = requestAnimationFrame(tick)
      return
    }

    // Hard timeout — snap to target if running too long
    if (startTime !== null && time - startTime > MAX_DURATION) {
      current = target
      velocity = 0
      onUpdateCb?.(current)
      lastTime = null
      startTime = null
      return
    }

    // Elapsed time since last frame, capped to avoid runaway on resume
    const frameDt = Math.min((time - lastTime) / 1000, MAX_STEPS * FIXED_DT)
    lastTime = time

    // Sub-step: run physics in fixed increments for numerical stability
    let remaining = frameDt
    while (remaining > 0) {
      const dt = Math.min(remaining, FIXED_DT)
      const displacement = current - target
      const springForce = -stiffness * displacement
      const dampingForce = -damping * velocity
      const acceleration = (springForce + dampingForce) / mass

      velocity += acceleration * dt
      current += velocity * dt
      remaining -= dt
    }

    // Settle check — scale threshold with target magnitude
    const settleThreshold = Math.max(0.5, Math.abs(target) * 0.001)
    if (Math.abs(velocity) < settleThreshold && Math.abs(current - target) < settleThreshold) {
      current = target
      velocity = 0
      onUpdateCb?.(current)
      lastTime = null
      startTime = null
      return
    }

    onUpdateCb?.(current)
    rafId = requestAnimationFrame(tick)
  }

  return {
    set(newTarget: number) {
      target = newTarget
      lastTime = null
      startTime = null
      cancel()
      rafId = requestAnimationFrame(tick)
    },
    initialize(value: number) {
      current = value
      target = value
      velocity = 0
    },
    subscribe(callback: (value: number) => void) {
      onUpdateCb = callback
    },
    destroy() {
      cancel()
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
