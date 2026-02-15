<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ---------------------------------------------------------------------------
// Types & presets
// ---------------------------------------------------------------------------

export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide'
export type PerType = 'word' | 'char' | 'line'

const props = withDefaults(
  defineProps<{
    text: string
    per?: PerType
    preset?: PresetType
    trigger?: boolean
    delay?: number
    speedReveal?: number
    speedSegment?: number
    segmentWrapperClassName?: string
    tag?: string
  }>(),
  {
    per: 'word',
    preset: 'fade',
    trigger: true,
    delay: 0,
    speedReveal: 1,
    speedSegment: 1,
    segmentWrapperClassName: '',
    tag: 'p',
  },
)

const emit = defineEmits<{
  animationComplete: []
  animationStart: []
}>()

const defaultStaggerTimes: Record<PerType, number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
}

type PresetKeyframes = {
  hidden: Record<string, string | number>
  visible: Record<string, string | number>
}

const presetKeyframeMap: Record<PresetType, PresetKeyframes> = {
  blur: {
    hidden: { opacity: 0, filter: 'blur(12px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  'fade-in-blur': {
    hidden: { opacity: 0, transform: 'translateY(20px)', filter: 'blur(12px)' },
    visible: { opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' },
  },
  scale: {
    hidden: { opacity: 0, transform: 'scale(0)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slide: {
    hidden: { opacity: 0, transform: 'translateY(20px)' },
    visible: { opacity: 1, transform: 'translateY(0px)' },
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitText(text: string, per: PerType): string[] {
  if (per === 'line') return text.split('\n')
  return text.split(/(\s+)/)
}

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const containerRef = ref<HTMLElement | null>(null)
const visible = ref(props.trigger)
let animations: Animation[] = []
let hasStarted = false
let exitTimeout: ReturnType<typeof setTimeout> | null = null

const segments = computed(() => splitText(props.text, props.per))
const stagger = computed(() => defaultStaggerTimes[props.per] / props.speedReveal)
const baseDuration = computed(() => 0.3 / props.speedSegment)
const presetKf = computed(() => presetKeyframeMap[props.preset])

// ---------------------------------------------------------------------------
// Animation logic
// ---------------------------------------------------------------------------

function animate() {
  const container = containerRef.value
  if (!container) return

  animations.forEach((a) => a.cancel())
  animations = []
  hasStarted = false

  const segEls = container.querySelectorAll<HTMLElement>('[data-segment]')
  if (segEls.length === 0) return

  segEls.forEach((el, i) => {
    Object.assign(el.style, presetKf.value.hidden)

    const segmentDelay = props.delay + i * stagger.value
    const anim = el.animate(
      [presetKf.value.hidden as Keyframe, presetKf.value.visible as Keyframe],
      {
        duration: baseDuration.value * 1000,
        delay: segmentDelay * 1000,
        fill: 'forwards',
        easing: 'ease-out',
      },
    )

    if (i === 0) {
      anim.ready.then(() => {
        if (!hasStarted) {
          hasStarted = true
          emit('animationStart')
        }
      })
    }

    animations.push(anim)
  })

  const lastAnim = animations[animations.length - 1]
  if (lastAnim) {
    lastAnim.finished.then(() => {
      emit('animationComplete')
    })
  }
}

function animateExit() {
  const container = containerRef.value
  if (!container) return

  animations.forEach((a) => a.cancel())
  animations = []

  const segEls = container.querySelectorAll<HTMLElement>('[data-segment]')
  const total = segEls.length

  segEls.forEach((el, i) => {
    const reverseIndex = total - 1 - i
    const segmentDelay = reverseIndex * stagger.value

    const anim = el.animate(
      [presetKf.value.visible as Keyframe, presetKf.value.hidden as Keyframe],
      {
        duration: baseDuration.value * 1000,
        delay: segmentDelay * 1000,
        fill: 'forwards',
        easing: 'ease-in',
      },
    )

    animations.push(anim)
  })
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------

watch(
  () => props.trigger,
  async (val) => {
    if (exitTimeout !== null) {
      clearTimeout(exitTimeout)
      exitTimeout = null
    }

    if (val) {
      visible.value = true
      await nextTick()
      requestAnimationFrame(() => animate())
    } else {
      animateExit()
      const totalExitTime =
        (segments.value.length * stagger.value + baseDuration.value) * 1000
      exitTimeout = setTimeout(() => {
        visible.value = false
        exitTimeout = null
      }, totalExitTime)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  animations.forEach((a) => a.cancel())
  if (exitTimeout !== null) clearTimeout(exitTimeout)
})
</script>

<template>
  <component :is="tag" v-if="visible || trigger" ref="containerRef">
    <span v-if="per !== 'line'" class="sr-only">{{ text }}</span>

    <template v-for="(segment, index) in segments" :key="index">
      <!-- Line mode -->
      <template v-if="per === 'line'">
        <span
          data-segment
          class="block"
          :style="presetKf.hidden as any"
        >
          {{ segment }}
        </span>
      </template>

      <!-- Word mode -->
      <template v-else-if="per === 'word'">
        <span
          v-if="!segmentWrapperClassName"
          data-segment
          aria-hidden="true"
          class="inline-block whitespace-pre"
          :style="presetKf.hidden as any"
        >
          {{ segment }}
        </span>
        <span
          v-else
          class="inline-block"
          :class="segmentWrapperClassName"
        >
          <span
            data-segment
            aria-hidden="true"
            class="inline-block whitespace-pre"
            :style="presetKf.hidden as any"
          >
            {{ segment }}
          </span>
        </span>
      </template>

      <!-- Char mode -->
      <template v-else>
        <span
          v-if="!segmentWrapperClassName"
          class="inline-block whitespace-pre"
        >
          <span
            v-for="(char, charIndex) in segment.split('')"
            :key="charIndex"
            data-segment
            aria-hidden="true"
            class="inline-block whitespace-pre"
            :style="presetKf.hidden as any"
          >
            {{ char }}
          </span>
        </span>
        <span
          v-else
          class="inline-block"
          :class="segmentWrapperClassName"
        >
          <span class="inline-block whitespace-pre">
            <span
              v-for="(char, charIndex) in segment.split('')"
              :key="charIndex"
              data-segment
              aria-hidden="true"
              class="inline-block whitespace-pre"
              :style="presetKf.hidden as any"
            >
              {{ char }}
            </span>
          </span>
        </span>
      </template>
    </template>
  </component>
</template>
