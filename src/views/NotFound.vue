<script setup>
import { useScrollReveal } from '../composables/useScrollReveal'

useScrollReveal()
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center px-6">
    <div class="v5-checker-bg-full" />
    <div class="relative z-10 text-center max-w-lg">
      <!-- 404 heading -->
      <h1 class="reveal-slow text-8xl md:text-9xl font-black tracking-tighter mb-2">
        404<span style="color: #fb7185">.</span>
      </h1>

      <!-- Subtitle -->
      <p class="reveal-slow text-zinc-500 text-lg md:text-xl mb-4">
        Page not found
      </p>

      <!-- Message -->
      <p class="reveal-slow text-zinc-600 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
        The page you are looking for does not exist or has been moved.
      </p>

      <!-- Navigation links -->
      <div class="reveal-slow flex items-center justify-center gap-8">
        <!-- Back home -->
        <router-link
          :to="{ name: 'home' }"
          class="group inline-flex items-center gap-1.5 relative"
        >
          <svg
            class="w-3.5 h-3.5 text-zinc-500 transition-all duration-300 ease-in-out group-hover:text-[#fb7185] group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
            />
          </svg>
          <span class="text-zinc-500 text-sm transition-all duration-300 ease-in-out group-hover:text-[#fb7185] group-hover:-translate-y-0.5 inline-block">Back home</span>
          <span class="absolute bottom-0 left-0 w-full h-px bg-[#fb7185] scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100 pointer-events-none" />
        </router-link>

        <!-- Read the blog -->
        <router-link
          :to="{ name: 'blog' }"
          class="group inline-flex items-center gap-1.5 relative"
        >
          <span class="text-zinc-500 text-sm transition-all duration-300 ease-in-out group-hover:text-[#fb7185] group-hover:-translate-y-0.5 inline-block">Read the blog</span>
          <svg
            class="w-3.5 h-3.5 text-zinc-500 transition-all duration-300 ease-in-out group-hover:text-[#fb7185] group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
            />
          </svg>
          <span class="absolute bottom-0 left-0 w-full h-px bg-[#fb7185] scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100 pointer-events-none" />
        </router-link>
      </div>
    </div>
  </div>
</template>
