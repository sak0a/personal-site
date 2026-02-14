/**
 * 3D card tilt effect on mouse move.
 * Usage: bind @mousemove="onTiltMove($event, $el)" and @mouseleave="onTiltLeave($el)"
 * on the card wrapper div. Add style="transform-style: preserve-3d; perspective: 800px"
 * to the parent container.
 */
export function useCardTilt(maxDeg = 4) {
  function onTiltMove(event, el) {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -maxDeg
    const rotateY = ((x - centerX) / centerX) * maxDeg
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    el.style.transition = 'transform 0.1s ease'
  }

  function onTiltLeave(el) {
    if (!el) return
    el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    el.style.transition = 'transform 0.4s ease'
  }

  return { onTiltMove, onTiltLeave }
}
