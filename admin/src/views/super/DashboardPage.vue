<template>
  <div class="bg-dash">
    <!-- Page header -->
    <div class="bg-dash__head">
      <div>
        <h1 class="bg-dash__title">仪表盘</h1>
        <p class="bg-dash__subtitle">实时运营概览 · {{ nowText }}</p>
      </div>
      <div class="bg-dash__actions">
        <el-button :icon="RefreshIcon" plain class="bg-btn-ghost" :loading="loading" @click="refreshAll">
          刷新数据
        </el-button>
        <el-segmented
          v-model="range"
          :options="rangeOptions"
          class="bg-seg"
          @change="fetchTrends"
        />
      </div>
    </div>

    <!-- KPI cards -->
    <div class="bg-kpi-grid">
      <KpiCard
        title="总用户数"
        :value="kpis.totalUsers"
        :delta="kpis.totalUsersDelta"
        icon="User"
        tone="a"
      />
      <KpiCard
        title="今日充值"
        :value="kpis.todayDeposits"
        :delta="kpis.todayDepositsDelta"
        icon="Wallet"
        tone="b"
        prefix="¥"
      />
      <KpiCard
        title="今日提现"
        :value="kpis.todayWithdrawals"
        :delta="kpis.todayWithdrawalsDelta"
        icon="Money"
        tone="c"
        prefix="¥"
        delta-invert
      />
      <KpiCard
        title="活跃用户"
        :value="kpis.activeUsers"
        :delta="kpis.activeUsersDelta"
        icon="Connection"
        tone="d"
      />
      <KpiCard
        title="GGR (毛利)"
        :value="kpis.ggr"
        :delta="kpis.ggrDelta"
        icon="TrendCharts"
        tone="e"
        prefix="¥"
      />
    </div>

    <!-- Charts -->
    <div class="bg-chart-grid">
      <div class="bg-card bg-card--chart bg-chart--wide">
        <div class="bg-card__head">
          <h3>营收趋势</h3>
          <span class="bg-card__meta">近 {{ rangeLabel }}</span>
        </div>
        <v-chart :option="revenueOption" autoresize class="bg-chart" :loading="loading" />
      </div>

      <div class="bg-card bg-card--chart">
        <div class="bg-card__head">
          <h3>用户增长</h3>
          <span class="bg-card__meta">新增 · 活跃</span>
        </div>
        <v-chart :option="growthOption" autoresize class="bg-chart" :loading="loading" />
      </div>
    </div>

    <div class="bg-chart-grid bg-chart-grid--2">
      <div class="bg-card bg-card--chart">
        <div class="bg-card__head">
          <h3>游戏分类投注额</h3>
          <span class="bg-card__meta">TOP 7</span>
        </div>
        <v-chart :option="gamesOption" autoresize class="bg-chart" :loading="loading" />
      </div>

      <div class="bg-card">
        <div class="bg-card__head">
          <h3>快捷操作</h3>
          <span class="bg-card__meta">高频入口</span>
        </div>
        <div class="bg-quick">
          <QuickAction
            v-for="q in quickActions"
            :key="q.label"
            :label="q.label"
            :icon="q.icon"
            :to="q.to"
            :tone="q.tone"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh as RefreshIcon } from '@element-plus/icons-vue'
import api from '@/api'
import KpiCard from './_dashboard/KpiCard.vue'
import QuickAction from './_dashboard/QuickAction.vue'

const router = useRouter()
const loading = ref(false)
const range = ref('7d')
const rangeOptions = [
  { label: '今日', value: '1d' },
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
]
const rangeLabel = computed(() => ({ '1d': '24 小时', '7d': '7 天', '30d': '30 天' }[range.value]))

const nowText = ref(formatNow())
let clockTimer = null
function formatNow() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const kpis = reactive({
  totalUsers: 0, totalUsersDelta: 0,
  todayDeposits: 0, todayDepositsDelta: 0,
  todayWithdrawals: 0, todayWithdrawalsDelta: 0,
  activeUsers: 0, activeUsersDelta: 0,
  ggr: 0, ggrDelta: 0,
})

const trend = reactive({
  dates: [],
  deposits: [],
  withdrawals: [],
  ggr: [],
  newUsers: [],
  activeUsers: [],
  gameCategories: [], // [{ name, value }]
})

const quickActions = [
  { label: '会员管理', icon: 'User', to: '/super/members', tone: 'a' },
  { label: '充值审核', icon: 'Wallet', to: '/super/finance/deposits', tone: 'b' },
  { label: '提现审核', icon: 'Money', to: '/super/finance/withdrawals', tone: 'c' },
  { label: '代理列表', icon: 'UserFilled', to: '/super/agents', tone: 'd' },
  { label: '风控中心', icon: 'Warning', to: '/super/risk', tone: 'e' },
  { label: '公告管理', icon: 'Bell', to: '/super/system/announcements', tone: 'a' },
  { label: '系统设置', icon: 'Setting', to: '/super/system/settings', tone: 'b' },
  { label: '活动管理', icon: 'Present', to: '/super/promotions', tone: 'c' },
]

