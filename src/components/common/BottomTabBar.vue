<template>
  <nav class="bottom-tab-bar" role="navigation" :aria-label="$t('common.mainNav')" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <a
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      :aria-label="$t(tab.labelKey)"
      :aria-current="isActive(tab.path) ? 'page' : undefined"
      role="tab"
      @click.prevent="handleTabClick(tab)"
    >
      <span class="tab-icon" v-html="tab.svg" aria-hidden="true"></span>
      <span class="tab-label">{{ $t(tab.labelKey) }}</span>
    </a>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Touch gesture support for swiping between tabs
const touchStartX = ref(0)
const SWIPE_THRESHOLD = 60

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
}

function onTouchEnd(e) {
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

  const currentIndex = tabs.findIndex(t => isActive(t.path))
  if (currentIndex === -1) return

  if (deltaX < 0 && currentIndex < tabs.length - 1) {
    handleTabClick(tabs[currentIndex + 1])
  } else if (deltaX > 0 && currentIndex > 0) {
    handleTabClick(tabs[currentIndex - 1])
  }
}

const tabs = [
  {
    path: '/home',
    labelKey: 'nav.home',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  {
    path: '/promotions',
    labelKey: 'nav.activity',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
  },
  {
    path: '/support',
    labelKey: 'nav.service',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>'
  },
  {
    path: '/download',
    labelKey: 'nav.download',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  },
  {
    path: '/profile',
    labelKey: 'nav.profile',
    requiresAuth: true,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  }
]

function handleTabClick(tab) {
  if (tab.requiresAuth && !userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  router.push(tab.path)
}

function isActive(path) {
  return route.path === path || route.path === path + '/'
}
</script>

<style lang="scss" scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-width;
  height: $tab-bar-height;
  background: linear-gradient(180deg, #150f2e 0%, #110d28 100%);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(124, 58, 237, 0.3);
  box-shadow: 0 -4px 20px rgba(124, 58, 237, 0.1);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  color: $text-muted;
  transition: color 0.2s;
  cursor: pointer;
  text-decoration: none;

  &.active {
    color: $accent-purple-light;
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tab-label {
  font-size: 10px;
}
</style>
