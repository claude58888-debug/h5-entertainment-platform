<template>
  <div>
    <h2 class="section-title">总控仪表盘</h2>
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">总会员数</div>
        <div class="kpi-value">{{ formatNum(kpi.totalMembers) }}</div>
        <div class="kpi-change up">↑ 2.3% 较昨日</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日新增</div>
        <div class="kpi-value">{{ kpi.todayNewMembers }}</div>
        <div class="kpi-change up">↑ 15 较昨日</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">当前在线</div>
        <div class="kpi-value" style="color: #67c23a;">{{ formatNum(kpi.onlineNow) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日充值</div>
        <div class="kpi-value" style="color: #409eff;">¥{{ formatMoney(kpi.todayDeposit) }}</div>
        <div class="kpi-change up">↑ 8.2%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日提现</div>
        <div class="kpi-value" style="color: #e6a23c;">¥{{ formatMoney(kpi.todayWithdrawal) }}</div>
        <div class="kpi-change down">↓ 3.1%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">今日盈利</div>
        <div class="kpi-value" style="color: #f56c6c;">¥{{ formatMoney(kpi.todayProfit) }}</div>
        <div class="kpi-change up">↑ 12.5%</div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <div class="chart-title">7日收入趋势</div>
        <v-chart :option="lineOption" style="height: 300px;" autoresize />
      </div>
      <div class="chart-container">
        <div class="chart-title">Top 5 游戏 GGR</div>
        <v-chart :option="barOption" style="height: 300px;" autoresize />
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-container">
        <div class="chart-title">充值渠道分布</div>
        <v-chart :option="pieOption" style="height: 300px;" autoresize />
      </div>
      <div class="alerts-panel">
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
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { superDashboardKPI, revenueTrend, topGamesGGR, depositByChannel, realtimeAlerts } from '@/mock/data'

const kpi = superDashboardKPI
const alerts = realtimeAlerts

function formatNum(n) { return n?.toLocaleString() || '0' }
function formatMoney(n) { return (n / 10000).toFixed(1) + '万' }

const lineOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['收入', '充值', '提现'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: revenueTrend.map(i => i.date), axisLabel: { color: '#888' }, axisLine: { lineStyle: { color: '#333' } } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v / 10000) + '万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '收入', type: 'line', data: revenueTrend.map(i => i.revenue), smooth: true, itemStyle: { color: '#f56c6c' } },
    { name: '充值', type: 'line', data: revenueTrend.map(i => i.deposit), smooth: true, itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'line', data: revenueTrend.map(i => i.withdrawal), smooth: true, itemStyle: { color: '#e6a23c' } }
  ]
}))

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 100, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v / 10000) + '万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  yAxis: { type: 'category', data: topGamesGGR.map(i => i.name).reverse(), axisLabel: { color: '#e0e0e0' } },
  series: [{ type: 'bar', data: topGamesGGR.map(i => i.ggr).reverse(), itemStyle: { color: '#e6a23c', borderRadius: [0, 4, 4, 0] } }]
}))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
  legend: { orient: 'vertical', right: 20, top: 'center', textStyle: { color: '#a0a0b0' } },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
    data: depositByChannel,
    label: { show: false },
    itemStyle: { borderRadius: 6, borderColor: '#1e1e2e', borderWidth: 2 }
  }]
}))
</script>
