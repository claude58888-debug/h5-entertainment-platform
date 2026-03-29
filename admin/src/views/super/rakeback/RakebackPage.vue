<template>
  <div>
    <h2 class="section-title">返水管理</h2>

    <!-- Config Section -->
    <div class="table-card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">返水配置</span>
        <el-button type="primary" size="small" @click="saveConfig">保存配置</el-button>
      </div>

      <div style="margin-bottom: 16px; padding: 12px; background: #252538; border-radius: 8px; color: #a0a0b0; font-size: 13px;">
        <el-icon><InfoFilled /></el-icon>
        返水公式：投注金额 x 游戏抽水比例(House Edge) x VIP返水比例 | 每日自动结算 | 最低 1 CNY 起发放
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <h4 style="color: #e0e0e0; margin-bottom: 12px;">游戏抽水比例（House Edge）</h4>
          <el-form label-width="120px" size="small">
            <el-form-item label="电子游戏">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="config.houseEdge.slots.min" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">% ~</span>
                <el-input-number v-model="config.houseEdge.slots.max" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">%</span>
              </div>
            </el-form-item>
            <el-form-item label="真人视讯">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="config.houseEdge.live.min" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">% ~</span>
                <el-input-number v-model="config.houseEdge.live.max" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">%</span>
              </div>
            </el-form-item>
            <el-form-item label="体育竞猜">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="config.houseEdge.sports.min" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">% ~</span>
                <el-input-number v-model="config.houseEdge.sports.max" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">%</span>
              </div>
            </el-form-item>
            <el-form-item label="棋牌游戏">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="config.houseEdge.chess.min" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">% ~</span>
                <el-input-number v-model="config.houseEdge.chess.max" :min="0" :max="10" :step="0.1" :precision="1" style="width: 100px;" />
                <span style="color: #a0a0b0;">%</span>
              </div>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <h4 style="color: #e0e0e0; margin-bottom: 12px;">VIP返水比例</h4>
          <el-form label-width="80px" size="small">
            <el-form-item v-for="item in config.vipRakebackRates" :key="item.level" :label="'VIP' + item.level">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="item.rate" :min="0" :max="5" :step="0.1" :precision="1" style="width: 120px;" />
                <span style="color: #a0a0b0;">%</span>
              </div>
            </el-form-item>
          </el-form>
          <el-divider />
          <el-form label-width="120px" size="small">
            <el-form-item label="最低返水金额">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="config.minAmount" :min="0" :step="1" style="width: 120px;" />
                <span style="color: #a0a0b0;">CNY</span>
              </div>
            </el-form-item>
            <el-form-item label="自动日结">
              <el-switch v-model="config.autoDailySettle" active-text="开启" inactive-text="关闭" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <!-- Records Table -->
    <div class="table-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">返水记录</span>
      </div>
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索用户名" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待结算" value="pending" />
          <el-option label="已结算" value="settled" />
        </el-select>
      </div>
      <el-table :data="filteredRecords" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="member" label="用户" width="130" />
        <el-table-column label="VIP等级" width="90">
          <template #default="{ row }">
            <el-tag size="small">VIP{{ row.vipLevel || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总投注" width="130">
          <template #default="{ row }">¥{{ (row.totalBets || row.betAmount || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="返水金额" width="120">
          <template #default="{ row }">
            <span style="color: #e6a23c;">¥{{ (row.calculatedRakeback || row.rakebackAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="游戏类型" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="gameTagType(row.gameType)">{{ gameTypeLabel(row.gameType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="结算日期" width="120" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'settled' ? 'success' : 'warning'" size="small">
              {{ row.status === 'settled' ? '已结算' : '待结算' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredRecords.length" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRakebackConfig, updateRakebackConfig, getRakebackRecords } from '@/api/rakeback'

const config = ref({
  houseEdge: {
    slots: { min: 4.0, max: 5.0 },
    live: { min: 1.5, max: 2.5 },
    sports: { min: 3.0, max: 4.0 },
    chess: { min: 2.0, max: 3.0 }
  },
  vipRakebackRates: [
    { level: 0, rate: 0.5 },
    { level: 1, rate: 0.7 },
    { level: 2, rate: 0.9 },
    { level: 3, rate: 1.1 },
    { level: 4, rate: 1.3 },
    { level: 5, rate: 1.5 }
  ],
  minAmount: 1,
  autoDailySettle: true
})

const search = ref('')
const statusFilter = ref('')
const records = ref([])

onMounted(async () => {
  try {
    const [configData, recordsData] = await Promise.all([getRakebackConfig(), getRakebackRecords()])
    if (configData && configData.length) {
      for (const c of configData) {
        if (c.gameType === 'slots') {
          config.value.houseEdge.slots = { min: c.houseEdgeMin || 4.0, max: c.houseEdgeMax || 5.0 }
        } else if (c.gameType === 'live') {
          config.value.houseEdge.live = { min: c.houseEdgeMin || 1.5, max: c.houseEdgeMax || 2.5 }
        } else if (c.gameType === 'sports') {
          config.value.houseEdge.sports = { min: c.houseEdgeMin || 3.0, max: c.houseEdgeMax || 4.0 }
        } else if (c.gameType === 'chess') {
          config.value.houseEdge.chess = { min: c.houseEdgeMin || 2.0, max: c.houseEdgeMax || 3.0 }
        }
      }
    }
    records.value = recordsData || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (search.value && !(r.member || '').includes(search.value)) return false
    if (statusFilter.value && r.status !== statusFilter.value) return false
    return true
  })
})

function gameTypeLabel(type) {
  const map = { slots: '电子游戏', live: '真人视讯', sports: '体育竞猜', chess: '棋牌游戏' }
  return map[type] || type
}

function gameTagType(type) {
  const map = { slots: 'primary', live: 'danger', sports: 'success', chess: 'warning' }
  return map[type] || 'info'
}

async function saveConfig() {
  try {
    const gameTypes = [
      { type: 'slots', edge: config.value.houseEdge.slots },
      { type: 'live', edge: config.value.houseEdge.live },
      { type: 'sports', edge: config.value.houseEdge.sports },
      { type: 'chess', edge: config.value.houseEdge.chess }
    ]
    for (const gt of gameTypes) {
      await updateRakebackConfig(gt.type, {
        houseEdgeMin: gt.edge.min,
        houseEdgeMax: gt.edge.max,
        defaultEdge: (gt.edge.min + gt.edge.max) / 2,
        minBet: config.value.minAmount,
        status: config.value.autoDailySettle ? 'active' : 'inactive'
      })
    }
    ElMessage.success('返水配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>
