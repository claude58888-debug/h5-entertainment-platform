<template>
  <div>
    <h2 class="section-title">财务报表 (Financial Report)</h2>

    <!-- Date Range & Period Controls -->
    <div class="filter-bar" style="margin-bottom: 20px;">
      <el-radio-group v-model="period" @change="loadData">
        <el-radio-button value="daily">日报</el-radio-button>
        <el-radio-button value="weekly">周报</el-radio-button>
        <el-radio-button value="monthly">月报</el-radio-button>
      </el-radio-group>
      <div style="display: flex; align-items: center; gap: 8px;">
        <el-button size="small" :type="presetRange === 'today' ? 'primary' : ''" @click="setPreset('today')">今日</el-button>
        <el-button size="small" :type="presetRange === '7d' ? 'primary' : ''" @click="setPreset('7d')">近7天</el-button>
        <el-button size="small" :type="presetRange === '30d' ? 'primary' : ''" @click="setPreset('30d')">近30天</el-button>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px;" value-format="YYYY-MM-DD" @change="onDateChange" />
      </div>
      <el-button type="primary" plain @click="exportCSV"><el-icon><Download /></el-icon>导出CSV</el-button>
    </div>

    <!-- P&L Summary KPIs -->
    <div class="kpi-row" style="margin-bottom: 20px;">
      <div class="kpi-card">
        <div class="kpi-label">总充值</div>
        <div class="kpi-value" style="color:#409eff;">¥{{ formatM(totals.deposit) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总提现</div>
        <div class="kpi-value" style="color:#e6a23c;">¥{{ formatM(totals.withdrawal) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总奖金/优惠</div>
        <div class="kpi-value" style="color:#909399;">¥{{ formatM(totals.bonus) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">GGR (毛收入)</div>
        <div class="kpi-value" style="color:#67c23a;">¥{{ formatM(totals.ggr) }}</div>
        <div class="kpi-sub">充值 - 提现</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">NGR (净收入)</div>
        <div class="kpi-value" style="color:#f56c6c;">¥{{ formatM(totals.ngr) }}</div>
        <div class="kpi-sub">GGR - 奖金</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">利润率</div>
        <div class="kpi-value" :style="{ color: profitMargin >= 0 ? '#67c23a' : '#f56c6c' }">{{ profitMargin.toFixed(1) }}%</div>
        <div class="kpi-sub">NGR / 充值</div>
      </div>
    </div>

    <!-- Revenue by Game Category -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
      <div class="table-card" style="flex: 2; min-width: 400px;">
        <div class="chart-title">收支趋势</div>
        <v-chart :option="trendChartOption" style="height: 350px;" autoresize />
      </div>
      <div class="table-card" style="flex: 1; min-width: 300px;">
        <div class="chart-title">游戏类别收入占比</div>
        <v-chart :option="categoryPieOption" style="height: 350px;" autoresize />
      </div>
    </div>

    <!-- Daily Detail Table -->
    <div class="table-card">
      <h3 style="margin: 0 0 16px; font-size: 16px; color: #e0e0e0;">明细数据</h3>
      <el-table :data="filteredData" stripe show-summary :summary-method="getSummary">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="充值" width="130">
          <template #default="{ row }">¥{{ row.deposit.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="提现" width="130">
          <template #default="{ row }">¥{{ row.withdrawal.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="奖金" width="130">
          <template #default="{ row }">¥{{ row.bonus.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="GGR" width="130">
          <template #default="{ row }"><span style="color:#67c23a;">¥{{ row.ggr.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="NGR" width="130">
          <template #default="{ row }"><span :style="{ color: row.ngr >= 0 ? '#67c23a' : '#f56c6c' }">¥{{ row.ngr.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="利润率" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.deposit > 0 && (row.ngr / row.deposit * 100) >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ row.deposit > 0 ? (row.ngr / row.deposit * 100).toFixed(1) : '0.0' }}%
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Revenue by Category Table -->
    <div class="table-card" style="margin-top: 20px;">
      <h3 style="margin: 0 0 16px; font-size: 16px; color: #e0e0e0;">游戏类别收入明细</h3>
      <el-table :data="categoryRevenue" stripe>
        <el-table-column prop="category" label="类别" width="140" />
        <el-table-column label="总投注" width="150">
          <template #default="{ row }">¥{{ row.totalBets.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="总赢额" width="150">
          <template #default="{ row }">¥{{ row.totalWins.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="GGR" width="150">
          <template #default="{ row }"><span style="color:#67c23a;">¥{{ row.ggr.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="占比" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :stroke-width="12" :color="row.ggr >= 0 ? '#67c23a' : '#f56c6c'" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getFinancialReport, getGameCategoryRevenue, exportFinancialCSV } from '@/api/finance'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const period = ref('daily')
const dateRange = ref(null)
const presetRange = ref('7d')
const data = ref([])
const categoryRevenue = ref([])

onMounted(() => {
  setPreset('7d')
  loadCategoryData()
})

function setPreset(preset) {
  presetRange.value = preset
  const today = new Date()
  const fmt = d => d.toISOString().slice(0, 10)
  if (preset === 'today') {
    dateRange.value = [fmt(today), fmt(today)]
  } else if (preset === '7d') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    dateRange.value = [fmt(start), fmt(today)]
  } else if (preset === '30d') {
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    dateRange.value = [fmt(start), fmt(today)]
  }
  loadData()
}

function onDateChange() {
  presetRange.value = ''
  loadData()
}

async function loadData() {
  try {
    const params = { period: period.value }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getFinancialReport(params)
    if (res && res.length) data.value = res
  } catch (e) {
    console.warn('API request failed', e)
  }
}

async function loadCategoryData() {
  try {
    const res = await getGameCategoryRevenue()
    categoryRevenue.value = res || []
  } catch (e) {
    console.warn('Category revenue failed', e)
  }
}

const filteredData = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return data.value
  return data.value.filter(r => r.date >= dateRange.value[0] && r.date <= dateRange.value[1])
})

const formatM = n => {
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

const totals = computed(() => {
  const t = { deposit: 0, withdrawal: 0, bonus: 0, ggr: 0, ngr: 0 }
  filteredData.value.forEach(r => {
    Object.keys(t).forEach(k => { t[k] += r[k] || 0 })
  })
  return t
})

const profitMargin = computed(() => {
  if (!totals.value.deposit) return 0
  return (totals.value.ngr / totals.value.deposit) * 100
})

function getSummary({ columns, data: tableData }) {
  const sums = []
  columns.forEach((col, i) => {
    if (i === 0) { sums[i] = '合计'; return }
    const key = ['', 'deposit', 'withdrawal', 'bonus', 'ggr', 'ngr', ''][i]
    if (key) {
      sums[i] = '¥' + tableData.reduce((t, r) => t + (r[key] || 0), 0).toLocaleString()
    } else {
      const totalDeposit = tableData.reduce((t, r) => t + (r.deposit || 0), 0)
      const totalNgr = tableData.reduce((t, r) => t + (r.ngr || 0), 0)
      sums[i] = totalDeposit > 0 ? (totalNgr / totalDeposit * 100).toFixed(1) + '%' : '0.0%'
    }
  })
  return sums
}

const trendChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['充值', '提现', 'GGR', 'NGR'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: filteredData.value.map(d => d.date), axisLabel: { color: '#888' }, axisLine: { lineStyle: { color: '#333' } } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => v >= 10000 ? (v / 10000) + '万' : v }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '充值', type: 'bar', data: filteredData.value.map(d => d.deposit), itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'bar', data: filteredData.value.map(d => d.withdrawal), itemStyle: { color: '#e6a23c' } },
    { name: 'GGR', type: 'line', data: filteredData.value.map(d => d.ggr), smooth: true, itemStyle: { color: '#67c23a' } },
    { name: 'NGR', type: 'line', data: filteredData.value.map(d => d.ngr), smooth: true, itemStyle: { color: '#f56c6c' } }
  ]
}))

const categoryPieOption = computed(() => {
  const items = categoryRevenue.value.filter(c => c.ggr > 0)
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#a0a0b0' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['55%', '50%'],
      data: items.map(c => ({ name: c.category, value: c.ggr })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      label: { color: '#a0a0b0' }
    }]
  }
})

async function exportCSV() {
  try {
    const params = { period: period.value }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const response = await exportFinancialCSV(params)
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial_report_${period.value}.csv`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.kpi-sub {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}
</style>
