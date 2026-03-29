<template>
  <div>
    <h2 class="section-title">财务报表</h2>
    <div class="filter-bar">
      <el-radio-group v-model="period" @change="updateData">
        <el-radio-button value="daily">日报</el-radio-button>
        <el-radio-button value="weekly">周报</el-radio-button>
        <el-radio-button value="monthly">月报</el-radio-button>
      </el-radio-group>
      <el-button type="primary" plain><el-icon><Download /></el-icon>导出Excel</el-button>
    </div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-label">总充值</div><div class="kpi-value" style="color:#409eff;">¥{{ formatM(totals.deposit) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">总提现</div><div class="kpi-value" style="color:#e6a23c;">¥{{ formatM(totals.withdrawal) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">总奖金</div><div class="kpi-value" style="color:#909399;">¥{{ formatM(totals.bonus) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">GGR</div><div class="kpi-value" style="color:#67c23a;">¥{{ formatM(totals.ggr) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">NGR</div><div class="kpi-value" style="color:#f56c6c;">¥{{ formatM(totals.ngr) }}</div></div>
    </div>
    <div class="chart-container">
      <div class="chart-title">收支趋势</div>
      <v-chart :option="chartOption" style="height: 350px;" autoresize />
    </div>
    <div class="table-card">
      <el-table :data="data" stripe show-summary :summary-method="getSummary">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="充值" width="130"><template #default="{ row }">¥{{ row.deposit.toLocaleString() }}</template></el-table-column>
        <el-table-column label="提现" width="130"><template #default="{ row }">¥{{ row.withdrawal.toLocaleString() }}</template></el-table-column>
        <el-table-column label="奖金" width="130"><template #default="{ row }">¥{{ row.bonus.toLocaleString() }}</template></el-table-column>
        <el-table-column label="GGR" width="130"><template #default="{ row }"><span style="color:#67c23a;">¥{{ row.ggr.toLocaleString() }}</span></template></el-table-column>
        <el-table-column label="NGR" width="130"><template #default="{ row }"><span style="color:#f56c6c;">¥{{ row.ngr.toLocaleString() }}</span></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getFinancialSummary } from '@/api/finance'
import { financialSummary } from '@/mock/data'

const period = ref('daily')
const data = ref([...financialSummary])

onMounted(async () => {
  try {
    const res = await getFinancialSummary()
    if (res?.length) data.value = res
  } catch (e) { console.warn('Financial summary API failed, using mock data', e) }
})
const formatM = n => (n / 10000).toFixed(1) + '万'

const totals = computed(() => {
  const t = { deposit: 0, withdrawal: 0, bonus: 0, ggr: 0, ngr: 0 }
  data.value.forEach(r => { Object.keys(t).forEach(k => t[k] += r[k]) })
  return t
})

function updateData() { /* mock - same data for all periods */ }

function getSummary({ columns, data: tableData }) {
  const sums = []
  columns.forEach((col, i) => {
    if (i === 0) { sums[i] = '合计'; return }
    const key = ['', 'deposit', 'withdrawal', 'bonus', 'ggr', 'ngr'][i]
    sums[i] = '¥' + tableData.reduce((t, r) => t + (r[key] || 0), 0).toLocaleString()
  })
  return sums
}

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['充值', '提现', 'GGR', 'NGR'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: data.value.map(d => d.date), axisLabel: { color: '#888' }, axisLine: { lineStyle: { color: '#333' } } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v/10000)+'万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '充值', type: 'bar', data: data.value.map(d => d.deposit), itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'bar', data: data.value.map(d => d.withdrawal), itemStyle: { color: '#e6a23c' } },
    { name: 'GGR', type: 'line', data: data.value.map(d => d.ggr), smooth: true, itemStyle: { color: '#67c23a' } },
    { name: 'NGR', type: 'line', data: data.value.map(d => d.ngr), smooth: true, itemStyle: { color: '#f56c6c' } }
  ]
}))
</script>
