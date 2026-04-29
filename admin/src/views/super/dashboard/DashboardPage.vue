<template>
  <div>
    <h2 class="section-title">总控仪表盘</h2>

    <!-- Alert notification bar -->
    <div v-if="alertsLoaded && (alertData.pendingWithdrawals || alertData.pendingKyc || alertData.suspiciousActivities)" class="alert-notification-bar">
      <div class="alert-notification-item" @click="$router.push('/super/finance/withdrawals')">
        <el-badge :value="alertData.pendingWithdrawals" :hidden="!alertData.pendingWithdrawals" type="danger">
          <span class="alert-notification-label">待处理提现</span>
        </el-badge>
      </div>
      <div class="alert-notification-item" @click="$router.push('/super/compliance/kyc')">
        <el-badge :value="alertData.pendingKyc" :hidden="!alertData.pendingKyc" type="warning">
          <span class="alert-notification-label">待审核KYC</span>
        </el-badge>
      </div>
      <div class="alert-notification-item" @click="$router.push('/super/risk')">
        <el-badge :value="alertData.suspiciousActivities" :hidden="!alertData.suspiciousActivities" type="danger">
          <span class="alert-notification-label">可疑活动</span>
        </el-badge>
      </div>
    </div>

    <!-- Time range filter -->
    <div class="date-filter-bar">
      <el-radio-group v-model="dateRange" size="small" @change="onDateRangeChange">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="yesterday">昨日</el-radio-button>
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-if="dateRange === 'custom'"
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="margin-left: 12px;"
        @change="onCustomDateChange"
        :shortcuts="dateShortcuts"
      />
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">总会员数</div>
        <div class="kpi-value">{{ formatNum(kpi.totalMembers) }}</div>
        <div class="kpi-change" :class="changeClass(kpiChanges.totalMembers)">{{ changeArrow(kpiChanges.totalMembers) }} {{ Math.abs(kpiChanges.totalMembers || 0) }}% 较上期</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">新增会员</div>
        <div class="kpi-value">{{ kpi.todayNewMembers }}</div>
        <div class="kpi-change" :class="changeClass(kpiChanges.todayNewMembers)">{{ changeArrow(kpiChanges.todayNewMembers) }} {{ kpiChanges.todayNewMembers > 0 ? '+' : '' }}{{ kpiChanges.todayNewMembers || 0 }} 较上期</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">当前在线</div>
        <div class="kpi-value" style="color: #10b981;">{{ formatNum(onlineUsers) }}</div>
        <div class="kpi-change" style="color: #67c23a; font-size: 11px;">实时更新中</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">充值金额</div>
        <div class="kpi-value" style="color: #3b82f6;">¥{{ formatMoney(kpi.todayDeposit) }}</div>
        <div class="kpi-change" :class="changeClass(kpiChanges.todayDeposit)">{{ changeArrow(kpiChanges.todayDeposit) }} {{ Math.abs(kpiChanges.todayDeposit || 0) }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">提现金额</div>
        <div class="kpi-value" style="color: #d4a843;">¥{{ formatMoney(kpi.todayWithdrawal) }}</div>
        <div class="kpi-change" :class="changeClass(-(kpiChanges.todayWithdrawal || 0))">{{ changeArrow(-(kpiChanges.todayWithdrawal || 0)) }} {{ Math.abs(kpiChanges.todayWithdrawal || 0) }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">盈利金额</div>
        <div class="kpi-value" style="color: #f3c869;">¥{{ formatMoney(kpi.todayProfit) }}</div>
        <div class="kpi-change" :class="changeClass(kpiChanges.todayProfit)">{{ changeArrow(kpiChanges.todayProfit) }} {{ Math.abs(kpiChanges.todayProfit || 0) }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总代理数</div>
        <div class="kpi-value" style="color: #a78bfa;">{{ formatNum(kpi.totalAgents) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">活跃代理</div>
        <div class="kpi-value" style="color: #10b981;">{{ formatNum(kpi.activeAgents) }}</div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <div class="chart-title">收入趋势</div>
        <v-chart :option="lineOption" style="height: 300px;" autoresize />
      </div>
      <div class="chart-container">
        <div class="chart-title">Top 5 游戏 GGR</div>
        <v-chart :option="barOption" style="height: 300px;" autoresize />
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <div class="chart-title">分类维度 GGR Top10</div>
        <v-chart :option="categoryGgrOption" style="height: 300px;" autoresize />
      </div>
      <div class="chart-container">
        <div class="chart-title">充值渠道分布</div>
        <v-chart :option="pieOption" style="height: 300px;" autoresize />
      </div>
    </div>

    <div class="chart-row">
      <div class="alerts-panel" style="flex: 1;">
        <div class="chart-title">实时预警</div>
        <div v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div class="alert-info">
            <div class="alert-text">
              <el-tag :type="alert.level === 'high' ? 'danger' : 'warning'" size="small" style="margin-right: 8px;">
                {{ alert.level === 'high' ? '高' : '中' }}
              </el-tag>
              {{ alert.text }}
            </div>
            <div class="alert-time">{{ alert.time }}</div>
          </div>
          <el-button size="small" type="primary" text>处理</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getDashboard, getDashboardAlerts } from '@/api/dashboard'
import api from '@/api/index'

const kpi = ref({})
const kpiChanges = ref({})
const alerts = ref([])
const revenueTrendData = ref([])
const topGamesData = ref([])
const depositChannelData = ref([])
const categoryGgrData = ref([])
const alertData = ref({ pendingWithdrawals: 0, pendingKyc: 0, suspiciousActivities: 0 })
const alertsLoaded = ref(false)
const onlineUsers = ref(0)


const dateRange = ref('today')
const customDateRange = ref(null)

const dateShortcuts = [
  { text: '最近7天', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 7); return [s, e] } },
  { text: '最近30天', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 30); return [s, e] } },
  { text: '最近90天', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 90); return [s, e] } }
]

