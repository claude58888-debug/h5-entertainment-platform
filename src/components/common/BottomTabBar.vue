<template>
  <nav class="bottom-tab-bar" role="navigation" :aria-label="$t('common.mainNav')" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <a
      v-for="(tab, idx) in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path), 'is-center': idx === 2 }"
      :aria-label="$t(tab.labelKey)"
      :aria-current="isActive(tab.path) ? 'page' : undefined"
      role="tab"
      @click.prevent="handleTabClick(tab)"
    >
      <template v-if="idx === 2">
        <span class="center-bubble" :class="{ active: isActive(tab.path) }">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <span class="center-pulse"></span>
        </span>
        <span class="tab-label center-label">{{ $t(tab.labelKey) }}</span>
      </template>
      <template v-else>
        <span class="tab-icon" v-html="tab.svg" aria-hidden="true"></span>
        <span class="tab-label">{{ $t(tab.labelKey) }}</span>
      </template>
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

// 5 tabs: 首页 / 游戏 / 充值(center) / 活动 / 我的
const tabs = [
  {
    path: '/home',
    labelKey: 'nav.home',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  {
    path: '/games/all',
    labelKey: 'nav.games',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><line x1="7" y1="12" x2="11" y2="12"/><line x1="9" y1="10" x2="9" y2="14"/><circle cx="16" cy="11" r="1.2" fill="currentColor"/><circle cx="18" cy="13" r="1.2" fill="currentColor"/></svg>'
  },
  {
    path: '/deposit',
    labelKey: 'nav.deposit',
    requiresAuth: true,
    svg: ''
  },
  {
    path: '/promotions',
    labelKey: 'nav.activity',
    requiresAuth: false,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="21" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>'
  },
  {
    path: '/profile',
    labelKey: 'nav.profile',
    requiresAuth: true,
    svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
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
  if (path === '/games/all') {
    return route.path.startsWith('/games')
  }
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
  background: rgba(10, 14, 26, 0.78);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.45);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1 1 0;
  width: 20%;
  color: $text-muted;
  transition: color 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;

  &.active {
    color: $gold-light;
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tab-label {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

// -- Center "充值" raised golden bubble --------------------------------------
.tab-item.is-center {
  position: relative;
}

.center-bubble {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: $tab-bar-center-size;
  height: $tab-bar-center-size;
  border-radius: 50%;
  background: $gold-gradient;
  box-shadow:
    0 8px 24px rgba(201, 166, 84, 0.55),
    0 0 0 4px rgba(10, 14, 26, 0.95),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -2px 4px rgba(141, 107, 43, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1407;
  z-index: 2;

  svg { position: relative; z-index: 2; }
}

.center-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: $gold;
  opacity: 0.65;
  animation: centerPulse 2.2s ease-out infinite;
  z-index: 1;
}

@keyframes centerPulse {
  0%   { transform: scale(1); opacity: 0.55; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.center-label {
  margin-top: 28px;
  color: $gold-light;
  font-weight: 600;
}
</style>
