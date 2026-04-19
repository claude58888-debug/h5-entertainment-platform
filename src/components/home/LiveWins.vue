<template>
  <div class="live-wins" v-if="wins.length">
    <div class="live-wins-header">
      <span class="dot"></span>
      <span class="title">{{ $t('home.liveWins') }}</span>
    </div>
    <div class="live-wins-table">
      <div
        class="win-row"
        v-for="w in wins"
        :key="w.id"
      >
        <span class="col col-user">{{ w.user }}</span>
        <span class="col col-amount num">+{{ w.amount }} <span class="usdt">USDT</span></span>
        <span class="col col-game">{{ w.game }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const wins = computed(() => appStore.liveWins || [])
</script>

<style lang="scss" scoped>
.live-wins {
  margin: 14px 14px 18px;
  padding: 12px 14px;
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-lg;
}

.live-wins-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
    animation: pulseDot 1.6s ease-in-out infinite;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: $text-primary;
  }
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(0.8); }
}

.live-wins-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.win-row {
  display: grid;
  grid-template-columns: 30% 36% 34%;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
}

.col-user {
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-amount {
  font-family: $font-mono;
  color: $gold-light;
  font-weight: 700;
  text-align: center;

  .usdt {
    font-size: 9.5px;
    color: $text-muted;
    font-weight: 500;
    margin-left: 2px;
  }
}

.col-game {
  color: $text-muted;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
