<template>
  <nav class="bottom-tab-bar" role="navigation" :aria-label="$t('common.mainNav')">
    <a
      v-for="(tab, idx) in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path), center: idx === 2 }"
      :aria-label="$t(tab.labelKey)"
      :aria-current="isActive(tab.path) ? 'page' : undefined"
      role="tab"
      @click.prevent="handleTabClick(tab)"
    >
      <span v-if="idx === 2" class="center-btn">
        <span class="center-glow"></span>
        <span class="center-icon" v-html="tab.svg" aria-hidden="true"></span>
      </span>
      <template v-else>
        <span class="tab-icon" v-html="tab.svg" aria-hidden="true"></span>
        <span class="tab-label">{{ $t(tab.labelKey) }}</span>
      </template>
    </a>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

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
    svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>'
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
  background: linear-gradient(180deg, #140a24 0%, #0d0d0d 100%);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(212, 168, 67, 0.12);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  color: $text-muted;
  transition: color 0.2s;
  cursor: pointer;
  text-decoration: none;

  &.active {
    color: $accent-gold-light;
  }

  &.center {
    position: relative;
    margin-top: -24px;
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
  font-weight: 500;
}

// V3: Floating center button with gold glow ring
.center-btn {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a843, #f3c869);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(212, 168, 67, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.94);
    box-shadow: 0 2px 10px rgba(212, 168, 67, 0.3);
  }
}

.center-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(243, 200, 105, 0.35);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a0a2e;
}
</style>
