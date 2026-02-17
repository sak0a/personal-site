<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '../../composables/useScrollReveal'
import FooterSection from './FooterSection.vue'
import { links } from '../../data/links'

const accent = '#fb7185'
const container = ref(null)
useScrollReveal(container)
</script>

<template>
  <div class="relative overflow-x-hidden">
    <div class="v5-checker-bg-full" />

    <!-- Fixed top nav -->
    <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-900/50">
      <div class="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <router-link to="/" class="v5-link">
          <span class="v5-link-text text-zinc-400 text-sm font-semibold tracking-tight">saka<span class="text-accent-rose">.</span></span>
          <span class="v5-link-line" />
        </router-link>
        <router-link to="/blog" class="v5-link">
          <span class="v5-link-text text-zinc-500 text-sm">blog</span>
          <span class="v5-link-line" />
        </router-link>
      </div>
    </nav>

    <!-- Content -->
    <main ref="container" class="max-w-3xl mx-auto px-6 pt-24 pb-16 relative z-[1]">
      <slot />
    </main>

    <!-- Footer -->
    <div class="max-w-3xl mx-auto px-6">
      <FooterSection :accent-color="accent" variant="rose">
        <template #links>
          <div class="flex flex-wrap items-center gap-x-1 gap-y-2 mb-8">
            <template v-for="(link, i) in links" :key="link.name">
              <router-link
                v-if="link.internal"
                :to="link.url"
                class="v5-link"
              >
                <span class="v5-link-text text-zinc-500">{{ link.name }}</span>
                <span class="v5-link-line" />
              </router-link>
              <a
                v-else
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="v5-link"
              >
                <span class="v5-link-text text-zinc-500">{{ link.name }}</span>
                <span class="v5-link-line" />
              </a>
              <span
                v-if="i < links.length - 1"
                class="slash-morph text-accent-rose/40 mx-1 cursor-default"
              >
                <span class="slash-morph-from">/</span>
                <span class="slash-morph-to absolute inset-0 flex items-center justify-center">~</span>
              </span>
            </template>
          </div>
        </template>
      </FooterSection>
    </div>
  </div>
</template>
