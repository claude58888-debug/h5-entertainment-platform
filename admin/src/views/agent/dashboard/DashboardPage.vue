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
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { agentDashboardKPI } from '@/mock/data'

const kpis = ref(agentDashboardKPI)

const pendingTasks = ref([
  { type: '提现审批', count: 8, amount: '¥125,000', urgent: true },
  { type: '充值确认', count: 3, amount: '¥45,000', urgent: false },
  { type: '客服工单', count: 5, amount: '-', urgent: false }
])

const profitChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['充值', '提现', '净利润'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 50, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07'], axisLabel: { color: '#888' } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v/10000)+'万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '充值', type: 'bar', data: [85000, 92000, 78000, 105000, 88000, 96000, 110000], itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'bar', data: [62000, 71000, 55000, 82000, 68000, 74000, 85000], itemStyle: { color: '#e6a23c' } },
    { name: '净利润', type: 'line', smooth: true, data: [23000, 21000, 23000, 23000, 20000, 22000, 25000], itemStyle: { color: '#67c23a' } }
  ]
}

const categoryChart = {
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#a0a0b0' } },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: [
      { value: 45, name: '电子游戏', itemStyle: { color: '#409eff' } },
      { value: 20, name: '真人视讯', itemStyle: { color: '#67c23a' } },
      { value: 15, name: '捕鱼游戏', itemStyle: { color: '#e6a23c' } },
      { value: 10, name: '体育竞猜', itemStyle: { color: '#f56c6c' } },
      { value: 10, name: '其他', itemStyle: { color: '#909399' } }
    ],
    label: { color: '#a0a0b0' }
  }]
}
</script>
