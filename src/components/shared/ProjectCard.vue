<script setup>
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'timeline',
    validator: (v) => ['timeline', 'horizontal', 'large-type', 'brutalist', 'editorial'].includes(v),
  },
  accentColor: {
    type: String,
    default: '#22d3ee',
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  staggerTitle: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])

const iconPaths = {
  github: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z',
  external: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
  chevron: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}
</script>

<template>
  <!-- Timeline variant (Version 1) -->
  <div v-if="variant === 'timeline'" class="relative pl-8 pb-12 group cursor-pointer" @click="emit('toggle')">
    <!-- Ping ring -->
    <div
      class="absolute left-0 top-2 w-3 h-3 rounded-full opacity-40 animate-ping"
      :style="{ backgroundColor: accentColor }"
    />
    <div
      class="absolute left-0 top-2 w-3 h-3 rounded-full border-2 transition-all duration-300"
      :style="{ borderColor: accentColor, backgroundColor: expanded ? accentColor : 'transparent' }"
    />
    <div class="absolute left-[5px] top-5 bottom-0 w-px bg-zinc-800" />
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-mono text-zinc-600">{{ project.year }}</span>
      <svg class="w-3.5 h-3.5 text-zinc-600 transition-transform duration-300" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.chevron" />
      </svg>
    </div>
    <div class="flex flex-col md:flex-row gap-4">
      <img
        :src="project.image"
        :alt="project.name"
        class="object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-all duration-300"
        :class="expanded ? 'w-full md:w-64 h-48' : 'w-full md:w-48 h-32'"
      />
      <div class="flex-1">
        <h3 class="text-xl font-bold mb-1" :style="{ color: accentColor }">{{ project.name }}</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">{{ project.description }}</p>
        <div v-if="!expanded" class="flex flex-wrap gap-2 mt-3">
          <span v-for="tag in project.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500">{{ tag }}</span>
        </div>

        <!-- Expandable details -->
        <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }">
          <div class="overflow-hidden">
            <div class="pt-3 transition-opacity duration-200" :class="expanded ? 'opacity-100 delay-150' : 'opacity-0'">
              <div class="flex items-center gap-4 mb-3">
                <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.external" /></svg>
                  {{ getDomain(project.url) }}
                </a>
                <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.github" /></svg>
                  Source
                </a>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="lang in project.languages" :key="lang" class="text-xs px-2.5 py-0.5 rounded-full" :style="{ backgroundColor: accentColor + '15', color: accentColor }">{{ lang }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Horizontal variant (Version 4) -->
  <div
    v-else-if="variant === 'horizontal'"
    class="min-w-[320px] md:min-w-[380px] snap-center bg-zinc-950 rounded-xl overflow-hidden border-t-2 flex-shrink-0 group cursor-pointer"
    :style="{ borderTopColor: accentColor }"
    @click="emit('toggle')"
  >
    <img
      :src="project.image"
      :alt="project.name"
      class="w-full h-44 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
    />
    <div class="p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs text-zinc-600 font-mono">{{ project.year }}</span>
        <svg class="w-3.5 h-3.5 text-zinc-600 transition-transform duration-300" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.chevron" />
        </svg>
      </div>
      <h3 class="text-lg font-bold mt-1 mb-2" :style="{ color: accentColor }">{{ project.name }}</h3>
      <p class="text-sm text-zinc-400 leading-relaxed">{{ project.description }}</p>
      <div class="flex flex-wrap gap-1.5 mt-3">
        <span v-for="tag in project.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500">{{ tag }}</span>
      </div>

      <!-- Expandable details -->
      <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }">
        <div class="overflow-hidden">
          <div class="pt-3 transition-opacity duration-200" :class="expanded ? 'opacity-100 delay-150' : 'opacity-0'">
            <div class="flex items-center gap-4 mb-3">
              <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.external" /></svg>
                {{ getDomain(project.url) }}
              </a>
              <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.github" /></svg>
                Source
              </a>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="lang in project.languages" :key="lang" class="text-xs px-2.5 py-0.5 rounded-full" :style="{ backgroundColor: accentColor + '15', color: accentColor }">{{ lang }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Large type variant (Version 5) -->
  <div v-else-if="variant === 'large-type'" class="py-8 group cursor-pointer" @click="emit('toggle')">
    <div class="flex items-center justify-between">
      <span class="text-sm text-zinc-600 v5-year">{{ project.year }}</span>
      <svg class="w-4 h-4 text-zinc-600 v5-chevron" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.chevron" />
      </svg>
    </div>
    <!-- Staggered char hover title -->
    <h3
      v-if="staggerTitle"
      class="v5-title-stagger text-2xl md:text-3xl font-bold mt-1 mb-2"
      :style="{ '--accent': accentColor, color: expanded ? accentColor : '' }"
    >
      <span
        v-for="(char, ci) in project.name.split('')"
        :key="ci"
        :style="{ transitionDelay: `${ci * 25}ms` }"
      >{{ char === ' ' ? '\u00A0' : char }}</span>
    </h3>
    <!-- Standard title -->
    <h3
      v-else
      class="text-2xl md:text-3xl font-bold mt-1 mb-2 transition-colors duration-300"
      :style="expanded ? { color: accentColor } : {}"
      @mouseenter="$event.target.style.color = accentColor"
      @mouseleave="!expanded && ($event.target.style.color = '')"
    >
      {{ project.name }}
    </h3>
    <p class="text-zinc-400 leading-relaxed transition-colors duration-300 group-hover:text-zinc-300">{{ project.description }}</p>

    <!-- Expandable details -->
    <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }">
      <div class="overflow-hidden">
        <div class="pt-4">
          <!-- Image — cascade step 1 -->
          <img
            :src="project.image"
            :alt="project.name"
            class="w-full max-w-md h-48 object-cover rounded-lg mb-4"
            :class="staggerTitle ? ['v5-expand-image', { show: expanded }] : [expanded ? 'opacity-90' : 'opacity-0', 'transition-opacity duration-200']"
          />

          <!-- Links — cascade step 2 -->
          <div
            class="flex items-center gap-4 mb-3"
            :class="staggerTitle ? ['v5-expand-links', { show: expanded }] : [expanded ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-200']"
          >
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.external" /></svg>
              {{ getDomain(project.url) }}
            </a>
            <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.github" /></svg>
              Source
            </a>
          </div>

          <!-- Languages — cascade step 3, with tag hover -->
          <div
            class="flex flex-wrap gap-1.5"
            :class="staggerTitle ? ['v5-expand-tags', { show: expanded }] : [expanded ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-200']"
          >
            <span
              v-for="lang in project.languages"
              :key="lang"
              class="text-xs px-2.5 py-0.5 rounded-full"
              :class="staggerTitle ? 'v5-tag' : ''"
              :style="{ backgroundColor: accentColor + '15', color: accentColor, '--tag-color': accentColor + '30' }"
            >{{ lang }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Brutalist variant (Version 6) -->
  <div
    v-else-if="variant === 'brutalist'"
    class="border-t-4 border-b border-zinc-700 py-6 group cursor-pointer transition-colors duration-150"
    :style="{ borderTopColor: accentColor }"
    @click="emit('toggle')"
    @mouseenter="$event.currentTarget.style.backgroundColor = accentColor + '08'"
    @mouseleave="$event.currentTarget.style.backgroundColor = ''"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="font-mono text-xs text-zinc-600 uppercase tracking-widest">{{ project.year }}</span>
      <svg class="w-4 h-4 text-zinc-600 transition-transform duration-200" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.chevron" />
      </svg>
    </div>
    <h3
      class="font-mono text-xl md:text-2xl font-bold uppercase tracking-wide mb-2 transition-all duration-150"
      :style="expanded ? { color: accentColor } : {}"
      @mouseenter="$event.target.style.color = accentColor; $event.target.style.textShadow = `4px 4px 0 ${accentColor}20`"
      @mouseleave="!expanded && ($event.target.style.color = ''); $event.target.style.textShadow = ''"
    >{{ project.name }}</h3>
    <p class="text-sm text-zinc-500 leading-relaxed font-mono">{{ project.description }}</p>

    <!-- Expandable details -->
    <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }">
      <div class="overflow-hidden">
        <div class="pt-4 transition-opacity duration-200" :class="expanded ? 'opacity-100 delay-150' : 'opacity-0'">
          <img
            :src="project.image"
            :alt="project.name"
            class="w-full max-w-md h-48 object-cover rounded-none mb-4 opacity-90"
          />
          <div class="flex items-center gap-4 mb-3">
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-mono text-zinc-500 uppercase transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.external" /></svg>
              {{ getDomain(project.url) }}
            </a>
            <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-mono text-zinc-500 uppercase transition-colors" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.github" /></svg>
              Source
            </a>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="lang in project.languages"
              :key="lang"
              class="text-xs font-mono px-2.5 py-1 border rounded-none uppercase tracking-wider transition-colors duration-150"
              :style="{ borderColor: accentColor + '40', color: accentColor }"
              @mouseenter="$event.target.style.backgroundColor = accentColor + '15'"
              @mouseleave="$event.target.style.backgroundColor = ''"
            >{{ lang }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Editorial variant (Version 7) -->
  <div
    v-else-if="variant === 'editorial'"
    class="py-12 group cursor-pointer"
    @click="emit('toggle')"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Image column -->
      <div :class="project.id % 2 === 0 ? 'md:order-2' : ''">
        <img
          :src="project.image"
          :alt="project.name"
          class="w-full h-56 object-cover rounded-sm editorial-image"
        />
      </div>
      <!-- Text column -->
      <div :class="project.id % 2 === 0 ? 'md:order-1' : ''">
        <span class="text-xs text-zinc-600 uppercase tracking-[0.2em]">{{ project.year }}</span>
        <h3
          class="font-serif text-2xl md:text-3xl font-bold mt-2 mb-3 transition-colors duration-300"
          :style="expanded ? { color: accentColor } : {}"
          @mouseenter="$event.target.style.color = accentColor"
          @mouseleave="!expanded && ($event.target.style.color = '')"
        >{{ project.name }}</h3>
        <p class="text-zinc-400 leading-relaxed text-[15px]">{{ project.description }}</p>
        <div class="mt-3 flex items-center gap-2 text-sm text-zinc-600">
          <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.chevron" />
          </svg>
          <span class="text-xs uppercase tracking-widest">{{ expanded ? 'Less' : 'More' }}</span>
        </div>
      </div>
    </div>

    <!-- Expandable details -->
    <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }">
      <div class="overflow-hidden">
        <div class="pt-6 transition-opacity duration-200" :class="expanded ? 'opacity-100 delay-150' : 'opacity-0'">
          <div class="flex items-center gap-6 mb-4">
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="editorial-link text-sm text-zinc-500 transition-colors" :style="{ '--accent': accentColor }" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" :d="iconPaths.external" /></svg>{{ getDomain(project.url) }}
            </a>
            <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="editorial-link text-sm text-zinc-500 transition-colors" :style="{ '--accent': accentColor }" @click.stop @mouseenter="$event.currentTarget.style.color = accentColor" @mouseleave="$event.currentTarget.style.color = ''">
              <svg class="w-3.5 h-3.5 inline mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path :d="iconPaths.github" /></svg>Source
            </a>
          </div>
          <p class="text-sm text-zinc-500 italic">
            <span v-for="(lang, li) in project.languages" :key="lang">{{ lang }}<span v-if="li < project.languages.length - 1">, </span></span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
