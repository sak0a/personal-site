<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import TextMorphInput from './TextMorphInput.vue'

const props = defineProps({
  accentColor: { type: String, default: '#fb7185' },
})

const formRef = ref(null)
const formVisible = ref(false)

// Form state
const name = ref('')
const email = ref('')
const message = ref('')
const focusedField = ref(null)
const sending = ref(false)
const sent = ref(false)

// Progressive reveal — each field unlocks the next
const nameValid = computed(() => name.value.trim().length >= 2)
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const messageValid = computed(() => message.value.trim().length >= 1)

const showEmail = computed(() => nameValid.value)
const showMessage = computed(() => nameValid.value && emailValid.value)
const showSubmit = computed(() => nameValid.value && emailValid.value && messageValid.value)

// Step progress (0-3)
const step = computed(() => {
  if (showSubmit.value) return 3
  if (showMessage.value) return 2
  if (showEmail.value) return 1
  return 0
})

// Intersection observer for initial reveal
let observer = null

onMounted(async () => {
  await nextTick()
  if (!formRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          formVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  observer.observe(formRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

async function handleSubmit() {
  if (!nameValid.value || !emailValid.value || !messageValid.value) return
  sending.value = true
  // Simulate send delay — replace with real endpoint later
  await new Promise((r) => setTimeout(r, 1200))
  sending.value = false
  sent.value = true
}
</script>

<template>
  <div ref="formRef" class="v5-contact-form" :style="{ '--accent': accentColor }">
    <!-- Sent state -->
    <div v-if="sent" class="v5-cf-sent">
      <svg class="w-6 h-6 mb-3" :style="{ color: accentColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p class="text-zinc-300 text-sm font-medium">Message sent — I'll get back to you soon.</p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="v5-cf-fields-progressive">
      <!-- Step dots -->
      <div class="v5-cf-steps">
        <span
          v-for="s in 3"
          :key="s"
          class="v5-cf-step-dot"
          :class="{ active: step >= s }"
          :style="{ '--accent': accentColor }"
        />
      </div>

      <!-- Name — always visible once scrolled in -->
      <div
        class="v5-cf-field"
        :class="{ visible: formVisible, focused: focusedField === 'name', filled: name.length > 0 }"
      >
        <label class="v5-cf-label" for="cf-name">Your name</label>
        <TextMorphInput
          v-model="name"
          type="text"
          id="cf-name"
          autocomplete="name"
          :accent-color="accentColor"
          @focus="focusedField = 'name'"
          @blur="focusedField = null"
        />
        <span class="v5-cf-line" />
      </div>

      <!-- Email — revealed once name is valid -->
      <div
        class="v5-cf-field v5-cf-progressive"
        :class="{
          visible: formVisible && showEmail,
          focused: focusedField === 'email',
          filled: email.length > 0,
          'v5-cf-hidden': !showEmail,
        }"
      >
        <label class="v5-cf-label" for="cf-email">your@email.com</label>
        <TextMorphInput
          v-model="email"
          type="email"
          id="cf-email"
          autocomplete="email"
          :accent-color="accentColor"
          @focus="focusedField = 'email'"
          @blur="focusedField = null"
        />
        <span class="v5-cf-line" />
      </div>

      <!-- Message — revealed once email is valid -->
      <div
        class="v5-cf-field v5-cf-field-textarea v5-cf-progressive"
        :class="{
          visible: formVisible && showMessage,
          focused: focusedField === 'message',
          filled: message.length > 0,
          'v5-cf-hidden': !showMessage,
        }"
      >
        <label class="v5-cf-label" for="cf-message">What's on your mind?</label>
        <TextMorphInput
          v-model="message"
          type="textarea"
          id="cf-message"
          :rows="3"
          :accent-color="accentColor"
          @focus="focusedField = 'message'"
          @blur="focusedField = null"
        />
        <span class="v5-cf-line" />
      </div>

      <!-- Submit — revealed once message has content -->
      <div
        class="v5-cf-submit-wrap v5-cf-progressive"
        :class="{ visible: formVisible && showSubmit, 'v5-cf-hidden': !showSubmit }"
      >
        <button
          type="submit"
          class="v5-cf-submit"
          :disabled="sending"
        >
          <span class="v5-cf-submit-text">{{ sending ? 'Sending...' : 'Send message' }}</span>
          <span class="v5-cf-submit-arrow">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
