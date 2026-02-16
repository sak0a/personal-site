<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

// ---------------------------------------------------------------------------
// Spring keyframes engine (self-contained, no external dependencies)
// ---------------------------------------------------------------------------

type SpringOptions = {
  stiffness?: number
  damping?: number
  mass?: number
}

function springKeyframes(
  from: number,
  to: number,
  options: SpringOptions = {},
  steps = 60,
): number[] {
  const { stiffness = 280, damping = 18, mass = 0.3 } = options
  const values: number[] = [from]
  let current = from
  let velocity = 0
  const dt = 1 / 60

  for (let i = 0; i < steps; i++) {
    const displacement = current - to
    const springForce = -stiffness * displacement
    const dampingForce = -damping * velocity
    const acceleration = (springForce + dampingForce) / mass

    velocity += acceleration * dt
    current += velocity * dt
    values.push(current)

    if (Math.abs(velocity) < 0.01 && Math.abs(current - to) < 0.001) {
      values.push(to)
      break
    }
  }

  if (values[values.length - 1] !== to) {
    values.push(to)
  }

  return values
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SPRING_CONFIG: SpringOptions = {
  stiffness: 280,
  damping: 18,
  mass: 0.3,
}

const props = defineProps<{
  text: string
}>()

// ---------------------------------------------------------------------------
// Character tracking with unique IDs
// ---------------------------------------------------------------------------

function getCharId(char: string, counts: Record<string, number>): string {
  const lowerChar = char.toLowerCase()
  counts[lowerChar] = (counts[lowerChar] || 0) + 1
  return `${lowerChar}${counts[lowerChar]}`
}

const currentText = ref(props.text)

const characters = computed(() => {
  const charCounts: Record<string, number> = {}
  return currentText.value.split('').map((char) => {
    const id = getCharId(char, charCounts)
    return {
      id,
      label: char === ' ' ? '\u00A0' : char,
    }
  })
})

// ---------------------------------------------------------------------------
// Per-character ref tracking
// ---------------------------------------------------------------------------

const charRefs = new Map<string, HTMLSpanElement>()
const prevPositions = ref(new Map<string, DOMRect>())
let animations: Animation[] = []

function setCharRef(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    charRefs.set(id, el)
  } else {
    charRefs.delete(id)
  }
}

// ---------------------------------------------------------------------------
// FLIP animation on text change
// ---------------------------------------------------------------------------

watch(
  () => props.text,
  async (newText) => {
    if (newText === currentText.value) return

    // FIRST: capture current positions
    const positions = new Map<string, DOMRect>()
    charRefs.forEach((el, id) => {
      if (el) positions.set(id, el.getBoundingClientRect())
    })
    prevPositions.value = positions

    // Update text (triggers re-render)
    currentText.value = newText

    // Wait for DOM update
    await nextTick()

    // LAST + INVERT + PLAY
    animations.forEach((a) => a.cancel())
    animations = []

    charRefs.forEach((el, id) => {
      if (!el) return
      const prevRect = prevPositions.value.get(id)
      const newRect = el.getBoundingClientRect()

      if (prevRect) {
        // Persisting character — FLIP animation
        const dx = prevRect.left - newRect.left
        const dy = prevRect.top - newRect.top

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          const xFrames = springKeyframes(dx, 0, SPRING_CONFIG, 60)
          const yFrames = springKeyframes(dy, 0, SPRING_CONFIG, 60)
          const keyframes = xFrames.map((x, i) => ({
            transform: `translate(${x}px, ${yFrames[i] ?? 0}px)`,
          }))

          const anim = el.animate(keyframes, {
            duration: xFrames.length * (1000 / 60),
            easing: 'linear',
            fill: 'none',
          })
          animations.push(anim)
        }
      } else {
        // New character — fade in
        const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          easing: 'ease-out',
          fill: 'none',
        })
        animations.push(anim)
      }
    })

    prevPositions.value = new Map()
  },
)

onUnmounted(() => {
  animations.forEach((a) => a.cancel())
})
</script>

<template>
  <p :aria-label="text">
    <span
      v-for="character in characters"
      :key="character.id"
      :ref="(el) => setCharRef(character.id, el)"
      class="inline-block"
      aria-hidden="true"
    >
      {{ character.label }}
    </span>
  </p>
</template>
