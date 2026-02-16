<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  active: Boolean,
  getPosition: Function,
  getVelocity: Function,
})

const ballEl = ref(null)
const trailCanvas = ref(null)
let ctx = null
let rafId = null

// Trail ring buffer
const TRAIL_LENGTH = 20
const trail = []

function resizeCanvas() {
  if (!trailCanvas.value) return
  trailCanvas.value.width = window.innerWidth
  trailCanvas.value.height = window.innerHeight
}

function render() {
  if (!props.active || !props.getPosition) return

  const pos = props.getPosition()
  const vel = props.getVelocity()
  const viewX = pos.x - window.scrollX
  const viewY = pos.y - window.scrollY

  // Update ball position
  if (ballEl.value) {
    ballEl.value.style.transform = `translate(${viewX}px, ${viewY}px)`
  }

  // Record trail position
  const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy)
  if (speed > 0.5) {
    trail.push({ x: viewX, y: viewY, age: 0 })
    if (trail.length > TRAIL_LENGTH) trail.shift()
  }

  // Draw trail on canvas
  if (ctx && trailCanvas.value) {
    ctx.clearRect(0, 0, trailCanvas.value.width, trailCanvas.value.height)
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i]
      p.age++
      const life = 1 - p.age / 25
      if (life <= 0) continue
      const radius = 4 * life
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(251, 113, 133, ${0.5 * life})`
      ctx.fill()
    }
    // Remove dead particles
    while (trail.length > 0 && trail[0].age > 25) trail.shift()
  }

  rafId = requestAnimationFrame(render)
}

watch(() => props.active, (active) => {
  if (active) {
    trail.length = 0
    resizeCanvas()
    rafId = requestAnimationFrame(render)
  } else {
    if (rafId) cancelAnimationFrame(rafId)
    trail.length = 0
    if (ctx) ctx.clearRect(0, 0, trailCanvas.value?.width || 0, trailCanvas.value?.height || 0)
  }
})

onMounted(() => {
  if (trailCanvas.value) {
    ctx = trailCanvas.value.getContext('2d')
    resizeCanvas()
  }
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div v-show="active" class="game-ball-overlay">
    <canvas ref="trailCanvas" class="ball-trail-canvas" />
    <div ref="ballEl" class="game-ball" />
  </div>
</template>

<style scoped>
.game-ball-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9990;
}

.ball-trail-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.game-ball {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ff8fa3, #fb7185 50%, #e11d48);
  box-shadow:
    0 0 12px #fb7185,
    0 0 24px rgba(251, 113, 133, 0.5),
    0 0 48px rgba(251, 113, 133, 0.25);
  will-change: transform;
}
</style>
