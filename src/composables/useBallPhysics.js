/**
 * 2D ball physics engine for the portfolio ball game.
 * Handles gravity, velocity, friction, bounce, and AABB collision.
 * All positions are in page (document) coordinates.
 */
export function useBallPhysics() {
  let x = 0
  let y = 0
  let vx = 0
  let vy = 0
  let grounded = false

  const BALL_RADIUS = 10
  const GRAVITY = 0
  const FRICTION = 0.97
  const BOUNCE_FACTOR = 0.5
  const MOVE_ACCEL = 0.45
  const JUMP_IMPULSE = -13
  const MAX_VX = 7
  const MAX_VY = 7
  const MIN_BOUNCE_VEL = 0.4

  let inputX = 0
  let inputY = 0
  let platforms = []
  let worldLeft = 0
  let worldRight = Infinity

  function init(startX, startY) {
    x = startX
    y = startY
    vx = 0
    vy = 0
    grounded = false
  }

  function setInput(dirX, dirY = 0) {
    inputX = dirX
    inputY = dirY
  }

  function setPlatforms(rects) {
    platforms = rects
  }

  function tick() {
    // Apply gravity
    vy += GRAVITY

    // Apply input (both axes — zero-gravity free movement)
    vx += inputX * MOVE_ACCEL
    vy += inputY * MOVE_ACCEL

    // Clamp velocities
    vx = Math.max(-MAX_VX, Math.min(MAX_VX, vx))
    vy = Math.max(-MAX_VY, Math.min(MAX_VY, vy))

    // Apply friction to both axes
    vx *= FRICTION
    vy *= FRICTION

    // Stop tiny drift
    if (Math.abs(vx) < 0.05) vx = 0
    if (Math.abs(vy) < 0.05) vy = 0

    // Tentative new position
    let nextX = x + vx
    let nextY = y + vy

    // Reset grounded — will be set to true if we land on something
    grounded = false

    // Collision detection against platforms (AABB with Minkowski expansion)
    for (const rect of platforms) {
      // Expand the platform rect by ball radius on all sides
      const eLeft = rect.left - BALL_RADIUS
      const eRight = rect.right + BALL_RADIUS
      const eTop = rect.top - BALL_RADIUS
      const eBottom = rect.bottom + BALL_RADIUS

      // Check if the ball center is inside the expanded rect
      if (nextX >= eLeft && nextX <= eRight && nextY >= eTop && nextY <= eBottom) {
        // Find the smallest penetration to resolve
        const overlapLeft = nextX - eLeft
        const overlapRight = eRight - nextX
        const overlapTop = nextY - eTop
        const overlapBottom = eBottom - nextY

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapTop) {
          // Collided from the top (ball is above the platform)
          nextY = eTop
          if (vy > 0) {
            vy = Math.abs(vy) > MIN_BOUNCE_VEL ? -vy * BOUNCE_FACTOR : 0
            grounded = Math.abs(vy) < 2
          }
        } else if (minOverlap === overlapBottom) {
          // Collided from the bottom (ball hit the ceiling of the platform)
          nextY = eBottom
          if (vy < 0) vy = -vy * BOUNCE_FACTOR
        } else if (minOverlap === overlapLeft) {
          // Collided from the left
          nextX = eLeft
          vx = Math.abs(vx) > MIN_BOUNCE_VEL ? -vx * BOUNCE_FACTOR : 0
        } else if (minOverlap === overlapRight) {
          // Collided from the right
          nextX = eRight
          vx = Math.abs(vx) > MIN_BOUNCE_VEL ? -vx * BOUNCE_FACTOR : 0
        }
      }
    }

    // World boundary clamping (horizontal)
    if (nextX < worldLeft + BALL_RADIUS) {
      nextX = worldLeft + BALL_RADIUS
      vx = Math.abs(vx) > MIN_BOUNCE_VEL ? -vx * BOUNCE_FACTOR : 0
    } else if (nextX > worldRight - BALL_RADIUS) {
      nextX = worldRight - BALL_RADIUS
      vx = Math.abs(vx) > MIN_BOUNCE_VEL ? -vx * BOUNCE_FACTOR : 0
    }

    x = nextX
    y = nextY
  }

  function setWorldBounds(left, right) {
    worldLeft = left
    worldRight = right
  }

  return {
    getPosition: () => ({ x, y }),
    getVelocity: () => ({ vx, vy }),
    isGrounded: () => grounded,
    getBallRadius: () => BALL_RADIUS,
    init,
    setInput,
    setPlatforms,
    setWorldBounds,
    tick,
  }
}
