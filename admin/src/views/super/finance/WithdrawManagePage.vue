<template>
  <div>
    <h2 class="section-title">提现管理 (Withdrawal Management)</h2>

    <!-- Summary Cards -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">提现总额</div>
          <div style="font-size: 22px; font-weight: 700; color: #e6a23c;">¥{{ summaryData.totalAmount.toLocaleString() }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">待审核</div>
          <div style="font-size: 22px; font-weight: 700; color: #f56c6c;">{{ summaryData.pendingCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">处理中</div>
          <div style="font-size: 22px; font-weight: 700; color: #e6a23c;">{{ summaryData.processingCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">已完成</div>
          <div style="font-size: 22px; font-weight: 700; color: #67c23a;">{{ summaryData.completedCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">已拒绝</div>
          <div style="font-size: 22px; font-weight: 700; color: #f56c6c;">{{ summaryData.rejectedCount }}</div>
        </div>
      </el-card>
    </div>

    <!-- Risk Indicators Legend -->
    <div class="table-card" style="margin-bottom: 20px; padding: 12px 16px;">
      <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <span style="font-size: 14px; font-weight: 600; color: #e0e0e0;">风险标识说明:</span>
        <el-tag type="danger" size="small" effect="dark">🔴 大额提现 (&gt;50,000)</el-tag>
        <el-tag type="warning" size="small" effect="dark">🟡 新账户 (&lt;7天)</el-tag>
        <el-tag type="warning" size="small" effect="dark">🟡 频繁提现 (&gt;3次/天)</el-tag>
        <el-tag type="danger" size="small" effect="dark">🔴 高风险分 (&ge;80)</el-tag>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-card">
      <div class="filter-bar" style="flex-wrap: wrap;">
        <el-input v-model="search" placeholder="订单号/会员ID" style="width: 180px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 130px;" clearable>
          <el-option label="待审核" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已批准" value="approved" />
          <el-option label="已完成" value="completed" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-select v-model="riskFilter" placeholder="风险等级" style="width: 120px;" clearable>
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #606266;">金额:</span>
          <el-input-number v-model="amountMin" :min="0" :precision="0" placeholder="最小" size="small" style="width: 110px;" controls-position="right" />
          <span style="color: #909399;">-</span>
          <el-input-number v-model="amountMax" :min="0" :precision="0" placeholder="最大" size="small" style="width: 110px;" controls-position="right" />
        </div>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" value-format="YYYY-MM-DD" />
        <el-button type="success" :disabled="!selectedIds.length" @click="batchAction('approve')"><el-icon><Check /></el-icon>批量通过 ({{ selectedIds.length }})</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="batchAction('reject')"><el-icon><Close /></el-icon>批量拒绝 ({{ selectedIds.length }})</el-button>
        <el-button @click="exportCSV"><el-icon><Download /></el-icon>导出CSV</el-button>
      </div>

      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <el-empty description="暂无提现订单" />
      </div>

      <el-table v-else :data="paginatedOrders" stripe @selection-change="handleSelectionChange" :row-class-name="getRowClass">
        <el-table-column type="selection" width="50" :selectable="row => row.status === 'pending' || row.status === 'processing'" />
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="agent" label="代理" width="100" />
        <el-table-column label="金额" width="120" sortable sort-by="amount">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span>
            <el-tag v-if="row.amount >= 50000" type="danger" size="small" style="margin-left: 4px; font-size: 10px;">大额</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column label="提现地址" width="180">
          <template #default="{ row }">
            <el-tooltip v-if="row.address" :content="row.address" placement="top">
              <span style="font-family: monospace; font-size: 12px; cursor: pointer;" @click="copyText(row.address)">{{ row.address.length > 18 ? row.address.substring(0, 18) + '...' : row.address }}</span>
            </el-tooltip>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="120">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span :style="{ color: getRiskColor(row.riskScore || 0), fontWeight: 600 }">{{ row.riskScore || 0 }}</span>
              <el-tag :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'" size="small">
                {{ row.riskLevel === 'high' ? '高' : row.riskLevel === 'medium' ? '中' : '低' }}
              </el-tag>
            </div>
            <div v-if="row.riskFlags && row.riskFlags.length" style="margin-top: 4px;">
              <el-tag v-for="flag in row.riskFlags" :key="flag" size="small" type="warning" style="margin-right: 4px; font-size: 10px;">{{ flag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" text @click="showApproveDialog(row)">批准</el-button>
              <el-button size="small" type="danger" text @click="showRejectDialog(row)">拒绝</el-button>
              <el-button size="small" type="warning" text @click="markProcessing(row)">处理中</el-button>
            </template>
            <template v-else-if="row.status === 'processing'">
              <el-button size="small" type="success" text @click="markCompleted(row)">完成</el-button>
              <el-button size="small" type="danger" text @click="markFailed(row)">失败</el-button>
            </template>
            <template v-else-if="row.status === 'approved'">
              <el-button size="small" type="success" text @click="markCompleted(row)">完成</el-button>
            </template>
            <el-button size="small" type="primary" text @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredOrders.length > pageSize" style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredOrders.length" layout="total, prev, pager, next" background small />
      </div>
    </div>

    <!-- Approve/Reject Dialog -->
    <el-dialog v-model="actionDialog.visible" :title="actionDialog.title" width="550px">
      <div v-if="actionDialog.order" style="margin-bottom: 16px;">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ actionDialog.order.id }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ actionDialog.order.member }}</el-descriptions-item>
          <el-descriptions-item label="金额"><span style="color: #e6a23c; font-weight: 600;">¥{{ actionDialog.order.amount.toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="提现地址">{{ actionDialog.order.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="actionDialog.order.riskLevel === 'high' ? 'danger' : actionDialog.order.riskLevel === 'medium' ? 'warning' : 'success'" size="small">
              {{ actionDialog.order.riskLevel === 'high' ? '高风险' : actionDialog.order.riskLevel === 'medium' ? '中风险' : '低风险' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="渠道">{{ actionDialog.order.channel }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form label-width="80px">
        <el-form-item :label="actionDialog.action === 'approve' ? '备注' : '拒绝原因'" :required="actionDialog.action === 'reject'">
          <el-input v-model="actionDialog.reason" type="textarea" :rows="3" :placeholder="actionDialog.action === 'approve' ? '审批备注 (可选)' : '请输入拒绝原因'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button :type="actionDialog.action === 'approve' ? 'success' : 'danger'" :loading="actionDialog.loading" @click="executeAction">
          {{ actionDialog.action === 'approve' ? '确认批准' : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialog.visible" title="提现订单详情" width="650px">
      <el-descriptions v-if="detailDialog.order" :column="2" border>
        <el-descriptions-item label="订单号">{{ detailDialog.order.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailDialog.order.status)" size="small">{{ getStatusLabel(detailDialog.order.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会员">{{ detailDialog.order.member }}</el-descriptions-item>
        <el-descriptions-item label="代理">{{ detailDialog.order.agent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="金额"><span style="color: #e6a23c; font-weight: 600;">¥{{ detailDialog.order.amount.toLocaleString() }}</span></el-descriptions-item>
        <el-descriptions-item label="渠道">{{ detailDialog.order.channel }}</el-descriptions-item>
        <el-descriptions-item label="提现地址" :span="2"><span style="font-family: monospace;">{{ detailDialog.order.address || '-' }}</span></el-descriptions-item>
        <el-descriptions-item label="风险分">{{ detailDialog.order.riskScore || 0 }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="detailDialog.order.riskLevel === 'high' ? 'danger' : detailDialog.order.riskLevel === 'medium' ? 'warning' : 'success'" size="small">
            {{ detailDialog.order.riskLevel === 'high' ? '高' : detailDialog.order.riskLevel === 'medium' ? '中' : '低' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时间" :span="2">{{ detailDialog.order.time }}</el-descriptions-item>
        <el-descriptions-item v-if="detailDialog.order.riskFlags && detailDialog.order.riskFlags.length" label="风险标记" :span="2">
          <el-tag v-for="flag in detailDialog.order.riskFlags" :key="flag" size="small" type="warning" style="margin-right: 4px;">{{ flag }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailDialog.order.adminReason" label="管理备注" :span="2">{{ detailDialog.order.adminReason }}</el-descriptions-item>
      </el-descriptions>

      <!-- Status Timeline -->
      <div v-if="detailDialog.order" style="margin-top: 20px;">
        <h4 style="margin-bottom: 12px; color: #e0e0e0;">处理进度</h4>
        <el-steps :active="getStepActive(detailDialog.order.status)" finish-status="success" simple style="margin-bottom: 12px;">
          <el-step title="待审核" />
          <el-step title="处理中" />
          <el-step :title="detailDialog.order.status === 'rejected' || detailDialog.order.status === 'failed' ? '失败/拒绝' : '已完成'" :status="detailDialog.order.status === 'rejected' || detailDialog.order.status === 'failed' ? 'error' : undefined" />
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getWithdrawOrders, updateWithdrawStatus, batchWithdrawals, exportWithdrawalsCSV } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Download } from '@element-plus/icons-vue'

const search = ref('')
const statusFilter = ref('')
const riskFilter = ref('')
const amountMin = ref(undefined)
const amountMax = ref(undefined)
const dateRange = ref(null)
const orders = ref([])
const loading = ref(true)
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = 15

const actionDialog = reactive({ visible: false, title: '', action: '', order: null, reason: '', loading: false })
const detailDialog = reactive({ visible: false, order: null })

const summaryData = computed(() => {
  const all = orders.value
  return {
    totalAmount: all.reduce((sum, o) => sum + (o.amount || 0), 0),
    pendingCount: all.filter(o => o.status === 'pending').length,
    processingCount: all.filter(o => o.status === 'processing' || o.status === 'review').length,
    completedCount: all.filter(o => o.status === 'completed' || o.status === 'approved').length,
    rejectedCount: all.filter(o => o.status === 'rejected' || o.status === 'failed').length
  }
})

onMounted(async () => {
  loading.value = true
  try {
    const data = await getWithdrawOrders()
    orders.value = (data || []).map(o => ({
      ...o,
      riskFlags: computeRiskFlags(o)
    }))
  } catch (e) {
    console.warn('API request failed', e)
  } finally {
    loading.value = false
  }
})

function computeRiskFlags(order) {
  const flags = []
  if (order.amount >= 50000) flags.push('大额提现')
  if (order.riskLevel === 'high') flags.push('高风险')
  if ((order.riskScore || 0) >= 80) flags.push('风控预警')
  return flags
}

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
    if (statusFilter.value && o.status !== statusFilter.value) return false
    if (riskFilter.value && o.riskLevel !== riskFilter.value) return false
    if (amountMin.value !== undefined && amountMin.value !== null && o.amount < amountMin.value) return false
    if (amountMax.value !== undefined && amountMax.value !== null && o.amount > amountMax.value) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const orderDate = o.time ? o.time.substring(0, 10) : ''
      if (orderDate < dateRange.value[0] || orderDate > dateRange.value[1]) return false
    }
    return true
  })
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function getRiskColor(score) {
  if (score >= 80) return '#f56c6c'
  if (score >= 50) return '#e6a23c'
  return '#67c23a'
}

function getStatusType(s) {
  return { pending: 'info', processing: 'warning', review: 'warning', approved: '', completed: 'success', rejected: 'danger', failed: 'danger' }[s] || 'info'
}

function getStatusLabel(s) {
  return { pending: '待审核', processing: '处理中', review: '审核中', approved: '已批准', completed: '已完成', rejected: '已拒绝', failed: '失败' }[s] || s
}

function getRowClass({ row }) {
  if (row.riskLevel === 'high' || (row.riskScore || 0) >= 80) return 'high-risk-row'
  return ''
}

function getStepActive(status) {
  if (status === 'pending') return 0
  if (status === 'processing' || status === 'review' || status === 'approved') return 1
  return 2
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制')).catch(() => ElMessage.warning('复制失败'))
}

function showApproveDialog(row) {
  actionDialog.visible = true
  actionDialog.title = '批准提现'
  actionDialog.action = 'approve'
  actionDialog.order = row
  actionDialog.reason = ''
}

function showRejectDialog(row) {
  actionDialog.visible = true
  actionDialog.title = '拒绝提现'
  actionDialog.action = 'reject'
  actionDialog.order = row
  actionDialog.reason = ''
}

async function executeAction() {
  if (actionDialog.action === 'reject' && !actionDialog.reason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  actionDialog.loading = true
  try {
    const newStatus = actionDialog.action === 'approve' ? 'approved' : 'rejected'
    await updateWithdrawStatus(actionDialog.order.id, { status: newStatus, reason: actionDialog.reason })
    actionDialog.order.status = newStatus
    actionDialog.order.adminReason = actionDialog.reason
    ElMessage.success(actionDialog.action === 'approve' ? '已批准' : '已拒绝')
    actionDialog.visible = false
  } catch (e) {
    ElMessage.error('操作失败: ' + (e.message || '未知错误'))
  } finally {
    actionDialog.loading = false
  }
}

async function markProcessing(row) {
  try {
    await updateWithdrawStatus(row.id, { status: 'processing' })
    row.status = 'processing'
    ElMessage.success('已标记为处理中')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

async function markCompleted(row) {
  try {
    await ElMessageBox.confirm(`确认提现 ¥${row.amount.toLocaleString()} 已完成?`, '确认完成')
    await updateWithdrawStatus(row.id, { status: 'completed' })
    row.status = 'completed'
    ElMessage.success('已标记为完成')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function markFailed(row) {
  try {
    await ElMessageBox.confirm(`标记提现 ${row.id} 为失败?`, '确认失败', { type: 'warning' })
    await updateWithdrawStatus(row.id, { status: 'failed' })
    row.status = 'failed'
    ElMessage.success('已标记为失败')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

function viewDetail(row) {
  detailDialog.order = row
  detailDialog.visible = true
}

async function batchAction(action) {
  const label = action === 'approve' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定批量${label} ${selectedIds.value.length} 笔提现订单?`, '批量操作', { type: 'warning' })
    const result = await batchWithdrawals({ ids: selectedIds.value, action, reason: '' })
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    for (const order of orders.value) {
      if (selectedIds.value.includes(order.id)) {
        order.status = newStatus
      }
    }
    ElMessage.success(`已批量${label} ${result.updated || selectedIds.value.length} 笔`)
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
</script>

<style scoped>
:deep(.high-risk-row) {
  background-color: rgba(245, 108, 108, 0.08) !important;
}
</style>
