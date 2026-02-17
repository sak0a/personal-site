<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogLayout from '../components/shared/BlogLayout.vue'
import { getPostBySlug } from '../data/blog'

const route = useRoute()
const router = useRouter()
const accent = '#fb7185'

const post = computed(() => getPostBySlug(route.params.slug))

if (!post.value) {
  router.replace({ name: 'blog' })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <BlogLayout v-if="post">
    <!-- Header -->
    <header class="reveal-slow mb-12">
      <!-- Back link -->
      <router-link
        :to="{ name: 'blog' }"
        class="v5-link group !inline-flex items-center gap-1.5 mb-8"
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
        <span class="v5-link-text text-zinc-500 text-sm">Back to blog</span>
        <span class="v5-link-line" />
      </router-link>

      <!-- Meta -->
      <div class="flex items-center gap-3 mb-4">
        <time class="text-xs text-zinc-600 font-mono">
          {{ formatDate(post.date) }}
        </time>
        <span class="text-zinc-800">&middot;</span>
        <span class="text-xs text-zinc-600">{{ post.readTime }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3">
        {{ post.title }}
      </h1>
      <p v-if="post.subtitle" class="text-zinc-500 text-lg">
        {{ post.subtitle }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mt-5">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="text-xs px-2.5 py-0.5 rounded-full"
          :style="{ backgroundColor: accent + '15', color: accent }"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Gradient divider -->
      <div
        class="w-full h-px mt-8"
        :style="{ background: `linear-gradient(to right, ${accent}, transparent)` }"
      />
    </header>

    <!-- Content blocks -->
    <article class="space-y-6">
      <template v-for="(block, i) in post.content" :key="i">
        <!-- Paragraph -->
        <p
          v-if="block.type === 'paragraph'"
          class="reveal-slow text-zinc-300 leading-relaxed text-[15px]"
        >
          {{ block.text }}
        </p>

        <!-- Heading h2 -->
        <h2
          v-else-if="block.type === 'heading' && block.level === 2"
          class="reveal-slow text-xl md:text-2xl font-bold mt-10 mb-4 v5-heading-line"
          :style="{ '--accent': accent }"
        >
          {{ block.text }}
        </h2>

        <!-- Heading h3 -->
        <h3
          v-else-if="block.type === 'heading' && block.level === 3"
          class="reveal-slow text-lg font-bold mt-8 mb-3"
          :style="{ color: accent }"
        >
          {{ block.text }}
        </h3>

        <!-- Code block -->
        <div
          v-else-if="block.type === 'code'"
          class="reveal-slow v5-section-elevated"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-zinc-600 font-mono uppercase tracking-wider">
              {{ block.language }}
            </span>
          </div>
          <pre
            class="text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed"
          ><code>{{ block.code }}</code></pre>
        </div>

        <!-- List -->
        <ul
          v-else-if="block.type === 'list'"
          class="reveal-slow space-y-3 pl-1"
        >
          <li
            v-for="(item, li) in block.items"
            :key="li"
            class="text-zinc-300 text-[15px] leading-relaxed flex items-start gap-3"
          >
            <span
              class="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: accent }"
            />
            <span>{{ item }}</span>
          </li>
        </ul>

        <!-- Quote -->
        <blockquote
          v-else-if="block.type === 'quote'"
          class="reveal-slow border-l-2 pl-5 py-2"
          :style="{ borderColor: accent }"
        >
          <p class="text-zinc-400 italic text-[15px] leading-relaxed">
            {{ block.text }}
          </p>
        </blockquote>
      </template>
    </article>

    <!-- Footer spacer -->
    <div class="h-24" />
  </BlogLayout>
</template>
