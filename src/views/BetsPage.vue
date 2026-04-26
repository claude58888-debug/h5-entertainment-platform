<template>
  <div class="bets-page">
    <van-nav-bar :title="$t('bets.title')" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <van-dropdown-menu>
          <van-dropdown-item v-model="gameFilter" :options="gameOptions" @change="resetPagination" />
          <van-dropdown-item v-model="dateFilter" :options="dateOptions" @change="resetPagination" />
          <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="resetPagination" />
        </van-dropdown-menu>
      </div>

      <!-- Summary Statistics -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-label">{{ $t('bets.totalBets') }}</span>
          <span class="stat-val">{{ filteredRecords.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ $t('bets.totalWins') }}</span>
          <span class="stat-val green">{{ totalWins.toFixed(2) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ $t('bets.profitLoss') }}</span>
          <span class="stat-val" :class="totalPL >= 0 ? 'green' : 'red'">
            {{ totalPL >= 0 ? '+' : '' }}{{ totalPL.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Bet Records List -->
      <div class="record-list">
        <div v-for="r in paginatedRecords" :key="r.id" class="record-item">
          <div class="r-top">
            <div class="r-game-info">
              <span class="r-game">{{ r.game }}</span>
              <span class="r-category-badge" :class="r.type.toLowerCase()">{{ r.type }}</span>
            </div>
            <span class="r-time">{{ r.time }}</span>
          </div>
          <div class="r-bottom">
            <div class="r-detail">
              <span class="r-label">{{ $t('bets.betAmount') }}</span>
              <span>{{ r.betAmount.toFixed(2) }}</span>
            </div>
            <div class="r-detail">
              <span class="r-label">{{ $t('bets.winAmount') }}</span>
              <span :class="r.winAmount >= 0 ? 'green' : 'red'">
                {{ r.winAmount >= 0 ? '+' : '' }}{{ r.winAmount.toFixed(2) }}
              </span>
            </div>
            <div class="r-detail">
              <span class="r-label">{{ $t('bets.status') }}</span>
              <span class="status-badge" :class="getStatus(r).toLowerCase()">{{ getStatus(r) }}</span>
            </div>
            <div class="r-detail">
              <span class="r-label">{{ $t('bets.provider') }}</span>
              <span>{{ r.platform }}</span>
            </div>
          </div>
        </div>

        <van-empty v-if="!filteredRecords.length" :description="$t('bets.noRecords')" image="search" />

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <van-button size="small" :disabled="currentPage <= 1" @click="currentPage--" plain round>&lt;</van-button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <van-button size="small" :disabled="currentPage >= totalPages" @click="currentPage++" plain round>&gt;</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

const { t } = useI18n()

const PAGE_SIZE = 10
const currentPage = ref(1)
const loading = ref(false)

// Filters
const gameFilter = ref(0)
const dateFilter = ref(0)
const statusFilter = ref(0)

const gameOptions = [
  { text: t('bets.allGames'), value: 0 },
  { text: t('bets.slots'), value: 1 },
  { text: t('bets.liveCasino'), value: 2 },
  { text: t('bets.fishing'), value: 3 },
  { text: t('bets.sports'), value: 4 },
  { text: t('bets.chess'), value: 5 },
  { text: t('bets.lottery'), value: 6 }
]

const dateOptions = [
  { text: t('bets.last30Days'), value: 0 },
  { text: t('bets.today'), value: 1 },
  { text: t('bets.last7Days'), value: 2 }
]

const statusOptions = [
  { text: t('bets.allStatus'), value: 0 },
  { text: t('bets.win'), value: 1 },
  { text: t('bets.loss'), value: 2 },
  { text: t('bets.pending'), value: 3 }
]

const gameTypeMap = { 1: 'SLOT', 2: 'LIVE', 3: 'FH', 4: 'SPORT', 5: 'CHESS', 6: 'LOTTERY' }
const statusMap = { 1: 'win', 2: 'loss', 3: 'pending' }
const daysMap = { 0: 30, 1: 1, 2: 7 }

const betRecords = ref([])
const totalRecords = ref(0)
const summary = ref({ totalBets: 0, totalBetAmount: 0, totalWinAmount: 0, profitLoss: 0 })

async function fetchBets() {
  loading.value = true
  try {
    const params = { page: currentPage.value }
    if (gameFilter.value !== 0) params.game = gameTypeMap[gameFilter.value]
    if (statusFilter.value !== 0) params.status = statusMap[statusFilter.value]
    params.days = daysMap[dateFilter.value] || 30

    const res = await request.get('/bets', { params })
    betRecords.value = res.list || []
    totalRecords.value = res.total || 0
    summary.value = res.summary || { totalBets: 0, totalBetAmount: 0, totalWinAmount: 0, profitLoss: 0 }
  } catch {
    betRecords.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

const filteredRecords = computed(() => betRecords.value)

const totalWins = computed(() => summary.value.totalWinAmount)
const totalPL = computed(() => summary.value.profitLoss)

const totalPages = computed(() => Math.ceil(totalRecords.value / PAGE_SIZE))

const paginatedRecords = computed(() => betRecords.value)

function resetPagination() {
  currentPage.value = 1
  fetchBets()
}

watch(currentPage, () => fetchBets())

function getStatus(record) {
  if (record.status === 'pending') return t('bets.pending')
  if (record.winAmount > record.betAmount) return t('bets.win')
  if (record.winAmount < record.betAmount) return t('bets.loss')
  return t('bets.pending')
}

onMounted(() => fetchBets())
</script>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
}

.filter-bar {
  :deep(.van-dropdown-menu__bar) {
    background: $bg-card;
    box-shadow: none;
  }
  :deep(.van-dropdown-menu__title) {
    color: $text-primary;
    font-size: 12px;
  }
  :deep(.van-dropdown-item__content) {
    background: $bg-secondary;
  }
  :deep(.van-cell) {
    background: $bg-secondary;
    color: $text-primary;
  }
  :deep(.van-dropdown-item__option--active) {
    color: $accent-purple-light;
  }
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 14px 16px;
  background: linear-gradient(135deg, #1c1640 0%, #2d1b69 50%, #1c1640 100%);
  margin-bottom: 8px;
  border-bottom: 1px solid $border-color;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: $text-muted;
}

.stat-val {
  font-size: 18px;
  font-weight: 700;

  &.green { color: #10b981; }
  &.red { color: #ef4444; }
}

.record-list {
  padding: 0 16px 24px;
}

.record-item {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
}

.r-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.r-game-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.r-game {
  font-size: 14px;
  font-weight: 600;
}

.r-category-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;

  &.slots { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
  &.live { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
  &.fishing { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
  &.sports { background: rgba(16, 185, 129, 0.15); color: #10b981; }
  &.chess { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
  &.lottery { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
}

.r-time {
  font-size: 11px;
  color: $text-muted;
}

.r-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
}

.r-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.r-label {
  font-size: 10px;
  color: $text-muted;
}

.green { color: #10b981; }
.red { color: #ef4444; }

.status-badge {
  font-size: 11px;
  font-weight: 600;

  &.win, &.\8D62 { color: #10b981; }
  &.loss, &.\8F93 { color: #ef4444; }
  &.pending, &.\5F85\7ED3\7B97 { color: #f59e0b; }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
}

.page-info {
  font-size: 13px;
  color: $text-secondary;
}
</style>
