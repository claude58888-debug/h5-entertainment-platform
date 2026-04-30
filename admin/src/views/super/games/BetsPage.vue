<template>
  <div>
    <h2 class="section-title">投注记录 (全平台)</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索会员/订单号" style="width: 200px;" clearable prefix-icon="Search" @keyup.enter="fetchBets" />
        <el-select v-model="providerFilter" placeholder="厂商" style="width: 120px;" clearable @change="fetchBets">
          <el-option v-for="p in ['PG','PP','CQ9','EVO','AG','JDB','JILI','FC','WM']" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类" style="width: 120px;" clearable @change="fetchBets">
          <el-option label="电子" value="电子" /><el-option label="真人" value="真人" /><el-option label="捕鱼" value="捕鱼" />
          <el-option label="体育" value="体育" /><el-option label="彩票" value="彩票" /><el-option label="棋牌" value="棋牌" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" @change="fetchBets" />
        <el-button type="primary" @click="fetchBets">查询</el-button>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!bets.length" class="empty-state">
        <el-empty description="暂无投注记录" />
      </div>

      <el-table v-else :data="bets" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column prop="member" label="会员" width="130" />
        <el-table-column prop="game" label="游戏" width="140" />
        <el-table-column prop="provider" label="厂商" width="70" />
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column label="投注额" width="120">
          <template #default="{ row }"><span>¥{{ row.betAmount.toLocaleString() }}</span></template>
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
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchBets"
          @current-change="fetchBets"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBetsWithPagination } from '@/api/games'

const search = ref('')
const providerFilter = ref('')
const categoryFilter = ref('')
const dateRange = ref(null)
const bets = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

async function fetchBets() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (search.value) params.search = search.value
    if (providerFilter.value) params.provider = providerFilter.value
    if (categoryFilter.value) params.category = categoryFilter.value
    if (dateRange.value && dateRange.value[0]) params.startDate = dateRange.value[0].toISOString().split('T')[0]
    if (dateRange.value && dateRange.value[1]) params.endDate = dateRange.value[1].toISOString().split('T')[0]

    const result = await getBetsWithPagination(params)
    bets.value = result.data || []
    total.value = result.total || 0
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
}

onMounted(fetchBets)
</script>
