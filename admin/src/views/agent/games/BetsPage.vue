<template>
  <div>
    <h2 class="section-title">投注记录</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索会员/订单号" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="providerFilter" placeholder="厂商" style="width: 120px;" clearable>
          <el-option v-for="p in ['PG','PP','CQ9','EVO','AG','JDB','JILI','FC']" :key="p" :label="p" :value="p" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" />
        <el-button type="primary" plain><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <el-table :data="filteredBets" stripe>
        <el-table-column prop="id" label="注单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="game" label="游戏" width="140" />
        <el-table-column prop="provider" label="厂商" width="70" />
        <el-table-column label="投注额" width="120">
          <template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="派彩" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.payout > row.betAmount ? '#67c23a' : '#f56c6c' }">¥{{ row.payout.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="盈亏" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.profit >= 0 ? '#67c23a' : '#f56c6c' }">{{ row.profit >= 0 ? '+' : '' }}¥{{ row.profit.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredBets.length" :page-size="20" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { bettingRecords } from '@/mock/data'

const search = ref('')
const providerFilter = ref('')
const dateRange = ref(null)
const bets = ref(bettingRecords.filter(b => b.agent === '金沙娱乐'))

const filteredBets = computed(() => bets.value.filter(b => {
  if (search.value && !b.member.includes(search.value) && !b.id.includes(search.value)) return false
  if (providerFilter.value && b.provider !== providerFilter.value) return false
  return true
}))
</script>