onMounted(() => {
  refreshAll()
  clockTimer = setInterval(() => { nowText.value = formatNow() }, 60_000)
})
onBeforeUnmount(() => { if (clockTimer) clearInterval(clockTimer) })

async function refreshAll() {
  loading.value = true
  try {
    await Promise.all([fetchKpis(), fetchTrends()])
  } catch (e) {
    ElMessage.warning('部分数据加载失败，已显示缓存/示例数据')
  } finally {
    loading.value = false
  }
}

async function fetchKpis() {
  try {
    const data = await api.get('/api/admin/dashboard')
    applyKpis(data)
  } catch (e) {
    applyKpis(null) // fallback mock
  }
}

async function fetchTrends() {
  try {
    const data = await api.get('/api/admin/dashboard/trends', { params: { range: range.value } })
    applyTrends(data)
  } catch (e) {
    applyTrends(null)
  }
}

function applyKpis(d) {
  const src = d || mockKpis()
  kpis.totalUsers = src.totalUsers ?? 0
  kpis.totalUsersDelta = src.totalUsersDelta ?? 0
  kpis.todayDeposits = src.todayDeposits ?? 0
  kpis.todayDepositsDelta = src.todayDepositsDelta ?? 0
  kpis.todayWithdrawals = src.todayWithdrawals ?? 0
  kpis.todayWithdrawalsDelta = src.todayWithdrawalsDelta ?? 0
  kpis.activeUsers = src.activeUsers ?? 0
  kpis.activeUsersDelta = src.activeUsersDelta ?? 0
  kpis.ggr = src.ggr ?? 0
  kpis.ggrDelta = src.ggrDelta ?? 0
}

function applyTrends(d) {
  const src = d || mockTrends(range.value)
  trend.dates = src.dates || []
  trend.deposits = src.deposits || []
  trend.withdrawals = src.withdrawals || []
  trend.ggr = src.ggr || []
  trend.newUsers = src.newUsers || []
  trend.activeUsers = src.activeUsers || []
  trend.gameCategories = src.gameCategories || []
}

function mockKpis() {
  return {
    totalUsers: 12840, totalUsersDelta: 4.2,
    todayDeposits: 186420, todayDepositsDelta: 8.7,
    todayWithdrawals: 92180, todayWithdrawalsDelta: -3.1,
    activeUsers: 2145, activeUsersDelta: 6.4,
    ggr: 94240, ggrDelta: 12.3,
  }
}
function mockTrends(r) {
  const n = r === '1d' ? 24 : r === '30d' ? 30 : 7
  const dates = Array.from({ length: n }, (_, i) => r === '1d' ? `${String(i).padStart(2, '0')}:00` : `D-${n - i}`)
  const seed = (base, amp) => Array.from({ length: n }, () => Math.round(base + (Math.random() - 0.3) * amp))
  return {
    dates,
    deposits: seed(18000, 22000),
    withdrawals: seed(9500, 12000),
    ggr: seed(7500, 11000),
    newUsers: seed(60, 90),
    activeUsers: seed(1400, 900),
    gameCategories: [
      { name: '真人', value: 48200 },
      { name: '电子', value: 42100 },
      { name: '体育', value: 18700 },
      { name: '彩票', value: 12400 },
      { name: '捕鱼', value: 9800 },
      { name: '棋牌', value: 7600 },
      { name: '其他', value: 3200 },
    ],
  }
}

// Shared ECharts theme tokens
const axis = {
  axisLine: { lineStyle: { color: 'rgba(212,175,55,0.25)' } },
  axisLabel: { color: 'rgba(244,234,208,0.55)', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(212,175,55,0.08)' } },
}
const tooltip = {
  trigger: 'axis',
  backgroundColor: 'rgba(10,14,23,0.92)',
  borderColor: 'rgba(212,175,55,0.35)',
  textStyle: { color: '#f4ead0' },
  axisPointer: { lineStyle: { color: 'rgba(212,175,55,0.35)' } },
}

const revenueOption = computed(() => ({
  grid: { left: 48, right: 24, top: 28, bottom: 36 },
  tooltip,
  legend: {
    data: ['充值', '提现', 'GGR'],
    textStyle: { color: 'rgba(244,234,208,0.72)' },
    top: 0, right: 8,
  },
  xAxis: { type: 'category', boundaryGap: false, data: trend.dates, ...axis },
  yAxis: { type: 'value', ...axis },
  series: [
    {
      name: '充值', type: 'line', smooth: true, data: trend.deposits,
      itemStyle: { color: '#d4af37' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(212,175,55,0.35)' },
            { offset: 1, color: 'rgba(212,175,55,0)' },
          ],
        },
      },
    },
    {
      name: '提现', type: 'line', smooth: true, data: trend.withdrawals,
      itemStyle: { color: '#8c6d1f' },
      lineStyle: { width: 2, type: 'dashed' },
    },
    {
      name: 'GGR', type: 'line', smooth: true, data: trend.ggr,
      itemStyle: { color: '#e8c87a' },
      lineStyle: { width: 3 },
    },
  ],
}))

