/**
 * Magnetic hover effect — element subtly follows the cursor.
 *
 * Usage:
 *   const { onMove, onLeave } = useMagnetic(6)
 *   // bind @mousemove="onMove" @mouseleave="onLeave" on the element
 */
export function useMagnetic(maxOffset = 6) {
  function onMove(event) {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = ((event.clientX - centerX) / (rect.width / 2)) * maxOffset
    const dy = ((event.clientY - centerY) / (rect.height / 2)) * maxOffset
    el.style.transform = `translate(${dx}px, ${dy}px)`
    el.style.transition = 'transform 0.15s ease-out'
  }

  function onLeave(event) {
    const el = event.currentTarget
    el.style.transform = 'translate(0, 0)'
    el.style.transition = 'transform 0.4s ease-out'
  }

  return { onMove, onLeave }
}
