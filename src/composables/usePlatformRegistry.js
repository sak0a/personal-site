/**
 * Platform registry for ball game collision surfaces.
 * DOM elements register as collidable surfaces; getRects() provides
 * page-coordinate bounding rects for the physics engine each tick.
 */
export function usePlatformRegistry() {
  const platforms = new Map()

  return {
    register(id, el, type = 'solid') {
      platforms.set(id, { el, type })
    },

    unregister(id) {
      platforms.delete(id)
    },

    getRects() {
      const rects = []
      for (const [id, { el, type }] of platforms) {
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) continue
        rects.push({
          id,
          type,
          left: r.left + window.scrollX,
          top: r.top + window.scrollY,
          right: r.right + window.scrollX,
          bottom: r.bottom + window.scrollY,
          width: r.width,
          height: r.height,
        })
      }
      return rects
    },

    clear() {
      platforms.clear()
    },
  }
}
