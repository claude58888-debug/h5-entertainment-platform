<template>
  <div>
    <h2 class="section-title">数据报表</h2>
    <div class="filter-bar">
      <el-radio-group v-model="period" @change="updateData">
        <el-radio-button value="daily">日报</el-radio-button>
        <el-radio-button value="weekly">周报</el-radio-button>
        <el-radio-button value="monthly">月报</el-radio-button>
      </el-radio-group>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" />
      <el-dropdown>
        <el-button type="primary" plain><el-icon><Download /></el-icon>导出报表</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="ElMessage.success('Excel导出中...')">导出Excel</el-dropdown-item>
            <el-dropdown-item @click="ElMessage.success('PDF导出中...')">导出PDF</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-tabs v-model="reportTab">
      <el-tab-pane label="财务汇总" name="financial">
        <div class="kpi-row">
          <div class="kpi-card"><div class="kpi-label">总充值</div><div class="kpi-value" style="color:#409eff;">¥{{ formatM(totals.deposit) }}</div></div>
          <div class="kpi-card"><div class="kpi-label">总提现</div><div class="kpi-value" style="color:#e6a23c;">¥{{ formatM(totals.withdrawal) }}</div></div>
          <div class="kpi-card"><div class="kpi-label">GGR</div><div class="kpi-value" style="color:#67c23a;">¥{{ formatM(totals.ggr) }}</div></div>
          <div class="kpi-card"><div class="kpi-label">NGR</div><div class="kpi-value" style="color:#f56c6c;">¥{{ formatM(totals.ngr) }}</div></div>
        </div>
        <div class="chart-container" style="margin-top: 20px;">
          <v-chart :option="financialChart" style="height: 350px;" autoresize />
        </div>
        <div class="table-card" style="margin-top: 20px;">
          <el-table :data="financialData" stripe show-summary>
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column label="充值" width="130"><template #default="{ row }">¥{{ row.deposit.toLocaleString() }}</template></el-table-column>
            <el-table-column label="提现" width="130"><template #default="{ row }">¥{{ row.withdrawal.toLocaleString() }}</template></el-table-column>
            <el-table-column label="GGR" width="130"><template #default="{ row }"><span style="color:#67c23a;">¥{{ row.ggr.toLocaleString() }}</span></template></el-table-column>
            <el-table-column label="NGR" width="130"><template #default="{ row }"><span style="color:#f56c6c;">¥{{ row.ngr.toLocaleString() }}</span></template></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="会员活跃" name="member">
        <div class="chart-container">
          <div class="chart-title">会员活跃趋势</div>
          <v-chart :option="memberChart" style="height: 300px;" autoresize />
        </div>
        <div class="table-card" style="margin-top: 20px;">
          <el-table :data="memberData" stripe>
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="newMembers" label="新增会员" width="100" />
            <el-table-column prop="activeMembers" label="活跃会员" width="100" />
            <el-table-column prop="depositMembers" label="充值会员" width="100" />
            <el-table-column prop="firstDeposit" label="首充会员" width="100" />
            <el-table-column label="转化率" width="100"><template #default="{ row }">{{ row.conversionRate }}%</template></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="游戏表现" name="game">
        <div class="chart-container">
          <div class="chart-title">游戏分类GGR</div>
          <v-chart :option="gameChart" style="height: 300px;" autoresize />
        </div>
        <div class="table-card" style="margin-top: 20px;">
          <el-table :data="gameData" stripe>
            <el-table-column prop="provider" label="厂商" width="100" />
            <el-table-column prop="category" label="分类" width="80" />
            <el-table-column label="总投注" width="130"><template #default="{ row }">¥{{ row.totalBet.toLocaleString() }}</template></el-table-column>
            <el-table-column label="总派彩" width="130"><template #default="{ row }">¥{{ row.totalPayout.toLocaleString() }}</template></el-table-column>
            <el-table-column label="GGR" width="130"><template #default="{ row }"><span style="color:#67c23a;">¥{{ row.ggr.toLocaleString() }}</span></template></el-table-column>
            <el-table-column label="投注人数" width="100"><template #default="{ row }">{{ row.players }}</template></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { getFinancialSummary } from '@/api/finance'
import { ElMessage } from 'element-plus'

const period = ref('daily')
const reportTab = ref('financial')
const dateRange = ref(null)
const financialData = ref([])

onMounted(async () => {
  try {
    const res = await getFinancialSummary()
    if (res?.length) financialData.value = res
  } catch (e) { console.warn('API request failed', e) }
})
const formatM = n => (n / 10000).toFixed(1) + '万'

const totals = computed(() => {
  const t = { deposit: 0, withdrawal: 0, ggr: 0, ngr: 0 }
  financialData.value.forEach(r => Object.keys(t).forEach(k => t[k] += r[k]))
  return t
})

function updateData() { /* TODO: fetch real data based on period and date range */ }

const financialChart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['充值', '提现', 'GGR'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: financialData.value.map(d => d.date), axisLabel: { color: '#888' } },
  yAxis: { type: 'value', axisLabel: { color: '#888', formatter: v => (v/10000)+'万' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '充值', type: 'bar', data: financialData.value.map(d => d.deposit), itemStyle: { color: '#409eff' } },
    { name: '提现', type: 'bar', data: financialData.value.map(d => d.withdrawal), itemStyle: { color: '#e6a23c' } },
    { name: 'GGR', type: 'line', smooth: true, data: financialData.value.map(d => d.ggr), itemStyle: { color: '#67c23a' } }
  ]
}))

const memberData = ref([])

const memberChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['新增', '活跃', '充值'], textStyle: { color: '#a0a0b0' } },
  grid: { left: 50, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: [], axisLabel: { color: '#888' } },
  yAxis: { type: 'value', axisLabel: { color: '#888' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: [
    { name: '新增', type: 'bar', data: [], itemStyle: { color: '#409eff' } },
    { name: '活跃', type: 'line', smooth: true, data: [], itemStyle: { color: '#67c23a' } },
    { name: '充值', type: 'line', smooth: true, data: [], itemStyle: { color: '#e6a23c' } }
  ]
}

const gameData = ref([])

const gameChart = {
  tooltip: { trigger: 'item' },
  legend: { right: 10, top: 'center', orient: 'vertical', textStyle: { color: '#a0a0b0' } },
  series: [{ type: 'pie', radius: ['40%','70%'],
    data: [],
    label: { color: '#a0a0b0' }
  }]
}
</script>
