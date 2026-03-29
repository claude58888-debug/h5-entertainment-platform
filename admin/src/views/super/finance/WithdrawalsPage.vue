<template>
  <div>
    <h2 class="section-title">提现订单 (全平台)</h2>

    <!-- Financial Summary Cards -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <el-card shadow="hover" style="flex: 1;">
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">提现总额</div>
          <div style="font-size: 24px; font-weight: 700; color: #e6a23c;">¥{{ summaryData.totalAmount.toLocaleString() }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1;">
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">待审核</div>
          <div style="font-size: 24px; font-weight: 700; color: #909399;">{{ summaryData.pendingCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1;">
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">已批准</div>
          <div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ summaryData.approvedCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1;">
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">已拒绝</div>
          <div style="font-size: 24px; font-weight: 700; color: #f56c6c;">{{ summaryData.rejectedCount }}</div>
        </div>
      </el-card>
    </div>

    <!-- Auto Review Rules Section -->
    <div class="table-card" style="margin-bottom: 20px;">
      <div class="page-header" style="margin-bottom: 0;">
        <h3 style="margin: 0; font-size: 16px;">自动审核规则</h3>
        <el-button type="primary" size="small" @click="addRuleDialog = true"><el-icon><Plus /></el-icon>添加规则</el-button>
      </div>
      <el-table :data="autoReviewRules" stripe style="margin-top: 12px;" size="small">
        <el-table-column prop="name" label="规则名称" width="160" />
        <el-table-column prop="condition_field" label="条件字段" width="140" />
        <el-table-column prop="operator" label="运算符" width="80" />
        <el-table-column prop="threshold" label="阈值" width="100">
          <template #default="{ row }">{{ row.threshold.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="动作" width="120">
          <template #default="{ row }">
            <el-tag :type="row.action === 'auto_approve' ? 'success' : row.action === 'auto_reject' ? 'danger' : 'warning'" size="small">
              {{ row.action === 'auto_approve' ? '自动通过' : row.action === 'auto_reject' ? '自动拒绝' : '人工审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" @change="toggleRule(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" type="danger" text @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索订单号/会员" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待审核" value="pending" />
          <el-option label="审核中" value="review" />
          <el-option label="已批准" value="approved" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-select v-model="riskFilter" placeholder="风险等级" style="width: 120px;" clearable>
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #606266;">金额范围:</span>
          <el-input-number v-model="amountMin" :min="0" :precision="0" placeholder="最小" size="small" style="width: 110px;" controls-position="right" />
          <span style="color: #909399;">-</span>
          <el-input-number v-model="amountMax" :min="0" :precision="0" placeholder="最大" size="small" style="width: 110px;" controls-position="right" />
        </div>
        <el-button type="success" :disabled="!selectedIds.length" @click="batchAction('approve')"><el-icon><Check /></el-icon>批量通过 ({{ selectedIds.length }})</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="batchAction('reject')"><el-icon><Close /></el-icon>批量拒绝 ({{ selectedIds.length }})</el-button>
        <el-button @click="exportCSV"><el-icon><Download /></el-icon>导出CSV</el-button>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <el-empty description="暂无提现订单" />
      </div>

      <el-table v-else :data="filteredOrders" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" :selectable="row => row.status === 'pending' || row.status === 'review'" />
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="agent" label="代理" width="100" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }"><span style="color: #e6a23c; font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column prop="address" label="提现地址" width="160" show-overflow-tooltip />
        <el-table-column label="风险分" width="90">
          <template #default="{ row }">
            <span :style="{ color: (row.riskScore || 0) >= 80 ? '#f56c6c' : (row.riskScore || 0) >= 50 ? '#e6a23c' : '#67c23a', fontWeight: 600 }">{{ row.riskScore || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="80">
          <template #default="{ row }">
            <el-tag :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'" size="small">
              {{ row.riskLevel === 'high' ? '高' : row.riskLevel === 'medium' ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending' || row.status === 'review'">
              <el-button size="small" type="success" text @click="approve(row)">批准</el-button>
              <el-button size="small" type="danger" text @click="reject(row)">拒绝</el-button>
              <el-button v-if="row.status === 'pending'" size="small" type="warning" text @click="row.status = 'review'">审核</el-button>
            </template>
            <el-button v-else size="small" type="primary" text>详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Add Auto Review Rule Dialog -->
    <el-dialog v-model="addRuleDialog" title="添加自动审核规则" width="500px">
      <el-form :model="newRule" label-width="100px">
        <el-form-item label="规则名称" required>
          <el-input v-model="newRule.name" placeholder="输入规则名称" />
        </el-form-item>
        <el-form-item label="条件字段" required>
          <el-select v-model="newRule.condition_field" placeholder="选择字段" style="width: 100%;">
            <el-option label="提现金额" value="amount" />
            <el-option label="新用户24h" value="new_user_24h" />
            <el-option label="每日提现次数" value="daily_count" />
          </el-select>
        </el-form-item>
        <el-form-item label="运算符" required>
          <el-select v-model="newRule.operator" placeholder="选择" style="width: 100%;">
            <el-option label="<" value="<" />
            <el-option label="<=" value="<=" />
            <el-option label="=" value="=" />
            <el-option label=">=" value=">=" />
            <el-option label=">" value=">" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值" required>
          <el-input-number v-model="newRule.threshold" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="动作" required>
          <el-select v-model="newRule.action" placeholder="选择动作" style="width: 100%;">
            <el-option label="自动通过" value="auto_approve" />
            <el-option label="人工审核" value="manual_review" />
            <el-option label="自动拒绝" value="auto_reject" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="addRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getWithdrawals, updateWithdrawal, batchWithdrawals, exportWithdrawalsCSV, getAutoReviewRules, createAutoReviewRule, updateAutoReviewRule, deleteAutoReviewRule } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Close, Download } from '@element-plus/icons-vue'

const search = ref('')
const statusFilter = ref('')
const riskFilter = ref('')
const amountMin = ref(undefined)
const amountMax = ref(undefined)
const orders = ref([])
const loading = ref(true)
const selectedIds = ref([])
const autoReviewRules = ref([])
const addRuleDialog = ref(false)
const newRule = reactive({
  name: '',
  condition_field: 'amount',
  operator: '>',
  threshold: 0,
  action: 'manual_review'
})

onMounted(async () => {
  try {
    loading.value = true
    const [withdrawalData, rulesData] = await Promise.all([getWithdrawals(), getAutoReviewRules()])
    orders.value = withdrawalData || []
    autoReviewRules.value = rulesData || []
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
})

const summaryData = computed(() => {
  const all = orders.value
  return {
    totalAmount: all.reduce((sum, o) => sum + (o.amount || 0), 0),
    pendingCount: all.filter(o => o.status === 'pending').length,
    approvedCount: all.filter(o => o.status === 'approved' || o.status === 'completed').length,
    rejectedCount: all.filter(o => o.status === 'rejected').length
  }
})

const filteredOrders = computed(() => orders.value.filter(o => {
  if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
  if (statusFilter.value && o.status !== statusFilter.value) return false
  if (riskFilter.value && o.riskLevel !== riskFilter.value) return false
  if (amountMin.value !== undefined && amountMin.value !== null && o.amount < amountMin.value) return false
  if (amountMax.value !== undefined && amountMax.value !== null && o.amount > amountMax.value) return false
  return true
}))

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function statusType(s) { return { pending: 'info', review: 'warning', approved: '', completed: 'success', rejected: 'danger' }[s] || 'info' }
function statusLabel(s) { return { pending: '待审核', review: '审核中', approved: '已批准', completed: '已完成', rejected: '已拒绝' }[s] || s }

function approve(row) {
  ElMessageBox.confirm(`批准提现 ¥${row.amount.toLocaleString()} 给 ${row.member}?`, '确认批准').then(async () => {
    try {
      await updateWithdrawal(row.id, { status: 'approved' })
      row.status = 'approved'
      ElMessage.success('已批准')
    } catch (e) {
      ElMessage.error(`操作失败: ${e.message || '未知错误'}`)
    }
  }).catch(() => {})
}
function reject(row) {
  ElMessageBox.confirm(`拒绝提现订单 ${row.id}?`, '拒绝', { type: 'warning' }).then(async () => {
    try {
      await updateWithdrawal(row.id, { status: 'rejected' })
      row.status = 'rejected'
      ElMessage.success('已拒绝')
    } catch (e) {
      ElMessage.error(`操作失败: ${e.message || '未知错误'}`)
    }
  }).catch(() => {})
}

async function batchAction(action) {
  const label = action === 'approve' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定批量${label} ${selectedIds.value.length} 笔提现订单?`, '批量操作', { type: 'warning' })
    const result = await batchWithdrawals({ ids: selectedIds.value, action, reason: '' })
    for (const order of orders.value) {
      if (selectedIds.value.includes(order.id)) {
        order.status = action === 'approve' ? 'approved' : 'rejected'
      }
    }
    ElMessage.success(`已批量${label} ${result.updated} 笔`)
    selectedIds.value = []
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量操作失败')
  }
}

async function exportCSV() {
  try {
    const response = await exportWithdrawalsCSV()
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'withdrawals_export.csv'
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

async function toggleRule(rule) {
  try {
    await updateAutoReviewRule(rule.id, { enabled: rule.enabled })
  } catch (e) {
    rule.enabled = !rule.enabled
    ElMessage.error('更新失败')
  }
}

async function addRule() {
  if (!newRule.name) { ElMessage.warning('请输入规则名称'); return }
  try {
    await createAutoReviewRule(newRule)
    const rulesData = await getAutoReviewRules()
    autoReviewRules.value = rulesData || []
    addRuleDialog.value = false
    Object.assign(newRule, { name: '', condition_field: 'amount', operator: '>', threshold: 0, action: 'manual_review' })
    ElMessage.success('规则已创建')
  } catch (e) {
    ElMessage.error('创建失败')
  }
}

async function deleteRule(rule) {
  try {
    await ElMessageBox.confirm(`删除规则 "${rule.name}"?`, '确认', { type: 'warning' })
    await deleteAutoReviewRule(rule.id)
    autoReviewRules.value = autoReviewRules.value.filter(r => r.id !== rule.id)
    ElMessage.success('已删除')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}
</script>