const growthOption = computed(() => ({
  grid: { left: 40, right: 16, top: 28, bottom: 36 },
  tooltip,
  legend: { data: ['新增', '活跃'], textStyle: { color: 'rgba(244,234,208,0.72)' }, top: 0, right: 8 },
  xAxis: { type: 'category', boundaryGap: false, data: trend.dates, ...axis },
  yAxis: { type: 'value', ...axis },
  series: [
    {
      name: '新增', type: 'line', smooth: true, data: trend.newUsers,
      itemStyle: { color: '#e8c87a' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(232,200,122,0.40)' },
            { offset: 1, color: 'rgba(232,200,122,0)' },
          ],
        },
      },
    },
    {
      name: '活跃', type: 'line', smooth: true, data: trend.activeUsers,
      itemStyle: { color: '#b8902c' },
      lineStyle: { width: 2 },
    },
  ],
}))

const gamesOption = computed(() => ({
  grid: { left: 64, right: 16, top: 12, bottom: 24 },
  tooltip: { ...tooltip, trigger: 'item' },
  xAxis: { type: 'value', ...axis },
  yAxis: {
    type: 'category',
    data: trend.gameCategories.map(c => c.name),
    ...axis,
    axisLabel: { ...axis.axisLabel, color: '#f4ead0', fontWeight: 600 },
  },
  series: [
    {
      type: 'bar',
      data: trend.gameCategories.map(c => c.value),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#b8902c' },
            { offset: 1, color: '#e8c87a' },
          ],
        },
        borderRadius: [0, 6, 6, 0],
      },
      barWidth: 14,
      label: { show: true, position: 'right', color: '#f4ead0', fontSize: 11 },
    },
  ],
}))
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-soft: #e8c87a;
$gold-deep: #b8902c;
$ink-900: #05070d;
$ink-800: #0a0e17;
$ink-700: #111724;
$ink-600: #1a2033;
$line: rgba(212, 175, 55, 0.18);

.bg-dash {
  min-height: 100%;
  padding: 24px;
  color: #f4ead0;
  font-family: 'Manrope', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(212,175,55,0.05), transparent 55%),
    $ink-800;
}

.bg-dash__head {
  display: flex; align-items: flex-end; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.bg-dash__title {
  margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em;
  background: linear-gradient(135deg, #fff 0%, $gold-soft 60%, $gold 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.bg-dash__subtitle {
  margin: 2px 0 0; font-size: 12px; letter-spacing: 0.08em; color: rgba(244,234,208,0.48);
}
.bg-dash__actions { display: inline-flex; align-items: center; gap: 12px; }

.bg-btn-ghost {
  background: rgba(10,14,23,0.6) !important;
  border: 1px solid $line !important;
  color: $gold-soft !important;
  &:hover { border-color: $gold !important; color: #fff !important; }
}
.bg-seg :deep(.el-segmented) {
  --el-segmented-bg-color: rgba(10,14,23,0.6);
  --el-segmented-item-selected-bg-color: linear-gradient(135deg, #e8c87a, #d4af37 50%, #b8902c);
  --el-segmented-item-selected-color: #05070d;
  --el-segmented-color: rgba(244,234,208,0.7);
  border: 1px solid $line; border-radius: 10px;
}

.bg-kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px; margin-bottom: 18px;
}
.bg-chart-grid {
  display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 14px; margin-bottom: 14px;
  &--2 { grid-template-columns: 1fr 1fr; }
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
}

.bg-card {
  position: relative;
  border-radius: 14px;
  border: 1px solid $line;
  background: linear-gradient(180deg, rgba(26,32,51,0.86) 0%, rgba(10,14,23,0.86) 100%);
  box-shadow: 0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.02);
  backdrop-filter: blur(16px) saturate(1.3);
  padding: 18px;
  overflow: hidden;

  &--chart { min-height: 320px; }
}
.bg-card__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
  h3 { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; color: #f4ead0; }
}
.bg-card__meta {
  font-size: 11px; letter-spacing: 0.1em; color: rgba(244,234,208,0.45);
}
.bg-chart { height: 280px; width: 100%; }

.bg-quick {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
</style>
