<template>
  <div class="app-notice" v-if="appStore.announcements.length || wins.length">
    <div class="marquee-wrap">
      <span class="marquee-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 010 7.07"/>
        </svg>
      </span>
      <van-notice-bar
        scrollable
        :text="tickerText"
        background="transparent"
        :color="'#f0d78c'"
        :speed="45"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// Optional: live-wins list fallback
const wins = computed(() => appStore.liveWins || [])

const tickerText = computed(() => {
  const parts = []
  if (appStore.announcements.length) {
    parts.push(...appStore.announcements.map(a => '📣 ' + a.content))
  }
  if (wins.value.length) {
    parts.push(...wins.value.map(w => '🎉 ' + (w.user || 'VIP') + ' 赢得 ' + (w.amount ? w.amount + ' USDT' : '大奖') + ' @ ' + (w.game || '')))
  }
  return parts.join('    ✦    ')
})
</script>

<style lang="scss" scoped>
.app-notice {
  margin: 10px 14px 6px;
  border-radius: $radius-pill;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.marquee-wrap {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 10px 0 12px;
  gap: 8px;
}

.marquee-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gold-light;
  flex-shrink: 0;
}

:deep(.van-notice-bar) {
  flex: 1;
  height: 34px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2px;
  padding: 0;
  background: transparent !important;
  color: $gold-light !important;
  font-family: $font-system;
}

:deep(.van-notice-bar__content) {
  text-shadow: 0 0 12px rgba(201, 166, 84, 0.4);
}
</style>
