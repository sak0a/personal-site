import { onMounted, onUnmounted, nextTick } from 'vue'

export function useScrollReveal(containerRef, selector = '.reveal, .reveal-left, .reveal-scale, .reveal-slow, .reveal-scale-tilt, .separator-draw, .underline-grow, .divider-draw', options = {}) {
  let observer = null

  const defaults = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  }

  onMounted(async () => {
    await nextTick()

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, defaults)

    const container = containerRef?.value || document
    const elements = container.querySelectorAll(selector)
    elements.forEach((el) => observer.observe(el))
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
}
