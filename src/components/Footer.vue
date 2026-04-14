<script lang="ts" setup>
import siteConfig from '@/site-config'
</script>

<template>
  <footer
    class="w-full mt-24 pt-6 pb-10 text-xs text-muted flex items-center justify-between"
  >
    <span>&copy; {{ new Date().getFullYear() }} {{ siteConfig.author }}</span>
    <a href="/rss.xml" class="nav-link">rss</a>
  </footer>
</template>
