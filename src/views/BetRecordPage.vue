<template>
  <div class="bet-record-page">
    <van-nav-bar title="Bet Records" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="filter-bar">
        <van-dropdown-menu>
          <van-dropdown-item v-model="gameType" :options="gameTypes" />
        </van-dropdown-menu>
      </div>
      <div class="stats-bar">
        <div class="stat"><span class="stat-label">Total Bets</span><span class="stat-val">{{ betRecords.length }}</span></div>
        <div class="stat"><span class="stat-label">Bet Amount</span><span class="stat-val">{{ totalBetAmount.toFixed(2) }}</span></div>
        <div class="stat"><span class="stat-label">Win/Loss</span><span class="stat-val" :class="totalWinLoss>=0?'green':'red'">{{ totalWinLoss>=0?'+':'' }}{{ totalWinLoss.toFixed(2) }}</span></div>
      </div>
      <div class="record-list">
        <div v-for="r in filteredRecords" :key="r.id" class="record-item">
          <div class="r-top">
            <span class="r-game">{{ r.game }}</span>
            <span class="r-time">{{ r.time }}</span>
          </div>
          <div class="r-bottom">
            <div class="r-detail"><span class="r-label">Bet</span><span>{{ r.betAmount.toFixed(2) }}</span></div>
            <div class="r-detail"><span class="r-label">Win</span><span :class="r.winAmount>=0?'green':'red'">{{ r.winAmount>=0?'+':'' }}{{ r.winAmount.toFixed(2) }}</span></div>
            <div class="r-detail"><span class="r-label">Provider</span><span>{{ r.provider }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const gameType = ref(0)
const gameTypes = [
  { text: 'All Games', value: 0 }, { text: 'Slots', value: 1 }, { text: 'Live Casino', value: 2 },
  { text: 'Fishing', value: 3 }, { text: 'Sports', value: 4 }, { text: 'Chess', value: 5 }
]
const typeMap = { 1: 'Slots', 2: 'Live', 3: 'Fishing', 4: 'Sports', 5: 'Chess' }
const betRecords = [
  { id: 1, game: 'Fortune Tiger', type: 'Slots', provider: 'PG', time: '2024-03-15 15:30', betAmount: 50, winAmount: 120 },
  { id: 2, game: 'Baccarat A', type: 'Live', provider: 'PP', time: '2024-03-15 14:20', betAmount: 200, winAmount: -200 },
  { id: 3, game: 'Fish Party', type: 'Fishing', provider: 'JDB', time: '2024-03-15 13:00', betAmount: 30, winAmount: 65 },
  { id: 4, game: 'Lucky Slots', type: 'Slots', provider: 'CQ9', time: '2024-03-15 12:00', betAmount: 100, winAmount: 250 },
  { id: 5, game: 'Crown Sports', type: 'Sports', provider: 'Crown', time: '2024-03-14 22:00', betAmount: 500, winAmount: 380 },
  { id: 6, game: 'Golden Dragon', type: 'Slots', provider: 'JILI', time: '2024-03-14 20:00', betAmount: 80, winAmount: -80 },
  { id: 7, game: 'Texas Hold', type: 'Chess', provider: 'FC', time: '2024-03-14 19:00', betAmount: 150, winAmount: 90 },
  { id: 8, game: 'Speed Baccarat', type: 'Live', provider: 'PP', time: '2024-03-14 18:00', betAmount: 300, winAmount: -300 }
]
const filteredRecords = computed(() => gameType.value === 0 ? betRecords : betRecords.filter(r => r.type === typeMap[gameType.value]))
const totalBetAmount = computed(() => filteredRecords.value.reduce((s, r) => s + r.betAmount, 0))
const totalWinLoss = computed(() => filteredRecords.value.reduce((s, r) => s + r.winAmount, 0))
</script>

<style lang="scss" scoped>
.page-content { padding: 0; }
.filter-bar { :deep(.van-dropdown-menu__bar) { background: $bg-card; } :deep(.van-dropdown-menu__title) { color: #fff; font-size: 13px; } }
.stats-bar { display: flex; justify-content: space-around; padding: 12px 16px; background: $bg-card; margin-bottom: 8px; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-label { font-size: 11px; color: $text-muted; }
.stat-val { font-size: 16px; font-weight: 700; &.green { color: #10b981; } &.red { color: #ef4444; } }
.record-list { padding: 0 16px 16px; }
.record-item { background: $bg-card; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.r-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
.r-game { font-size: 14px; font-weight: 600; }
.r-time { font-size: 11px; color: $text-muted; }
.r-bottom { display: flex; justify-content: space-between; }
.r-detail { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.r-label { font-size: 10px; color: $text-muted; }
.green { color: #10b981; }
.red { color: #ef4444; }
</style>
