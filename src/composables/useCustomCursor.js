import { onMounted, onUnmounted } from 'vue'

/**
 * Custom cursor composable with smooth lerp following.
 *
 * @param {Object} config
 * @param {string} config.variant - 'neon' | 'terminal' | 'rose' | 'brutalist' | 'editorial'
 * @param {string} config.color - accent color hex
 * @param {import('vue').Ref<HTMLElement>} containerRef - ref to scope cursor to
 */
export function useCustomCursor(config, containerRef) {
  let cursorDot = null
  let cursorRing = null
  let animationId = null
  let mouseX = 0
  let mouseY = 0
  let dotX = 0
  let dotY = 0
  let ringX = 0
  let ringY = 0
  let isTouchDevice = false
  let interactiveElements = []
  let cursorStyleEl = null

  // Rose trail state
  let trailParticles = []
  let trailFrame = 0
  const TRAIL_MAX = 25
  let prevMouseX = 0
  let prevMouseY = 0

  const LERP_DOT = 0.15
  const LERP_RING = 0.08

  function lerp(start, end, factor) {
    return start + (end - start) * factor
  }

  function onMouseMove(e) {
    mouseX = e.clientX
    mouseY = e.clientY
  }

  function onMouseEnterInteractive() {
    if (cursorRing) cursorRing.classList.add('cursor-hover')
    if (cursorDot) cursorDot.classList.add('cursor-hover')
  }

  function onMouseLeaveInteractive() {
    if (cursorRing) cursorRing.classList.remove('cursor-hover')
    if (cursorDot) cursorDot.classList.remove('cursor-hover')
  }

  function spawnTrailParticle() {
    if (trailParticles.length >= TRAIL_MAX) return
    const particle = document.createElement('div')
    particle.className = 'cursor-trail-particle'
    particle.style.setProperty('--cursor-color', config.color)
    particle.style.setProperty('--trail-pos', `translate(${dotX}px, ${dotY}px)`)
    particle.style.transform = `translate(${dotX}px, ${dotY}px)`
    document.body.appendChild(particle)
    trailParticles.push(particle)
    particle.addEventListener('animationend', () => {
      particle.remove()
      trailParticles = trailParticles.filter((p) => p !== particle)
    })
  }

  function onMouseDown() {
    if (!cursorRing || config.variant !== 'rose') return
    cursorRing.style.setProperty('--ring-pos', `translate(${dotX}px, ${dotY}px)`)
    // Restart click animation via class toggle (no forced reflow)
    cursorRing.classList.remove('cursor-click')
    requestAnimationFrame(() => {
      cursorRing.classList.add('cursor-click')
    })
  }

  function animate() {
    dotX = lerp(dotX, mouseX, LERP_DOT)
    dotY = lerp(dotY, mouseY, LERP_DOT)
    ringX = lerp(ringX, mouseX, LERP_RING)
    ringY = lerp(ringY, mouseY, LERP_RING)

    if (cursorDot) {
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`
    }
    if (cursorRing) {
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`
    }

    // Rose trail: velocity-aware spawning
    if (config.variant === 'rose') {
      const dx = mouseX - prevMouseX
      const dy = mouseY - prevMouseY
      const velocity = Math.sqrt(dx * dx + dy * dy)
      prevMouseX = mouseX
      prevMouseY = mouseY

      trailFrame++
      // Fast movement → spawn every frame, slow → every 5th, idle → skip
      if (velocity > 12 && trailFrame % 1 === 0) {
        spawnTrailParticle()
      } else if (velocity > 4 && trailFrame % 3 === 0) {
        spawnTrailParticle()
      } else if (velocity > 1 && trailFrame % 5 === 0) {
        spawnTrailParticle()
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  function bindInteractiveElements() {
    const container = containerRef?.value || document
    const elements = container.querySelectorAll('a, button, [role="button"], .cursor-pointer')
    elements.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterInteractive)
      el.addEventListener('mouseleave', onMouseLeaveInteractive)
    })
    interactiveElements = Array.from(elements)
  }

  onMounted(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isTouchDevice = true
      return
    }

    // Hide native cursor with a single <style> rule instead of per-element inline styles
    cursorStyleEl = document.createElement('style')
    cursorStyleEl.id = 'custom-cursor-hide'
    cursorStyleEl.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(cursorStyleEl)

    // Create cursor elements
    cursorDot = document.createElement('div')
    cursorDot.className = `custom-cursor-dot cursor-${config.variant}`
    cursorDot.style.setProperty('--cursor-color', config.color)

    cursorRing = document.createElement('div')
    cursorRing.className = `custom-cursor-ring cursor-${config.variant}`
    cursorRing.style.setProperty('--cursor-color', config.color)

    document.body.appendChild(cursorDot)
    document.body.appendChild(cursorRing)

    document.addEventListener('mousemove', onMouseMove)
    if (config.variant === 'rose') {
      document.addEventListener('mousedown', onMouseDown)
    }
    animationId = requestAnimationFrame(animate)

    // Bind interactive hover detection after DOM settles
    setTimeout(bindInteractiveElements, 500)
  })

  onUnmounted(() => {
    if (isTouchDevice) return

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mousedown', onMouseDown)
    if (animationId) cancelAnimationFrame(animationId)
    if (cursorDot) cursorDot.remove()
    if (cursorRing) cursorRing.remove()

    // Cleanup trail particles
    trailParticles.forEach((p) => p.remove())
    trailParticles = []

    // Remove cursor-hide style rule (restores native cursor)
    if (cursorStyleEl) {
      cursorStyleEl.remove()
      cursorStyleEl = null
    }

    // Unbind interactive elements
    interactiveElements.forEach((el) => {
      el.removeEventListener('mouseenter', onMouseEnterInteractive)
      el.removeEventListener('mouseleave', onMouseLeaveInteractive)
    })
    interactiveElements = []
  })
}
