import { ref, onUnmounted } from 'vue'

/**
 * Typewriter effect composable.
 * Returns a reactive displayText that types out characters one by one.
 *
 * Usage:
 *   const { displayText, start } = useTypewriter('projects', 50)
 *   // call start() when element enters viewport
 */
export function useTypewriter(text, speed = 50) {
  const displayText = ref('')
  let index = 0
  let timer = null
  let started = false

  function start() {
    if (started) return
    started = true
    index = 0
    displayText.value = ''
    timer = setInterval(() => {
      if (index < text.length) {
        displayText.value = text.slice(0, index + 1)
        index++
      } else {
        clearInterval(timer)
        timer = null
      }
    }, speed)
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { displayText, start }
}
