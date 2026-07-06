<script lang="ts" setup>
import siteConfig from '@/site-config'
import { getLinkTarget } from '@/utils/link'
import { computed } from 'vue'

defineProps<{
  /** true でヒーロー写真の上に透過で重ねる（トップページ用） */
  overlay?: boolean
}>()

const navLinks = siteConfig.header.navLinks || []

const socialLinks = computed(() => {
  return siteConfig.socialLinks.filter((link: Record<string, any>) => {
    if (link.header && typeof link.header === 'string') {
      link.icon = link.header.includes('i-') ? link.header : link.icon
      return link
    }
    return false
  })
})
</script>

<template>
  <header
    class="w-full z-20"
    :class="overlay ? 'absolute top-0 left-0 right-0' : ''"
  >
    <div class="max-w-5xl w-full mx-auto px-6 sm:px-10 pt-8 pb-6 flex items-center justify-between gap-6">
      <!-- トップはヒーローに大きくブログ名が出るため、ロゴは重複させない -->
      <a
        v-if="!overlay"
        href="/"
        class="font-display text-sm font-400 tracking-[0.4em] uppercase text-link hover:opacity-70 transition-opacity"
      >
        taiseidev
      </a>
      <span v-else />

      <nav class="flex items-center gap-5 sm:gap-6">
        <a
          v-for="link in navLinks"
          :key="link.text"
          :aria-label="link.text"
          :target="getLinkTarget(link.href)"
          nav-link
          :href="link.href"
          class="font-display text-xs tracking-[0.25em] uppercase"
        >
          {{ link.text }}
        </a>
        <span class="w-px h-3 bg-current opacity-20" />
        <a
          v-for="link in socialLinks"
          :key="link.text"
          :aria-label="link.text"
          :class="link.icon"
          nav-link
          :target="getLinkTarget(link.href)"
          :href="link.href"
        />
      </nav>
    </div>
  </header>
</template>
