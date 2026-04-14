<script lang="ts" setup>
import siteConfig from '@/site-config'
import { getLinkTarget } from '@/utils/link'
import { computed, ref } from 'vue'
import ThemeToggle from './ThemeToggle.vue'

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

const drawerOpen = ref(false)
function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}
</script>

<template>
  <header class="w-full pt-12 pb-8">
    <div class="flex items-center justify-between gap-6">
      <a
        href="/"
        class="group flex items-center gap-2 text-link hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="10 10 44 44"
          aria-hidden="true"
          class="h-9 w-9 shrink-0 mt-[2px] transition-transform duration-500 ease-out group-hover:rotate-[60deg]"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            d="M 32 32 A 2 2 0 0 1 36 32 A 4 4 0 0 1 28 32 A 6 6 0 0 1 40 32 A 8 8 0 0 1 24 32 A 10 10 0 0 1 44 32 A 12 12 0 0 1 20 32"
          />
        </svg>
        <span class="text-xl tracking-wide font-500">taiseidev</span>
      </a>

      <nav class="hidden sm:flex items-center gap-6 text-sm">
        <a
          v-for="link in navLinks"
          :key="link.text"
          :aria-label="link.text"
          :target="getLinkTarget(link.href)"
          nav-link
          :href="link.href"
          class="tracking-wider"
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
        <a
          nav-link
          target="_blank"
          href="/rss.xml"
          aria-label="RSS"
          class="text-xs tracking-widest uppercase"
        >
          rss
        </a>
        <ThemeToggle />
      </nav>

      <button
        class="sm:hidden text-xs tracking-widest uppercase opacity-70 hover:opacity-100"
        aria-label="menu"
        @click="toggleDrawer()"
      >
        menu
      </button>
    </div>

    <!-- モバイル用ドロワー -->
    <nav
      v-show="drawerOpen"
      class="sm:hidden mt-6 flex flex-col gap-3 text-sm"
    >
      <a
        v-for="link in navLinks"
        :key="link.text"
        :aria-label="link.text"
        :target="getLinkTarget(link.href)"
        nav-link
        :href="link.href"
        class="tracking-wider"
        @click="toggleDrawer()"
      >
        {{ link.text }}
      </a>
      <a
        nav-link
        target="_blank"
        href="/rss.xml"
        class="text-xs tracking-widest uppercase"
      >
        rss
      </a>
    </nav>

    <!-- hairline -->
    <div class="mt-8 hairline" />
  </header>
</template>
