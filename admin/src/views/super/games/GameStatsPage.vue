<template>
  <div>
    <h2 class="section-title">游戏统计</h2>

    <div style="display: flex; gap: 8px; margin-bottom: 20px;">
      <el-button :type="period === 'today' ? 'primary' : 'default'" @click="period = 'today'">今日</el-button>
      <el-button :type="period === '7d' ? 'primary' : 'default'" @click="period = '7d'">近7天</el-button>
      <el-button :type="period === '30d' ? 'primary' : 'default'" @click="period = '30d'">近30天</el-button>
    </div>

    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总游戏数</div><div style="font-size: 24px; font-weight: 700; color: #409eff;">{{ overview.totalGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">活跃游戏</div><div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ overview.activeGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总投注额</div><div style="font-size: 24px; font-weight: 700; color: #e6a23c;">¥{{ formatNum(overview.totalBets) }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总GGR</div><div style="font-size: 24px; font-weight: 700; color: #f56c6c;">¥{{ formatNum(overview.totalGGR) }}</div></div></el-card>
    </div>

    <el-card shadow="hover" style="margin-bottom: 20px;">
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Top 10 游戏收入排行</div>
      <div ref="chartRef" style="width: 100%; height: 350px;"></div>
    </el-card>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="游戏热度排行" name="popularity">
        <div class="table-card">
          <el-table :data="popularityRanking" stripe>
            <el-table-column type="index" label="排名" width="70" />
            <el-table-column prop="name" label="游戏名称" width="180" />
            <el-table-column prop="provider" label="厂商" width="100" />
            <el-table-column label="玩家数" width="120"><template #default="{ row }">{{ row.playerCount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="投注次数" width="120"><template #default="{ row }">{{ row.betCount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="投注金额" width="140"><template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="活跃/总玩家" width="120">
              <template #default="{ row }">
                <span style="color: #67c23a;">{{ row.activePlayers }}</span> / {{ row.totalPlayers }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="游戏GGR" name="ggr">
        <div class="table-card">
          <el-table :data="gameGGR" stripe>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="name" label="游戏名称" width="180" />
            <el-table-column prop="provider" label="厂商" width="100" />
            <el-table-column label="投注额" width="140"><template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="派奖额" width="140"><template #default="{ row }">¥{{ row.winAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="GGR" width="140">
              <template #default="{ row }">
                <span :style="{ color: row.ggr >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 600 }">¥{{ row.ggr.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="GGR%" width="100">
              <template #default="{ row }">
                <el-tag :type="row.ggrPercent >= 5 ? 'success' : row.ggrPercent >= 0 ? 'warning' : 'danger'" size="small">{{ row.ggrPercent.toFixed(1) }}%</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="厂商GGR" name="providerGGR">
        <div class="table-card">
          <el-table :data="providerGGR" stripe>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="provider" label="厂商" width="120" />
            <el-table-column label="游戏数" width="100"><template #default="{ row }">{{ row.gameCount }}</template></el-table-column>
            <el-table-column label="投注额" width="160"><template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="派奖额" width="160"><template #default="{ row }">¥{{ row.winAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="GGR" width="160">
              <template #default="{ row }">
                <span :style="{ color: row.ggr >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 600 }">¥{{ row.ggr.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="GGR%" width="100">
              <template #default="{ row }">{{ row.ggrPercent.toFixed(1) }}%</template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getGameStats, getGameRanking, getProviderGGR as fetchProviderGGR } from '@/api/games'
import * as echarts from 'echarts'

const period = ref('7d')
const activeTab = ref('popularity')
const chartRef = ref(null)
let chartInstance = null

const overview = ref({ totalGames: 0, activeGames: 0, totalBets: 0, totalGGR: 0 })
const popularityRanking = ref([])
const gameGGR = ref([])
const providerGGR = ref([])

function formatNum(n) { return n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString() }

const mockPopularity = [
  { name: 'Fortune Tiger', provider: 'PG', playerCount: 12580, betCount: 89420, betAmount: 2850000, activePlayers: 3200, totalPlayers: 12580 },
  { name: 'Sweet Bonanza', provider: 'PP', playerCount: 10230, betCount: 72300, betAmount: 2340000, activePlayers: 2800, totalPlayers: 10230 },
  { name: 'Starlight Princess', provider: 'PP', playerCount: 9870, betCount: 68900, betAmount: 1980000, activePlayers: 2100, totalPlayers: 9870 },
  { name: 'Gates of Olympus', provider: 'PP', playerCount: 8920, betCount: 61200, betAmount: 1850000, activePlayers: 1900, totalPlayers: 8920 },
  { name: 'Lucky Neko', provider: 'PG', playerCount: 7650, betCount: 54300, betAmount: 1620000, activePlayers: 1600, totalPlayers: 7650 },
  { name: 'Mahjong Ways', provider: 'PG', playerCount: 6890, betCount: 48700, betAmount: 1450000, activePlayers: 1400, totalPlayers: 6890 },
  { name: 'Wild Bandito', provider: 'PG', playerCount: 6230, betCount: 43200, betAmount: 1280000, activePlayers: 1200, totalPlayers: 6230 },
  { name: 'Dragon Tiger', provider: 'EVO', playerCount: 5890, betCount: 39800, betAmount: 1150000, activePlayers: 1100, totalPlayers: 5890 },
  { name: 'Baccarat', provider: 'EVO', playerCount: 5420, betCount: 36500, betAmount: 980000, activePlayers: 900, totalPlayers: 5420 },
  { name: 'Fishing God', provider: 'JDB', playerCount: 4980, betCount: 32100, betAmount: 860000, activePlayers: 800, totalPlayers: 4980 },
]

const mockGameGGR = mockPopularity.map(g => {
  const win = Math.round(g.betAmount * (0.88 + Math.random() * 0.1))
  return { ...g, winAmount: win, ggr: g.betAmount - win, ggrPercent: ((g.betAmount - win) / g.betAmount) * 100 }
})

const mockProviderGGR = ['PG', 'PP', 'EVO', 'JDB', 'JILI', 'CQ9', 'AG', 'FC', 'WM'].map((p, i) => {
  const bet = Math.round(5000000 - i * 450000 + Math.random() * 200000)
  const win = Math.round(bet * (0.9 + Math.random() * 0.06))
  return { provider: p, gameCount: Math.round(15 - i * 1.2), betAmount: bet, winAmount: win, ggr: bet - win, ggrPercent: ((bet - win) / bet) * 100 }
})

async function loadData() {
  try {
    const stats = await getGameStats({ period: period.value })
    if (stats) overview.value = stats
  } catch (e) {
    overview.value = { totalGames: 156, activeGames: 128, totalBets: 18500000, totalGGR: 1850000 }
  }
  try {
    const ranking = await getGameRanking({ period: period.value })
    if (ranking?.length) popularityRanking.value = ranking
    else popularityRanking.value = mockPopularity
  } catch (e) { popularityRanking.value = mockPopularity }
  try {
    const pgGGR = await fetchProviderGGR({ period: period.value })
    if (pgGGR?.length) providerGGR.value = pgGGR
    else providerGGR.value = mockProviderGGR
  } catch (e) { providerGGR.value = mockProviderGGR }
  gameGGR.value = mockGameGGR
  await nextTick()
  renderChart()
}

function renderChart() {
  if (!chartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(chartRef.value)
  const top10 = [...gameGGR.value].sort((a, b) => b.ggr - a.ggr).slice(0, 10)
  chartInstance.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 30, top: 20, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { formatter: (v) => v >= 10000 ? (v / 10000) + '万' : v } },
    yAxis: { type: 'category', data: top10.map(g => g.name).reverse(), axisLabel: { color: '#ccc' } },
    series: [{ name: 'GGR', type: 'bar', data: top10.map(g => g.ggr).reverse(), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#409eff' }, { offset: 1, color: '#67c23a' }]) }, barWidth: 20 }]
  })
}

onMounted(loadData)
watch(period, loadData)
</script>
