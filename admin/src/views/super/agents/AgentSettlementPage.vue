<template>
  <div>
    <h2 class="section-title">代理结算</h2>

    <!-- Commission Tiers -->
    <div class="table-card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">佣金等级</span>
      </div>
      <el-table :data="commissionTiers" stripe size="small">
        <el-table-column prop="tier" label="等级" width="100" />
        <el-table-column prop="range" label="下线人数" width="140" />
        <el-table-column label="佣金比例" width="120">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: bold;">{{ row.rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
      </el-table>
      <div style="margin-top: 12px; padding: 12px; background: #252538; border-radius: 8px; color: #a0a0b0; font-size: 13px;">
        <el-icon><InfoFilled /></el-icon>
        代理层级：总代理 -> 一级代理 -> 二级代理 | 上级抽成：5% | 结算公式：总收入 x 佣金比例 - 上级抽成
      </div>
    </div>

    <!-- Settlement Records -->
    <div class="table-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">结算记录</span>
        <el-button type="primary" size="small" @click="handleCalculate">触发结算</el-button>
      </div>
      <div class="filter-bar">
        <el-input v-model="filters.agentId" placeholder="代理ID" style="width: 150px;" clearable />
        <el-select v-model="filters.status" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待审核" value="pending" />
          <el-option label="已审核" value="approved" />
          <el-option label="已结算" value="settled" />
          <el-option label="已支付" value="paid" />
        </el-select>
        <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px;" />
        <el-button size="small" @click="loadSettlements">查询</el-button>
      </div>
      <el-table :data="settlements" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="agentName" label="代理" width="120" />
        <el-table-column prop="periodStart" label="开始日期" width="110" />
        <el-table-column prop="periodEnd" label="结束日期" width="110" />
        <el-table-column label="总收入" width="120">
          <template #default="{ row }">¥{{ Number(row.totalRevenue || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="佣金比例" width="90">
          <template #default="{ row }">{{ row.commissionRate }}%</template>
        </el-table-column>
        <el-table-column label="佣金金额" width="120">
          <template #default="{ row }">
            <span style="color: #67c23a;">¥{{ Number(row.commissionAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上级抽成" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c;">¥{{ Number(row.upstreamFee || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="净结算" width="120">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: bold;">¥{{ Number(row.netAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="success" text @click="handleApprove(row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="settlements.length" :page-size="10" />
      </div>
    </div>

    <!-- Calculate Dialog -->
    <el-dialog v-model="calcDialogVisible" title="触发结算计算" width="500px">
      <el-form :model="calcForm" label-width="100px">
        <el-form-item label="代理ID">
          <el-input v-model="calcForm.agentId" placeholder="输入代理ID" />
        </el-form-item>
        <el-form-item label="代理名称">
          <el-input v-model="calcForm.agentName" placeholder="输入代理名称" />
        </el-form-item>
        <el-form-item label="结算周期">
          <el-date-picker v-model="calcForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="总收入">
          <el-input-number v-model="calcForm.totalRevenue" :min="0" :step="1000" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="下线人数">
          <el-input-number v-model="calcForm.memberCount" :min="0" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="calcDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCalculate">计算并创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAgentSettlements, calculateAgentSettlement, approveAgentSettlement } from '@/api/agents'

const commissionTiers = ref([
  { tier: 'Bronze 青铜', range: '1-9人', rate: 25, desc: '基础佣金等级' },
  { tier: 'Silver 白银', range: '10-49人', rate: 30, desc: '中级佣金等级' },
  { tier: 'Gold 黄金', range: '50-99人', rate: 35, desc: '高级佣金等级' },
  { tier: 'Platinum 铂金', range: '100-499人', rate: 40, desc: '精英佣金等级' },
  { tier: 'Diamond 钻石', range: '500+人', rate: 45, desc: '最高佣金等级' }
])

const settlements = ref([])
const filters = ref({ agentId: '', status: '', dateRange: null })

const calcDialogVisible = ref(false)
const calcForm = ref({ agentId: '', agentName: '', dateRange: null, totalRevenue: 0, memberCount: 0 })

onMounted(() => { loadSettlements() })

async function loadSettlements() {
  try {
    const params = {}
    if (filters.value.agentId) params.agentId = filters.value.agentId
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.dateRange) {
      params.periodStart = filters.value.dateRange[0]
      params.periodEnd = filters.value.dateRange[1]
    }
    const data = await getAgentSettlements(params)
    settlements.value = data || []
  } catch (e) {
    console.warn('Failed to load settlements', e)
  }
}

function handleCalculate() {
  calcForm.value = { agentId: '', agentName: '', dateRange: null, totalRevenue: 0, memberCount: 0 }
  calcDialogVisible.value = true
}

async function submitCalculate() {
  if (!calcForm.value.agentId || !calcForm.value.dateRange) {
    ElMessage.warning('请填写代理ID和结算周期')
    return
  }
  try {
    await calculateAgentSettlement({
      agentId: calcForm.value.agentId,
      agentName: calcForm.value.agentName,
      periodStart: calcForm.value.dateRange[0],
      periodEnd: calcForm.value.dateRange[1],
      totalRevenue: calcForm.value.totalRevenue,
      memberCount: calcForm.value.memberCount
    })
    calcDialogVisible.value = false
    ElMessage.success('结算计算完成')
    loadSettlements()
  } catch (e) {
    ElMessage.error('结算计算失败')
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确认审核通过该结算记录？', '确认审核', { type: 'warning' })
    await approveAgentSettlement(row.id)
    row.status = 'approved'
    ElMessage.success('审核通过')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('审核失败')
  }
}

function statusTagType(status) {
  const map = { pending: 'warning', approved: 'success', settled: 'primary', paid: 'info' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { pending: '待审核', approved: '已审核', settled: '已结算', paid: '已支付' }
  return map[status] || status
}
</script>
