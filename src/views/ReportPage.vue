<template>
  <div class="report-page">
    <van-nav-bar title="Win/Loss Report" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="date-filter">
        <div class="quick-dates">
          <span v-for="d in quickDates" :key="d.value" class="date-btn" :class="{active: activeDays===d.value}" @click="selectRange(d.value)">{{ d.label }}</span>
        </div>
      </div>

      <div class="summary-cards">
        <div class="s-card"><span class="s-label">Total Bets</span><span class="s-value">{{ stats.totalBets }}</span></div>
        <div class="s-card"><span class="s-label">Bet Amount</span><span class="s-value">{{ formatAmount(stats.betAmount) }}</span></div>
        <div class="s-card win"><span class="s-label">Win/Loss</span><span class="s-value" :class="stats.winLoss >= 0 ? 'green' : 'red'">{{ stats.winLoss >= 0 ? '+' : '' }}{{ formatAmount(stats.winLoss) }}</span></div>
        <div class="s-card"><span class="s-label">Rebate</span><span class="s-value">{{ formatAmount(stats.rebate) }}</span></div>
      </div>

      <div class="report-table" v-if="reportData.length > 0">
        <h3>By Game Type</h3>
        <div class="table-wrap">
          <div class="t-header"><span>Type</span><span>Bets</span><span>Amount</span><span>Win/Loss</span></div>
          <div class="t-row" v-for="r in reportData" :key="r.type">
            <span>{{ r.type }}</span><span>{{ r.bets }}</span><span>{{ formatAmount(r.amount) }}</span>
            <span :class="r.winLoss >= 0 ? 'green' : 'red'">{{ r.winLoss >= 0 ? '+' : '' }}{{ formatAmount(r.winLoss) }}</span>
          </div>
        </div>
      </div>
      <van-empty v-else-if="!loading" description="No betting data" image="search" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const activeDays = ref(30)
const quickDates = [
  { label: 'Today', value: 1 },
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'All Time', value: 0 }
]

const stats = ref({ totalBets: 0, betAmount: 0, winLoss: 0, rebate: 0 })
const reportData = ref([])

function formatAmount(val) {
  const n = Number(val) || 0
  return n.toFixed(2)
}

async function fetchReport() {
  loading.value = true
  try {
    const params = activeDays.value > 0 ? { days: activeDays.value } : {}
    const res = await request.get('/bets/report', { params })
    stats.value = {
      totalBets: res.totalBets || 0,
      betAmount: res.betAmount || 0,
      winLoss: res.winLoss || 0,
      rebate: res.rebate || 0
    }
    reportData.value = res.byType || []
  } catch {
    stats.value = { totalBets: 0, betAmount: 0, winLoss: 0, rebate: 0 }
    reportData.value = []
  } finally {
    loading.value = false
  }
}

function selectRange(days) {
  activeDays.value = days
  fetchReport()
}

onMounted(() => fetchReport())
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.date-input { background: $bg-card; border-radius: 10px; margin-bottom: 10px; }
.quick-dates { display: flex; gap: 8px; margin-bottom: 16px; }
.date-btn { padding: 6px 14px; border-radius: 16px; background: $bg-card; font-size: 12px; cursor: pointer; &.active { background: $accent-purple; } }
.summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
.s-card { background: $bg-card; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 4px; &.win .s-value { color: #10b981; } }
.s-label { font-size: 11px; color: $text-muted; }
.s-value { font-size: 18px; font-weight: 700; }
.report-table { h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; } }
.table-wrap { background: $bg-card; border-radius: 12px; overflow: hidden; }
.t-header { display: grid; grid-template-columns: 1.2fr 0.8fr 1fr 1fr; padding: 10px 12px; font-size: 11px; color: $text-muted; border-bottom: 1px solid $border-color; }
.t-row { display: grid; grid-template-columns: 1.2fr 0.8fr 1fr 1fr; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid $border-color; &:last-child { border-bottom: none; } }
.green { color: #10b981; }
.red { color: #ef4444; }
</style>
