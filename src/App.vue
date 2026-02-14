<script setup>
import NavVersionSwitcher from './components/shared/NavVersionSwitcher.vue'
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <NavVersionSwitcher />
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