function formatDate(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateParams() {
  const now = new Date()
  const today = formatDate(now)
  switch (dateRange.value) {
    case 'today':
      return { startDate: today, endDate: today }
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      const yd = formatDate(y)
      return { startDate: yd, endDate: yd }
    }
    case 'week': {
      const w = new Date(now)
      const day = w.getDay() || 7
      w.setDate(w.getDate() - day + 1)
      return { startDate: formatDate(w), endDate: today }
    }
    case 'month': {
      const m = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: formatDate(m), endDate: today }
    }
    case 'custom':
      if (customDateRange.value && customDateRange.value.length === 2) {
        return { startDate: customDateRange.value[0], endDate: customDateRange.value[1] }
      }
      return {}
    default:
      return {}
  }
}

async function fetchDashboard() {
  try {
    const params = getDateParams()
    const data = await getDashboard(params)
    if (data.kpi) {
      kpi.value = data.kpi
      kpiChanges.value = data.kpi.changes || {}
    }
    revenueTrendData.value = data.revenueTrend || []
    topGamesData.value = data.topGamesGGR || []
    depositChannelData.value = data.depositByChannel || []
    alerts.value = data.realtimeAlerts || []
  } catch (e) {
    console.warn('API request failed', e)
  }
  try {
    const cRes = await api.get('/api/admin/category-ggr')
    categoryGgrData.value = cRes.data || []
  } catch (e) { console.warn('Category GGR fetch failed', e) }
}

async function fetchAlerts() {
  try {
    const data = await getDashboardAlerts()
    alertData.value = data
    alertsLoaded.value = true
  } catch (e) {
    console.warn('Alerts API failed', e)
  }
}

function onDateRangeChange() {
  if (dateRange.value !== 'custom') {
    fetchDashboard()
  }
}

function onCustomDateChange() {
  if (customDateRange.value && customDateRange.value.length === 2) {
    fetchDashboard()
  }
}

onMounted(() => {
  fetchDashboard()
  fetchAlerts()
  onlineUsers.value = kpi.value.onlineNow || 0
})



function formatNum(n) { return n?.toLocaleString() || '0' }
function formatMoney(n) {
  const v = n || 0
  if (v === 0) return '0'
  if (Math.abs(v) < 10000) return v.toFixed(2)
  return (v / 10000).toFixed(1) + '万'
}
function changeClass(val) { return val > 0 ? 'up' : val < 0 ? 'down' : '' }
function changeArrow(val) { return val > 0 ? '↑' : val < 0 ? '↓' : '→' }

const lineOption = computed(() => {
  const dates = revenueTrendData.value.map(i => i.date)
  // Generate default 7-day date range if no data from API
  const defaultDates = []
  if (!dates.length) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      defaultDates.push(d.toISOString().split('T')[0])
    }
  }
  const xDates = dates.length ? dates : defaultDates
  const revenueData = revenueTrendData.value.map(i => i.revenue)
  const depositData = revenueTrendData.value.map(i => i.deposit)
  const withdrawData = revenueTrendData.value.map(i => i.withdrawal)
  return {
    tooltip: { trigger: 'axis', formatter: (params) => { let s = params[0].axisValue + '<br/>'; params.forEach(p => { const v = p.value || 0; const label = Math.abs(v) >= 10000 ? parseFloat((v / 10000).toFixed(1)) + '万' : parseFloat(v.toFixed(2)); s += p.marker + p.seriesName + ': ¥' + label + '<br/>'; }); return s } },
    backgroundColor: 'transparent',
    legend: { data: ['收入', '充值', '提现'], textStyle: { color: '#a0a0b0' } },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: xDates, boundaryGap: false, axisLabel: { color: '#888' }, axisLine: { lineStyle: { color: 'rgba(212,168,67,0.12)' } } },
    yAxis: { type: 'value', min: 0, axisLabel: { color: '#888', formatter: v => { if (v === 0) return '0'; if (Math.abs(v) >= 10000) return parseFloat((v / 10000).toFixed(1)) + '万'; return '¥' + parseFloat(v.toFixed(2)) } }, splitLine: { lineStyle: { color: 'rgba(212,168,67,0.06)' } } },
    series: [
      { name: '收入', type: 'line', data: revenueData, smooth: true, itemStyle: { color: '#d4a843' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(212,168,67,0.3)' }, { offset: 1, color: 'rgba(212,168,67,0.02)' }] } }, showSymbol: true, symbolSize: 6 },
      { name: '充值', type: 'line', data: depositData, smooth: true, itemStyle: { color: '#3b82f6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } }, showSymbol: true, symbolSize: 6 },
      { name: '提现', type: 'line', data: withdrawData, smooth: true, itemStyle: { color: '#10b981' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }] } }, showSymbol: true, symbolSize: 6 }
    ]
  }
})

