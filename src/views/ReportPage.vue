<template>
  <div class="report-page">
    <van-nav-bar title="Win/Loss Report" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="date-filter">
        <van-field v-model="dateRange" is-link readonly placeholder="Select date range" @click="showDatePicker = true" class="date-input" />
        <div class="quick-dates">
          <span v-for="d in quickDates" :key="d.label" class="date-btn" :class="{active: activeDate===d.label}" @click="activeDate=d.label">{{ d.label }}</span>
        </div>
      </div>

      <div class="summary-cards">
        <div class="s-card"><span class="s-label">Total Bets</span><span class="s-value">{{ stats.totalBets }}</span></div>
        <div class="s-card"><span class="s-label">Bet Amount</span><span class="s-value">{{ stats.betAmount }}</span></div>
        <div class="s-card win"><span class="s-label">Win/Loss</span><span class="s-value">{{ stats.winLoss }}</span></div>
        <div class="s-card"><span class="s-label">Rebate</span><span class="s-value">{{ stats.rebate }}</span></div>
      </div>

      <div class="report-table">
        <h3>By Game Type</h3>
        <div class="table-wrap">
          <div class="t-header"><span>Type</span><span>Bets</span><span>Amount</span><span>Win/Loss</span></div>
          <div class="t-row" v-for="r in reportData" :key="r.type">
            <span>{{ r.type }}</span><span>{{ r.bets }}</span><span>{{ r.amount }}</span>
            <span :class="r.winLoss >= 0 ? 'green' : 'red'">{{ r.winLoss >= 0 ? '+' : '' }}{{ r.winLoss }}</span>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker @confirm="onDateConfirm" @cancel="showDatePicker=false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const dateRange = ref('')
const showDatePicker = ref(false)
const activeDate = ref('Today')
const quickDates = [{label:'Today'},{label:'Yesterday'},{label:'This Week'},{label:'This Month'}]
const stats = { totalBets: 156, betAmount: '12,580.00', winLoss: '+1,288.50', rebate: '125.80' }
const reportData = [
  { type: 'Slots', bets: 80, amount: '6,000', winLoss: 850 },
  { type: 'Live Casino', bets: 30, amount: '3,500', winLoss: -420 },
  { type: 'Fishing', bets: 25, amount: '1,800', winLoss: 320 },
  { type: 'Sports', bets: 15, amount: '1,000', winLoss: 538 },
  { type: 'Chess', bets: 6, amount: '280', winLoss: 0.50 }
]
function onDateConfirm({ selectedValues }) { dateRange.value = selectedValues.join('-'); showDatePicker.value = false }
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
