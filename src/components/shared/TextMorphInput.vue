<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

/**
 * An input/textarea that renders its value as individually-animated characters
 * using the same Web Animations API technique as TextEffect.vue.
 *
 * Each new character blur-fades in. The real input sits on top (with transparent
 * text) so native selection, caret, and line-break behaviour all work natively.
 * The mirror below provides the animated character visuals.
 */

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' }, // 'text' | 'email' | 'textarea'
  id: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
  rows: { type: [Number, String], default: 4 },
  accentColor: { type: String, default: '#fb7185' },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const inputRef = ref(null)
const mirrorRef = ref(null)
const isFocused = ref(false)

// ---- Web Animations API — matching TextEffect presets ----
const CHAR_STAGGER = 0.025
const CHAR_DURATION = 250

const hiddenKf = { opacity: 0, filter: 'blur(12px)', transform: 'translateY(4px)' }
const visibleKf = { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }

let activeAnimations = []

function cancelAll() {
  activeAnimations.forEach((a) => a.cancel())
  activeAnimations = []
}

// Split value into lines, each line into characters (preserves newlines)
const lines = computed(() => {
  return props.modelValue.split('\n')
})

// Watch value changes and animate new characters
watch(
  () => props.modelValue,
  async (newVal, oldVal) => {
    const newLen = newVal.length
    const oldLen = (oldVal || '').length

    await nextTick()
    if (!mirrorRef.value) return

    if (newLen > oldLen) {
      const spans = mirrorRef.value.querySelectorAll('[data-char]')

      // Figure out which spans are new
      // Count all chars in old value (including newlines which aren't spans)
      // We need the flat index of chars that are rendered as spans
      const oldChars = (oldVal || '').replace(/\n/g, '')
      const newChars = newVal.replace(/\n/g, '')
      const oldSpanCount = oldChars.length
      const newSpanCount = newChars.length

      for (let i = oldSpanCount; i < newSpanCount; i++) {
        const el = spans[i]
        if (!el) continue

        Object.assign(el.style, {
          opacity: '0',
          filter: 'blur(12px)',
          transform: 'translateY(4px)',
        })

        const delay = (i - oldSpanCount) * CHAR_STAGGER * 1000
        const anim = el.animate([hiddenKf, visibleKf], {
          duration: CHAR_DURATION,
          delay,
          fill: 'forwards',
          easing: 'ease-out',
        })
        activeAnimations.push(anim)
      }
    }
  },
)

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function onFocus() {
  isFocused.value = true
  emit('focus')
}

function onBlur() {
  isFocused.value = false
  emit('blur')
}

function focusInput() {
  inputRef.value?.focus()
}

defineExpose({ focusInput })

onUnmounted(() => {
  cancelAll()
})
</script>

<template>
  <div
    class="v5-tmi-wrap"
    :class="{ focused: isFocused }"
    :style="{ '--accent': accentColor }"
    @click="focusInput"
  >
    <!-- Mirror below: per-character animated spans -->
    <div
      ref="mirrorRef"
      class="v5-tmi-mirror"
      :class="type === 'textarea' ? 'v5-tmi-mirror-multi' : ''"
      aria-hidden="true"
    >
      <template v-for="(line, li) in lines" :key="'line-' + li">
        <!-- Line break before every line except the first -->
        <br v-if="li > 0" />
        <!-- Characters in this line -->
        <span
          v-for="(char, ci) in line.split('')"
          :key="'c-' + li + '-' + ci"
          data-char
          class="v5-tmi-char"
        >{{ char === ' ' ? '\u00A0' : char }}</span>
      </template>
    </div>

    <!-- Real input on top — transparent text, native caret + selection -->
    <component
      :is="type === 'textarea' ? 'textarea' : 'input'"
      ref="inputRef"
      :type="type !== 'textarea' ? type : undefined"
      :id="id"
      :autocomplete="autocomplete"
      :rows="type === 'textarea' ? rows : undefined"
      :value="modelValue"
      class="v5-tmi-real"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>