const barOption = computed(() => {
  const source = topGamesData.value
  const names = source.map(i => i.name).reverse()
  const values = source.map(i => i.ggr).reverse()
  const colors = ['#d4a843', '#3b82f6', '#10b981', '#a78bfa', '#ef4444'].reverse()
  return {
    tooltip: { trigger: 'axis', formatter: (params) => { const p = params[0]; const v = p.value || 0; const label = Math.abs(v) >= 10000 ? parseFloat((v / 10000).toFixed(1)) + '万' : parseFloat(v.toFixed(2)); return p.name + ': ¥' + label } },
    grid: { left: 110, right: 30, top: 10, bottom: 30 },
    backgroundColor: 'transparent',
    xAxis: { type: 'value', min: 0, axisLabel: { color: '#888', formatter: v => { if (v === 0) return '0'; if (Math.abs(v) >= 10000) return parseFloat((v / 10000).toFixed(1)) + '万'; return '¥' + parseFloat(v.toFixed(2)) } }, splitLine: { lineStyle: { color: 'rgba(212,168,67,0.06)' } } },
    yAxis: { type: 'category', data: names, axisLabel: { color: '#e0e0e0' } },
    series: [{ type: 'bar', data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i % colors.length] } })), barWidth: 20, itemStyle: { borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#ccc', formatter: (p) => { const v = p.value || 0; if (Math.abs(v) >= 10000) return '¥' + parseFloat((v / 10000).toFixed(1)) + '万'; return '¥' + parseFloat(v.toFixed(2)) } } }]
  }
})

const categoryGgrOption = computed(() => {
  const source = categoryGgrData.value.filter(c => c.ggr > 0).sort((a, b) => b.ggr - a.ggr).slice(0, 10)
  if (!source.length) {
    return { title: { text: '暂无分类GGR数据', left: 'center', top: 'center', textStyle: { color: '#666', fontSize: 14 } }, series: [] }
  }
  const names = source.map(i => i.category).reverse()
  const values = source.map(i => i.ggr).reverse()
  const colors = ['#d4a843', '#3b82f6', '#10b981', '#a78bfa', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']
  return {
    tooltip: { trigger: 'axis', formatter: (params) => { const p = params[0]; const v = p.value || 0; const label = Math.abs(v) >= 10000 ? parseFloat((v / 10000).toFixed(1)) + '万' : parseFloat(v.toFixed(2)); return p.name + ': ¥' + label } },
    grid: { left: 80, right: 30, top: 10, bottom: 30 },
    backgroundColor: 'transparent',
    xAxis: { type: 'value', min: 0, axisLabel: { color: '#888', formatter: v => { if (v === 0) return '0'; if (Math.abs(v) >= 10000) return parseFloat((v / 10000).toFixed(1)) + '万'; return '¥' + parseFloat(v.toFixed(2)) } }, splitLine: { lineStyle: { color: 'rgba(212,168,67,0.06)' } } },
    yAxis: { type: 'category', data: names, axisLabel: { color: '#e0e0e0' } },
    series: [{ type: 'bar', data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i % colors.length] } })), barWidth: 20, itemStyle: { borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#ccc', formatter: (p) => { const v = p.value || 0; if (Math.abs(v) >= 10000) return '¥' + parseFloat((v / 10000).toFixed(1)) + '万'; return '¥' + parseFloat(v.toFixed(2)) } } }]
  }
})

const pieOption = computed(() => {
  const hasData = depositChannelData.value && depositChannelData.value.length > 0
  if (!hasData) {
    return {
      title: { text: '暂无充值数据', left: 'center', top: 'center', textStyle: { color: '#666', fontSize: 14 } },
      series: []
    }
  }
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', right: 20, top: 'center', textStyle: { color: '#a0a0b0' } },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      data: depositChannelData.value,
      label: { show: false },
      itemStyle: { borderRadius: 6, borderColor: '#141022', borderWidth: 2 }
    }]
  }
})
</script>

<style scoped>
.alert-notification-bar {
  display: flex;
  gap: 24px;
  padding: 12px 20px;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}
.alert-notification-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.alert-notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.alert-notification-label {
  font-size: 14px;
  color: #e0e0e0;
}
.date-filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
</style>
