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



async function loadData() {
  try {
    const stats = await getGameStats({ period: period.value })
    if (stats) overview.value = stats
  } catch (e) {
    console.warn('Failed to load game stats', e)
  }
  try {
    const ranking = await getGameRanking({ period: period.value })
    if (ranking?.length) popularityRanking.value = ranking
  } catch (e) { console.warn('Failed to load game ranking', e) }
  try {
    const pgGGR = await fetchProviderGGR({ period: period.value })
    if (pgGGR?.length) providerGGR.value = pgGGR
  } catch (e) { console.warn('Failed to load provider GGR', e) }
  gameGGR.value = popularityRanking.value.map(g => {
    const win = Math.round((g.betAmount || 0) * 0.93)
    return { ...g, winAmount: win, ggr: (g.betAmount || 0) - win, ggrPercent: g.betAmount ? (((g.betAmount - win) / g.betAmount) * 100) : 0 }
  })
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
