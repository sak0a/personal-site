<script setup>
import { useRouter } from 'vue-router'
import { useCustomCursor } from './composables/useCustomCursor'

const accent = '#fb7185'
const { rebindInteractiveElements } = useCustomCursor({ variant: 'rose', color: accent })

const router = useRouter()
router.afterEach(() => {
  rebindInteractiveElements()
})
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
