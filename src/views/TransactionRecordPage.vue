<template>
  <div class="trans-record-page">
    <van-nav-bar title="Transaction Records" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <van-tabs v-model:active="activeTab" sticky shrink>
        <van-tab title="Account Changes">
          <div class="record-list">
            <div v-for="r in accountRecords" :key="r.id" class="record-item">
              <div class="r-left"><span class="r-type">{{ r.type }}</span><span class="r-time">{{ r.time }}</span></div>
              <div class="r-right"><span class="r-amount" :class="r.amount>0?'green':'red'">{{ r.amount>0?'+':'' }}{{ r.amount.toFixed(2) }}</span><span class="r-balance">Balance: {{ r.balance.toFixed(2) }}</span></div>
            </div>
          </div>
        </van-tab>
        <van-tab title="Deposit">
          <div class="record-list">
            <div v-for="r in depositRecords" :key="r.id" class="record-item">
              <div class="r-left"><span class="r-type">USDT TRC-20</span><span class="r-time">{{ r.time }}</span></div>
              <div class="r-right"><span class="r-amount green">+{{ r.amount.toFixed(2) }}</span><span class="r-status" :class="r.status">{{ r.status }}</span></div>
            </div>
          </div>
        </van-tab>
        <van-tab title="Withdrawal">
          <div class="record-list">
            <div v-for="r in withdrawRecords" :key="r.id" class="record-item">
              <div class="r-left"><span class="r-type">{{ r.method }}</span><span class="r-time">{{ r.time }}</span></div>
              <div class="r-right"><span class="r-amount red">-{{ r.amount.toFixed(2) }}</span><span class="r-status" :class="r.status">{{ r.status }}</span></div>
            </div>
          </div>
        </van-tab>
        <van-tab title="Promotions">
          <div class="record-list">
            <div v-for="r in promoRecords" :key="r.id" class="record-item">
              <div class="r-left"><span class="r-type">{{ r.name }}</span><span class="r-time">{{ r.time }}</span></div>
              <div class="r-right"><span class="r-amount green">+{{ r.amount.toFixed(2) }}</span><span class="r-status completed">Claimed</span></div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref(0)
const accountRecords = [
  { id: 1, type: 'Deposit', time: '2024-03-15 14:30', amount: 1000, balance: 2500 },
  { id: 2, type: 'Bet - Slots', time: '2024-03-15 15:00', amount: -50, balance: 2450 },
  { id: 3, type: 'Win - Slots', time: '2024-03-15 15:01', amount: 120, balance: 2570 },
  { id: 4, type: 'Withdrawal', time: '2024-03-14 10:00', amount: -500, balance: 1500 },
  { id: 5, type: 'Bonus', time: '2024-03-14 08:00', amount: 68, balance: 2000 },
  { id: 6, type: 'Rebate', time: '2024-03-13 08:00', amount: 25.5, balance: 1932 }
]
const depositRecords = [
  { id: 1, time: '2024-03-15 14:30', amount: 1000, status: 'completed' },
  { id: 2, time: '2024-03-12 09:00', amount: 500, status: 'completed' },
  { id: 3, time: '2024-03-10 20:00', amount: 2000, status: 'completed' },
  { id: 4, time: '2024-03-08 11:00', amount: 100, status: 'pending' }
]
const withdrawRecords = [
  { id: 1, method: 'USDT TRC-20', time: '2024-03-14 10:00', amount: 500, status: 'completed' },
  { id: 2, method: 'ABA Bank', time: '2024-03-10 16:00', amount: 200, status: 'completed' },
  { id: 3, method: 'USDT TRC-20', time: '2024-03-08 12:00', amount: 1000, status: 'pending' }
]
const promoRecords = [
  { id: 1, name: 'First Deposit Bonus', time: '2024-03-15 14:35', amount: 68 },
  { id: 2, name: 'Daily Loss Rebate', time: '2024-03-14 08:00', amount: 25.5 },
  { id: 3, name: 'Weekly Bet Bonus', time: '2024-03-11 08:00', amount: 188 }
]
</script>

<style lang="scss" scoped>
.page-content { padding: 0; }
:deep(.van-tabs__nav) { background: transparent; }
:deep(.van-tab) { color: $text-secondary; font-size: 13px; }
:deep(.van-tab--active) { color: #fff; }
:deep(.van-tabs__line) { background: $accent-purple; }
.record-list { padding: 12px 16px; }
.record-item { display: flex; justify-content: space-between; padding: 14px; background: $bg-card; border-radius: 10px; margin-bottom: 8px; }
.r-left { display: flex; flex-direction: column; gap: 4px; }
.r-type { font-size: 14px; font-weight: 500; }
.r-time { font-size: 11px; color: $text-muted; }
.r-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.r-amount { font-size: 15px; font-weight: 600; &.green { color: #10b981; } &.red { color: #ef4444; } }
.r-balance { font-size: 11px; color: $text-muted; }
.r-status { font-size: 11px; padding: 2px 8px; border-radius: 8px;
  &.completed { background: rgba(16,185,129,0.15); color: #10b981; }
  &.pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
}
</style>
