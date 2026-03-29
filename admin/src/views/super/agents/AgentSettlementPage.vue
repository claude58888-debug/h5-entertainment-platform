<template>
  <div>
    <h2 class="section-title">代理结算</h2>

    <!-- Commission Tiers -->
    <div class="table-card" style="margin-bottom: 20px;">
      <span style="font-size: 15px; font-weight: 600; color: #e0e0e0; margin-bottom: 12px; display: block;">佣金等级</span>
      <el-table :data="commissionTiers" stripe size="small">
        <el-table-column prop="tier" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="tierTagType(row.tier)" size="small">{{ row.tier }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="佣金比例" width="100">
          <template #default="{ row }">{{ row.rate }}%</template>
        </el-table-column>
        <el-table-column prop="subordinateRange" label="下级人数" width="130" />
        <el-table-column prop="description" label="说明" />
      </el-table>
    </div>

    <!-- Agent Tree Structure -->
    <div class="table-card" style="margin-bottom: 20px;">
      <span style="font-size: 15px; font-weight: 600; color: #e0e0e0; margin-bottom: 12px; display: block;">代理层级结构</span>
      <div style="padding: 12px; background: #252538; border-radius: 8px; color: #a0a0b0; font-size: 13px; margin-bottom: 16px;">
        <el-icon><InfoFilled /></el-icon>
        三级代理体系：总代理 → 一级代理 → 二级代理，上级抽取下级佣金的 5%
      </div>
      <el-table :data="agentTree" stripe row-key="id" :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="代理名称" width="180" />
        <el-table-column label="层级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'master' ? 'danger' : row.level === 'level1' ? 'warning' : 'info'" size="small">
              {{ row.level === 'master' ? '总代理' : row.level === 'level1' ? '一级代理' : '二级代理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下级人数" width="100">
          <template #default="{ row }">{{ row.subordinates }}</template>
        </el-table-column>
        <el-table-column label="本月投注" width="140">
          <template #default="{ row }">¥{{ row.monthBets.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="佣金等级" width="100">
          <template #default="{ row }">
            <el-tag :type="tierTagType(row.commissionTier)" size="small">{{ row.commissionTier }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上级抽成" width="120">
          <template #default="{ row }">
            <span v-if="row.upstreamCut > 0" style="color: #f56c6c;">-¥{{ row.upstreamCut.toLocaleString() }}</span>
            <span v-else style="color: #a0a0b0;">--</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Settlement Table -->
    <div class="table-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">月度结算记录</span>
      </div>
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索代理名称" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="monthFilter" placeholder="结算月份" style="width: 140px;" clearable>
          <el-option label="2026年3月" value="2026-03" />
          <el-option label="2026年2月" value="2026-02" />
          <el-option label="2026年1月" value="2026-01" />
        </el-select>
        <el-select v-model="settlementStatusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待结算" value="pending" />
          <el-option label="已结算" value="settled" />
          <el-option label="已打款" value="paid" />
        </el-select>
      </div>
      <el-table :data="filteredSettlements" stripe>
        <el-table-column prop="agent" label="代理" width="130" />
        <el-table-column prop="month" label="结算月份" width="110" />
        <el-table-column prop="subordinates" label="下级人数" width="100" sortable />
        <el-table-column label="总投注额" width="150" sortable sort-by="totalBets">
          <template #default="{ row }">¥{{ row.totalBets.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="佣金比例" width="100">
          <template #default="{ row }">{{ row.commissionRate }}%</template>
        </el-table-column>
        <el-table-column label="佣金金额" width="140" sortable sort-by="commissionAmount">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: 600;">¥{{ row.commissionAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上级抽成" width="120">
          <template #default="{ row }">
            <span v-if="row.upstreamDeduction > 0" style="color: #f56c6c;">-¥{{ row.upstreamDeduction.toLocaleString() }}</span>
            <span v-else style="color: #a0a0b0;">--</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'settled' ? 'warning' : 'info'" size="small">
              {{ row.status === 'paid' ? '已打款' : row.status === 'settled' ? '已结算' : '待结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" text @click="handleSettle(row)">结算</el-button>
            <el-button v-if="row.status === 'settled'" size="small" type="success" text @click="handlePay(row)">打款</el-button>
            <el-button size="small" type="info" text @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredSettlements.length" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSettlements } from '@/api/finance'

const search = ref('')
const monthFilter = ref('')
const settlementStatusFilter = ref('')

const commissionTiers = [
  { tier: 'Bronze', rate: 25, subordinateRange: '1-9人', description: '青铜代理，基础佣金比例' },
  { tier: 'Silver', rate: 30, subordinateRange: '10-49人', description: '白银代理，中等佣金比例' },
  { tier: 'Gold', rate: 35, subordinateRange: '50-99人', description: '黄金代理，较高佣金比例' },
  { tier: 'Platinum', rate: 40, subordinateRange: '100-499人', description: '铂金代理，高级佣金比例' },
  { tier: 'Diamond', rate: 45, subordinateRange: '500+人', description: '钻石代理，最高佣金比例' }
]

const agentTree = [
  {
    id: 1, name: '金沙娱乐 (总代)', level: 'master', subordinates: 156, monthBets: 18500000, commissionTier: 'Diamond', upstreamCut: 0,
    children: [
      {
        id: 11, name: '皇冠体育', level: 'level1', subordinates: 45, monthBets: 8900000, commissionTier: 'Silver', upstreamCut: 133500,
        children: [
          { id: 111, name: '新手代理A', level: 'level2', subordinates: 5, monthBets: 1200000, commissionTier: 'Bronze', upstreamCut: 15000 },
          { id: 112, name: '新手代理B', level: 'level2', subordinates: 3, monthBets: 800000, commissionTier: 'Bronze', upstreamCut: 10000 }
        ]
      },
      {
        id: 12, name: '新濠天地', level: 'level1', subordinates: 28, monthBets: 6200000, commissionTier: 'Silver', upstreamCut: 93000,
        children: [
          { id: 121, name: '新手代理C', level: 'level2', subordinates: 8, monthBets: 2000000, commissionTier: 'Bronze', upstreamCut: 25000 }
        ]
      }
    ]
  },
  {
    id: 2, name: '永利娱乐 (总代)', level: 'master', subordinates: 85, monthBets: 12000000, commissionTier: 'Gold', upstreamCut: 0,
    children: [
      { id: 21, name: '澳门威尼斯', level: 'level1', subordinates: 32, monthBets: 4500000, commissionTier: 'Silver', upstreamCut: 67500, children: [] }
    ]
  }
]

const settlements = ref([])

onMounted(async () => {
  try {
    const data = await getSettlements()
    settlements.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredSettlements = computed(() => {
  return settlements.value.filter(s => {
    if (search.value && !s.agent.includes(search.value)) return false
    if (monthFilter.value && s.month !== monthFilter.value) return false
    if (settlementStatusFilter.value && s.status !== settlementStatusFilter.value) return false
    return true
  })
})

function tierTagType(tier) {
  const map = { Bronze: 'info', Silver: '', Gold: 'warning', Platinum: 'success', Diamond: 'danger' }
  return map[tier] || 'info'
}

function handleSettle(row) {
  ElMessageBox.confirm(
    `确定结算代理 "${row.agent}" ${row.month} 的佣金 ¥${row.commissionAmount.toLocaleString()} 吗?`,
    '确认结算',
    { type: 'warning' }
  ).then(() => {
    row.status = 'settled'
    ElMessage.success(`已结算 ${row.agent} 的 ${row.month} 佣金`)
  }).catch(() => {})
}

function handlePay(row) {
  ElMessageBox.confirm(
    `确定对代理 "${row.agent}" 打款 ¥${(row.commissionAmount - row.upstreamDeduction).toLocaleString()} 吗?`,
    '确认打款',
    { type: 'warning' }
  ).then(() => {
    row.status = 'paid'
    ElMessage.success(`已完成对 ${row.agent} 的打款`)
  }).catch(() => {})
}

function handleDetail(row) {
  ElMessage.info(`查看 ${row.agent} ${row.month} 结算详情`)
}
</script>
