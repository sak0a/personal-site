import { ref } from 'vue'
import { useBallPhysics } from './useBallPhysics'

/**
 * Game orchestrator: manages activation, RAF loop, input handling,
 * auto-scroll, and card interaction for the ball game.
 */
export function useBallGame(platformRegistry) {
  const gameActive = ref(false)
  const highlightedCard = ref(null)
  const touchingCard = ref(null)
  const physics = useBallPhysics()

  let rafId = null
  let scrollStyleEl = null
  let lastTriggeredCard = null

  // Input state
  const input = { left: false, right: false, up: false, down: false }

  // Card interaction callback (set by the consumer)
  let onCardHit = null

  function activate(startX, startY) {
    gameActive.value = true
    physics.init(startX, startY)
    physics.setWorldBounds(0, document.documentElement.scrollWidth)
    document.body.classList.add('game-mode')
    injectScrollOverride()

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    input.left = false
    input.right = false
    input.up = false
    input.down = false
    lastTriggeredCard = null
    highlightedCard.value = null

    rafId = requestAnimationFrame(gameLoop)
  }

  function deactivate() {
    gameActive.value = false
    document.body.classList.remove('game-mode')
    removeScrollOverride()

    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    highlightedCard.value = null
    touchingCard.value = null
    lastTriggeredCard = null
  }

  function onKeyDown(e) {
    if (!gameActive.value) return

    switch (e.key) {
      case 'a': case 'A': case 'ArrowLeft':
        input.left = true
        e.preventDefault()
        break
      case 'd': case 'D': case 'ArrowRight':
        input.right = true
        e.preventDefault()
        break
      case 'w': case 'W': case 'ArrowUp':
        input.up = true
        e.preventDefault()
        break
      case 's': case 'S': case 'ArrowDown':
        input.down = true
        e.preventDefault()
        break
      case 'Escape':
        deactivate()
        break
    }
  }

  function onKeyUp(e) {
    if (!gameActive.value) return

    switch (e.key) {
      case 'a': case 'A': case 'ArrowLeft':
        input.left = false
        break
      case 'd': case 'D': case 'ArrowRight':
        input.right = false
        break
      case 'w': case 'W': case 'ArrowUp':
        input.up = false
        break
      case 's': case 'S': case 'ArrowDown':
        input.down = false
        break
    }
  }

  function gameLoop() {
    // 1. Gather platform rects
    const rects = platformRegistry.getRects()
    physics.setPlatforms(rects)

    // 2. Apply input (both axes — free movement, no gravity)
    const dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const dirY = (input.down ? 1 : 0) - (input.up ? 1 : 0)
    physics.setInput(dirX, dirY)

    // 3. Physics tick
    physics.tick()

    // 4. Auto-scroll
    updateAutoScroll()

    // 5. Check card interactions
    checkCardInteractions(rects)

    // 6. Next frame
    rafId = requestAnimationFrame(gameLoop)
  }

  function updateAutoScroll() {
    const pos = physics.getPosition()
    const viewportY = pos.y - window.scrollY
    const vh = window.innerHeight
    const MARGIN_TOP = vh * 0.3
    const MARGIN_BOTTOM = vh * 0.3
    const MAX_SCROLL_SPEED = 8

    let scrollDelta = 0

    if (viewportY < MARGIN_TOP) {
      const urgency = 1 - viewportY / MARGIN_TOP
      scrollDelta = -urgency * MAX_SCROLL_SPEED
    } else if (viewportY > vh - MARGIN_BOTTOM) {
      const urgency = (viewportY - (vh - MARGIN_BOTTOM)) / MARGIN_BOTTOM
      scrollDelta = urgency * MAX_SCROLL_SPEED
    }

    if (scrollDelta !== 0) {
      window.scrollBy(0, scrollDelta)
    }
  }

  function checkCardInteractions(rects) {
    const pos = physics.getPosition()
    const radius = physics.getBallRadius()
    let currentCard = null

    for (const rect of rects) {
      if (rect.type !== 'card') continue

      // Check if ball overlaps this card
      const closestX = Math.max(rect.left, Math.min(pos.x, rect.right))
      const closestY = Math.max(rect.top, Math.min(pos.y, rect.bottom))
      const dx = pos.x - closestX
      const dy = pos.y - closestY
      if (dx * dx + dy * dy <= radius * radius) {
        currentCard = rect.id
        break
      }
    }

    // Update touching card — drives expand/collapse in Version5
    if (currentCard !== touchingCard.value) {
      touchingCard.value = currentCard

      // Highlight + scroll on first contact with a new card
      if (currentCard && currentCard !== lastTriggeredCard) {
        lastTriggeredCard = currentCard
        highlightedCard.value = currentCard

        // Scroll card to center
        const cardRect = rects.find(r => r.id === currentCard)
        if (cardRect) {
          const cardCenterY = cardRect.top + cardRect.height / 2
          const targetScrollY = cardCenterY - window.innerHeight / 2
          removeScrollOverride()
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' })
          setTimeout(injectScrollOverride, 600)
        }

        // Clear highlight after 1.5s
        const triggeredCard = currentCard
        setTimeout(() => {
          if (highlightedCard.value === triggeredCard) {
            highlightedCard.value = null
          }
        }, 1500)

        if (onCardHit) onCardHit(currentCard)
      }
    }

    if (!currentCard) {
      lastTriggeredCard = null
    }
  }

  function injectScrollOverride() {
    if (scrollStyleEl) return
    scrollStyleEl = document.createElement('style')
    scrollStyleEl.textContent = 'html { scroll-behavior: auto !important; }'
    document.head.appendChild(scrollStyleEl)
  }

  function removeScrollOverride() {
    if (scrollStyleEl) {
      scrollStyleEl.remove()
      scrollStyleEl = null
    }
  }

  function setOnCardHit(callback) {
    onCardHit = callback
  }

  return {
    gameActive,
    highlightedCard,
    touchingCard,
    activate,
    deactivate,
    getPosition: physics.getPosition,
    getVelocity: physics.getVelocity,
    setOnCardHit,
  }
}
