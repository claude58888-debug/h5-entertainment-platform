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
        返水公式：投注金额 x 游戏抽水比例 x VIP返水比例
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
        <el-select v-model="gameTypeFilter" placeholder="游戏类型" style="width: 140px;" clearable>
          <el-option label="电子游戏" value="slots" />
          <el-option label="真人视讯" value="live" />
          <el-option label="体育竞猜" value="sports" />
          <el-option label="棋牌游戏" value="chess" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px;" />
      </div>
      <el-table :data="filteredRecords" stripe>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户" width="130" />
        <el-table-column label="投注金额" width="130" sortable sort-by="betAmount">
          <template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="返水金额" width="120" sortable sort-by="rakebackAmount">
          <template #default="{ row }">
            <span style="color: #e6a23c;">¥{{ row.rakebackAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="游戏类型" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="gameTagType(row.gameType)">{{ gameTypeLabel(row.gameType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settledAt" label="结算时间" width="170" />
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const config = ref({
  houseEdge: {
    slots: { min: 4.0, max: 5.0 },
    live: { min: 1.5, max: 2.5 },
    sports: { min: 3.0, max: 4.0 },
    chess: { min: 2.0, max: 3.0 }
  },
  vipRakebackRates: [
    { level: 0, rate: 0.5 },
    { level: 1, rate: 0.6 },
    { level: 2, rate: 0.8 },
    { level: 3, rate: 1.0 },
    { level: 4, rate: 1.2 },
    { level: 5, rate: 1.5 }
  ],
  minAmount: 1,
  autoDailySettle: true
})

const search = ref('')
const gameTypeFilter = ref('')
const dateRange = ref(null)

const records = ref([
  { id: 'RB001', username: 'player_wang', betAmount: 125000, rakebackAmount: 562.50, gameType: 'slots', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB002', username: 'dragon_888', betAmount: 280000, rakebackAmount: 840.00, gameType: 'live', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB003', username: 'slot_queen', betAmount: 95000, rakebackAmount: 427.50, gameType: 'slots', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB004', username: 'king_poker', betAmount: 68000, rakebackAmount: 204.00, gameType: 'chess', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB005', username: 'lucky_star88', betAmount: 45000, rakebackAmount: 135.00, gameType: 'sports', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB006', username: 'fish_lover', betAmount: 32000, rakebackAmount: 128.00, gameType: 'slots', settledAt: '2026-03-07 00:00:00', status: 'settled' },
  { id: 'RB007', username: 'player_wang', betAmount: 88000, rakebackAmount: 396.00, gameType: 'live', settledAt: '2026-03-06 00:00:00', status: 'settled' },
  { id: 'RB008', username: 'newbie_2026', betAmount: 5000, rakebackAmount: 22.50, gameType: 'slots', settledAt: '2026-03-08 00:00:00', status: 'pending' }
])

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (search.value && !r.username.includes(search.value)) return false
    if (gameTypeFilter.value && r.gameType !== gameTypeFilter.value) return false
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

function saveConfig() {
  ElMessage.success('返水配置已保存')
}
</script>
