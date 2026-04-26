<template>
  <div>
    <h2 class="section-title">代理控制台</h2>
    <div class="kpi-row">
      <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.prefix || '' }}{{ kpi.value }}</div>
        <div class="kpi-change" v-if="kpi.change">较昨日 <span :style="{ color: kpi.change > 0 ? '#67c23a' : '#f56c6c' }">{{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%</span></div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
      <div class="chart-container">
        <div class="chart-title">7日盈亏趋势</div>
        <v-chart :option="profitChart" style="height: 300px;" autoresize />
      </div>
      <div class="chart-container">
        <div class="chart-title">游戏分类收入</div>
        <v-chart :option="categoryChart" style="height: 300px;" autoresize />
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
      <div class="table-card">
        <div class="chart-title">待处理任务</div>
        <el-table :data="pendingTasks" stripe size="small">
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }"><el-tag :type="row.urgent ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="count" label="数量" width="80" />
          <el-table-column prop="amount" label="金额" width="120" />
          <el-table-column label="操作" width="80">
            <template #default><el-button size="small" type="primary" text>处理</el-button></template>
          </el-table-column>
        </el-table>
      </div>
      <div class="table-card">
        <div class="chart-title">信用余额</div>
        <div style="padding: 20px; text-align: center;">
          <el-statistic title="当前余额" :value="128500" prefix="¥" :value-style="{ fontSize: '32px', color: '#409eff' }" />
          <div style="margin-top: 16px;">
            <el-button type="primary">申请充值</el-button>
          </div>
          <el-divider />
          <div style="display: flex; justify-content: space-around;">
            <el-statistic title="本月消耗" :value="45200" prefix="¥" />
            <el-statistic title="本月结算" :value="38000" prefix="¥" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/dashboard'

const kpis = ref([
  { label: '今日新增', value: 0, color: '#409eff', change: 0 },
  { label: '今日活跃', value: 0, color: '#67c23a', change: 0 },
  { label: '当前在线', value: 0, color: '#67c23a' },
  { label: '今日充值', value: '0.0万', prefix: '¥', color: '#409eff', change: 0 },
  { label: '今日提现', value: '0.0万', prefix: '¥', color: '#e6a23c', change: 0 },
  { label: '今日盈利', value: '0.0万', prefix: '¥', color: '#f56c6c', change: 0 }
])

onMounted(async () => {
  try {
    const data = await getDashboard()
    if (data?.kpi) {
      const k = data.kpi
      kpis.value = [
        { label: '今日新增', value: k.todayNewMembers || 0, color: '#409eff', change: 0 },
        { label: '今日活跃', value: k.todayActiveMembers || 0, color: '#67c23a', change: 0 },
        { label: '当前在线', value: k.onlineCount || 0, color: '#67c23a' },
        { label: '今日充值', value: ((k.todayDeposit || 0) / 10000).toFixed(1) + '万', prefix: '¥', color: '#409eff', change: 0 },
        { label: '今日提现', value: ((k.todayWithdrawal || 0) / 10000).toFixed(1) + '万', prefix: '¥', color: '#e6a23c', change: 0 },
        { label: '今日盈利', value: ((k.todayProfit || 0) / 10000).toFixed(1) + '万', prefix: '¥', color: '#f56c6c', change: 0 }
      ]
    }
  } catch (e) { console.warn('API request failed', e) }
})

const pendingTasks = ref([])

const profitChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['充值', '提现', '净利润'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 50, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: [], axisLabel: { color: '#888' } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v/10000)+'万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '充值', type: 'bar', data: [], itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'bar', data: [], itemStyle: { color: '#e6a23c' } },
    { name: '净利润', type: 'line', smooth: true, data: [], itemStyle: { color: '#67c23a' } }
  ]
}

const categoryChart = {
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#a0a0b0' } },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: [],
    label: { color: '#a0a0b0' }
  }]
}
</script>
