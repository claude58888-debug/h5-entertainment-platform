<template>
  <div>
    <h2 class="section-title">聚合游戏投注记录</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索UID/订单号/游戏" style="width: 220px;" clearable prefix-icon="Search" @keyup.enter="fetchBets" />
        <el-select v-model="platformFilter" placeholder="平台" style="width: 160px;" clearable @change="fetchBets">
          <el-option v-for="p in platformOptions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" @change="fetchBets" />
        <el-button type="primary" @click="fetchBets">查询</el-button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty -->
      <div v-else-if="!bets.length" class="empty-state">
        <el-empty description="暂无投注记录" />
      </div>

      <!-- Table -->
      <el-table v-else :data="bets" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="uid" label="用户UID" width="110" />
        <el-table-column prop="platform" label="平台" width="130" />
        <el-table-column prop="gameName" label="游戏" width="140" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="订单号" width="200" show-overflow-tooltip />
        <el-table-column label="投注额" width="110">
          <template #default="{ row }">
            <span>¥{{ (row.betAmount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="派彩" width="110">
          <template #default="{ row }">
            <span :style="{ color: row.winAmount > row.betAmount ? '#67c23a' : '#f56c6c' }">
              ¥{{ (row.winAmount || 0).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="盈亏" width="110">
          <template #default="{ row }">
            <span :style="{ color: row.profit >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ row.profit >= 0 ? '+' : '' }}¥{{ row.profit.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'settled' ? 'success' : row.status === 'cancelled' ? 'danger' : 'info'" size="small">
              {{ row.status === 'settled' ? '已结算' : row.status === 'cancelled' ? '已取消' : row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180" />
      </el-table>

      <div v-if="total > 0" style="margin-top: 16px; text-align: right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchBets"
          @size-change="fetchBets"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSK7755Bets } from '@/api/games'

const loading = ref(false)
const bets = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const search = ref('')
const platformFilter = ref('')
const dateRange = ref(null)

const platformOptions = [
  'TX-PG', 'ZFPP', 'ONE-HACKSAW', 'ONE-NOLIMIT', 'TX-JDB', 'OPS-JILI',
  'PP', 'AWC-EVOLUTION', 'ZF-CR', 'WALI', 'AWC-JILI', 'PC28-NEW'
]

async function fetchBets() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (search.value) params.search = search.value
    if (platformFilter.value) params.platform = platformFilter.value
    if (dateRange.value && dateRange.value[0]) {
      params.startDate = dateRange.value[0].toISOString().slice(0, 10)
      params.endDate = dateRange.value[1].toISOString().slice(0, 10)
    }
    const res = await getSK7755Bets(params)
    bets.value = res.data || []
    total.value = res.total || 0
  } catch (err) {
    ElMessage.error('加载投注记录失败')
    bets.value = []
  }
  loading.value = false
}

onMounted(fetchBets)
</script>
