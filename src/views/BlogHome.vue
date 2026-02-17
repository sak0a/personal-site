<script setup>
import { computed } from 'vue'
import BlogLayout from '../components/shared/BlogLayout.vue'
import { getAllPosts } from '../data/blog'

const accent = '#fb7185'
const posts = computed(() => getAllPosts())

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <BlogLayout>
    <!-- Header -->
    <section class="reveal-slow mb-16">
      <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-4">
        blog<span class="text-accent-rose">.</span>
      </h1>
      <p class="text-zinc-500 text-lg">
        Thoughts on design, development, and building things.
      </p>
    </section>

    <!-- Post list -->
    <div class="space-y-6">
      <router-link
        v-for="post in posts"
        :key="post.slug"
        :to="{ name: 'blog-post', params: { slug: post.slug } }"
        class="block reveal-slow"
      >
        <article
          class="v5-section-elevated group transition-all duration-300
                 hover:border-[rgba(251,113,133,0.1)]"
        >
          <!-- Meta -->
          <div class="flex items-center gap-3 mb-3">
            <time class="text-xs text-zinc-600 font-mono">
              {{ formatDate(post.date) }}
            </time>
            <span class="text-zinc-800">&middot;</span>
            <span class="text-xs text-zinc-600">{{ post.readTime }}</span>
          </div>

          <!-- Title -->
          <h2
            class="text-xl md:text-2xl font-bold mb-2 transition-colors
                   duration-300 group-hover:text-accent-rose"
          >
            {{ post.title }}
          </h2>

          <!-- Subtitle -->
          <p v-if="post.subtitle" class="text-zinc-500 text-sm mb-3">
            {{ post.subtitle }}
          </p>

          <!-- Excerpt -->
          <p class="text-zinc-400 text-sm leading-relaxed">
            {{ post.excerpt }}
          </p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-xs px-2.5 py-0.5 rounded-full"
              :style="{
                backgroundColor: accent + '15',
                color: accent,
              }"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </router-link>
    </div>
  </BlogLayout>
</template>
