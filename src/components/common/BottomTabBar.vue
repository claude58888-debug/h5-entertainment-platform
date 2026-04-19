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

// Swipe between tabs
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

// 5 equal tabs: 首页 / 活动 / 任务 / 客服 / 我的
// Line-style 1.75px icons, no protruding center button (Stake-inspired)
const tabs = [
  {
    path: '/home',
    labelKey: 'nav.home',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-3.75V14h-5.5v7.5H4.5A1.5 1.5 0 0 1 3 20z"/></svg>'
  },
  {
    path: '/promotions',
    labelKey: 'nav.activity',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9"/><rect x="2" y="7" width="20" height="5" rx="1"/><path d="M12 21V7"/><path d="M12 7h-4a2.5 2.5 0 0 1 0-5c2.5 0 4 2 4 5zM12 7h4a2.5 2.5 0 0 0 0-5c-2.5 0-4 2-4 5z"/></svg>'
  },
  {
    path: '/tasks',
    labelKey: 'nav.tasks',
    requiresAuth: true,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 2h6v4H9z"/><path d="M8 11h5"/><path d="M8 15h7"/><path d="M8 19h4"/></svg>'
  },
  {
    path: '/support',
    labelKey: 'nav.service',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg>'
  },
  {
    path: '/profile',
    labelKey: 'nav.profile',
    requiresAuth: true,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>'
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
  background: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid $border-subtle;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  height: 100%;
  color: $text-muted;
  transition: color 0.15s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;

  &.active {
    color: $accent-gold;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: $accent-gold;
      border-radius: 0 0 2px 2px;
    }
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
}

.tab-label {
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.2px;
}
</style>
