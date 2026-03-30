<template>
  <div>
    <h2 class="section-title">充值管理 (Deposit Management)</h2>

    <!-- Deposit Statistics Summary -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">今日充值</div>
          <div style="font-size: 22px; font-weight: 700; color: #67c23a;">¥{{ stats.todayTotal.toLocaleString() }}</div>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">{{ stats.todayCount }} 笔</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">本周充值</div>
          <div style="font-size: 22px; font-weight: 700; color: #409eff;">¥{{ stats.weekTotal.toLocaleString() }}</div>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">{{ stats.weekCount }} 笔</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">本月充值</div>
          <div style="font-size: 22px; font-weight: 700; color: #e6a23c;">¥{{ stats.monthTotal.toLocaleString() }}</div>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">{{ stats.monthCount }} 笔</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">待处理</div>
          <div style="font-size: 22px; font-weight: 700; color: #f56c6c;">{{ stats.pendingCount }}</div>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">需审核</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">已完成</div>
          <div style="font-size: 22px; font-weight: 700; color: #67c23a;">{{ stats.completedCount }}</div>
        </div>
      </el-card>
      <el-card shadow="hover" style="flex: 1; min-width: 180px;">
        <div style="text-align: center;">
          <div style="font-size: 13px; color: #909399; margin-bottom: 6px;">已拒绝</div>
          <div style="font-size: 22px; font-weight: 700; color: #f56c6c;">{{ stats.rejectedCount }}</div>
        </div>
      </el-card>
    </div>

    <!-- Deposit Channel Configuration -->
    <div class="table-card" style="margin-bottom: 20px;">
      <div class="page-header" style="margin-bottom: 0;">
        <h3 style="margin: 0; font-size: 16px;">充值通道配置</h3>
        <el-button type="primary" size="small" @click="showChannelDialog = true"><el-icon><Plus /></el-icon>添加通道</el-button>
      </div>
      <el-table :data="depositChannels" stripe style="margin-top: 12px;" size="small">
        <el-table-column prop="name" label="通道名称" width="140" />
        <el-table-column label="网络" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.network === 'TRC20' ? 'success' : row.network === 'ERC20' ? 'primary' : 'info'">{{ row.network }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地址" min-width="280">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: monospace; font-size: 12px;">{{ row.address }}</span>
              <el-button size="small" type="primary" text :icon="CopyDocument" @click="copyText(row.address)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" @change="toggleChannel(row)" />
          </template>
        </el-table-column>
        <el-table-column label="今日收款" width="120">
          <template #default="{ row }">¥{{ (row.todayAmount || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="editChannel(row)">编辑</el-button>
            <el-button size="small" type="danger" text @click="removeChannel(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Orders Table -->
    <div class="table-card">
      <div class="filter-bar" style="flex-wrap: wrap;">
        <el-input v-model="search" placeholder="订单号/会员ID" style="width: 180px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待处理" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已拒绝" value="failed" />
        </el-select>
        <el-select v-model="channelFilter" placeholder="渠道" style="width: 140px;" clearable>
          <el-option label="USDT-TRC20" value="USDT-TRC20" />
          <el-option label="USDT-ERC20" value="USDT-ERC20" />
          <el-option label="银行转账" value="银行转账" />
        </el-select>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: #606266;">金额:</span>
          <el-input-number v-model="amountMin" :min="0" :precision="0" placeholder="最小" size="small" style="width: 110px;" controls-position="right" />
          <span style="color: #909399;">-</span>
          <el-input-number v-model="amountMax" :min="0" :precision="0" placeholder="最大" size="small" style="width: 110px;" controls-position="right" />
        </div>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px;" value-format="YYYY-MM-DD" />
        <el-button type="success" :disabled="!selectedIds.length" @click="batchApprove"><el-icon><Check /></el-icon>批量确认 ({{ selectedIds.length }})</el-button>
        <el-button type="danger" :disabled="!selectedIds.length" @click="batchReject"><el-icon><Close /></el-icon>批量拒绝 ({{ selectedIds.length }})</el-button>
        <el-button @click="exportCSV"><el-icon><Download /></el-icon>导出CSV</el-button>
      </div>

      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <el-empty description="暂无充值订单" />
      </div>

      <el-table v-else :data="paginatedOrders" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" :selectable="row => row.status === 'pending'" />
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="agent" label="代理" width="100" />
        <el-table-column label="金额" width="120" sortable sort-by="amount">
          <template #default="{ row }"><span style="color: #67c23a; font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column label="TxHash" width="200">
          <template #default="{ row }">
            <template v-if="row.txHash">
              <el-tooltip :content="row.txHash" placement="top">
                <span class="txhash-cell">
                  <a v-if="isTRC20(row)" :href="'https://tronscan.org/#/transaction/' + row.txHash" target="_blank" rel="noopener" style="color: #409eff; text-decoration: none;">{{ row.txHash.substring(0, 12) }}...</a>
                  <span v-else>{{ row.txHash.substring(0, 12) }}...</span>
                  <el-button size="small" type="primary" text :icon="CopyDocument" @click="copyText(row.txHash)" style="margin-left: 4px;" />
                </span>
              </el-tooltip>
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'" size="small">
              {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待处理' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" text @click="approveOrder(row)">确认</el-button>
              <el-button size="small" type="danger" text @click="rejectOrder(row)">拒绝</el-button>
            </template>
            <el-button size="small" type="primary" text @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredOrders.length > pageSize" style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredOrders.length" layout="total, prev, pager, next" background small />
      </div>
    </div>

    <!-- Approve/Reject Dialog with Admin Notes -->
    <el-dialog v-model="actionDialog.visible" :title="actionDialog.title" width="500px">
      <div v-if="actionDialog.order" style="margin-bottom: 16px;">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ actionDialog.order.id }}</el-descriptions-item>
          <el-descriptions-item label="会员">{{ actionDialog.order.member }}</el-descriptions-item>
          <el-descriptions-item label="金额"><span style="color: #67c23a; font-weight: 600;">¥{{ actionDialog.order.amount.toLocaleString() }}</span></el-descriptions-item>
          <el-descriptions-item label="渠道">{{ actionDialog.order.channel }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form label-width="80px">
        <el-form-item label="管理备注">
          <el-input v-model="actionDialog.notes" type="textarea" :rows="3" :placeholder="actionDialog.action === 'approve' ? '确认到账备注 (可选)' : '拒绝原因 (必填)'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button :type="actionDialog.action === 'approve' ? 'success' : 'danger'" :loading="actionDialog.loading" @click="executeAction">
          {{ actionDialog.action === 'approve' ? '确认到账' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Order Detail Dialog -->
    <el-dialog v-model="detailDialog.visible" title="订单详情" width="600px">
      <el-descriptions v-if="detailDialog.order" :column="2" border>
        <el-descriptions-item label="订单号">{{ detailDialog.order.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailDialog.order.status === 'completed' ? 'success' : detailDialog.order.status === 'pending' ? 'warning' : 'danger'" size="small">
            {{ detailDialog.order.status === 'completed' ? '已完成' : detailDialog.order.status === 'pending' ? '待处理' : '已拒绝' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会员">{{ detailDialog.order.member }}</el-descriptions-item>
        <el-descriptions-item label="代理">{{ detailDialog.order.agent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="金额"><span style="color: #67c23a; font-weight: 600;">¥{{ detailDialog.order.amount.toLocaleString() }}</span></el-descriptions-item>
        <el-descriptions-item label="渠道">{{ detailDialog.order.channel }}</el-descriptions-item>
        <el-descriptions-item label="TxHash" :span="2">{{ detailDialog.order.txHash || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时间" :span="2">{{ detailDialog.order.time }}</el-descriptions-item>
        <el-descriptions-item v-if="detailDialog.order.adminNotes" label="管理备注" :span="2">{{ detailDialog.order.adminNotes }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- Channel Config Dialog -->
    <el-dialog v-model="showChannelDialog" :title="channelForm.id ? '编辑通道' : '添加充值通道'" width="500px">
      <el-form :model="channelForm" label-width="100px">
        <el-form-item label="通道名称" required>
          <el-input v-model="channelForm.name" placeholder="如 USDT-TRC20" />
        </el-form-item>
        <el-form-item label="网络类型" required>
          <el-select v-model="channelForm.network" placeholder="选择网络" style="width: 100%;">
            <el-option label="TRC20" value="TRC20" />
            <el-option label="ERC20" value="ERC20" />
            <el-option label="BEP20" value="BEP20" />
            <el-option label="Bank" value="Bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款地址" required>
          <el-input v-model="channelForm.address" placeholder="输入USDT钱包地址或银行账号" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="channelForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChannelDialog = false">取消</el-button>
        <el-button type="primary" @click="saveChannel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getDepositStats, getDepositOrders, approveDeposit, rejectDeposit, exportDepositsCSV, getDepositChannels, saveDepositChannel, deleteDepositChannel } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, CopyDocument, Check, Close } from '@element-plus/icons-vue'

const search = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const amountMin = ref(undefined)
const amountMax = ref(undefined)
const dateRange = ref(null)
const orders = ref([])
const loading = ref(true)
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = 15
const depositChannels = ref([])
const showChannelDialog = ref(false)
const channelForm = reactive({ id: null, name: '', network: 'TRC20', address: '', enabled: true })

const stats = reactive({
  todayTotal: 0, todayCount: 0,
  weekTotal: 0, weekCount: 0,
  monthTotal: 0, monthCount: 0,
  pendingCount: 0, completedCount: 0, rejectedCount: 0
})

const actionDialog = reactive({
  visible: false, title: '', action: '', order: null, notes: '', loading: false
})

const detailDialog = reactive({ visible: false, order: null })

onMounted(async () => {
  loading.value = true
  try {
    const [ordersData, statsData, channelsData] = await Promise.all([
      getDepositOrders(),
      getDepositStats(),
      getDepositChannels()
    ])
    orders.value = ordersData || []
    if (statsData) Object.assign(stats, statsData)
    depositChannels.value = channelsData || []
  } catch (e) {
    console.warn('API request failed', e)
  } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
    if (statusFilter.value && o.status !== statusFilter.value) return false
    if (channelFilter.value && o.channel !== channelFilter.value) return false
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

function isTRC20(row) {
  return row.channel && row.channel.includes('TRC20')
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制')
  }).catch(() => {
    ElMessage.warning('复制失败')
  })
}

function approveOrder(row) {
  actionDialog.visible = true
  actionDialog.title = '确认充值到账'
  actionDialog.action = 'approve'
  actionDialog.order = row
  actionDialog.notes = ''
}

function rejectOrder(row) {
  actionDialog.visible = true
  actionDialog.title = '拒绝充值订单'
  actionDialog.action = 'reject'
  actionDialog.order = row
  actionDialog.notes = ''
}

async function executeAction() {
  if (actionDialog.action === 'reject' && !actionDialog.notes) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  actionDialog.loading = true
  try {
    const orderId = actionDialog.order.id
    if (actionDialog.action === 'approve') {
      await approveDeposit(orderId, actionDialog.notes)
      actionDialog.order.status = 'completed'
      actionDialog.order.adminNotes = actionDialog.notes
      ElMessage.success('已确认到账')
    } else {
      await rejectDeposit(orderId, actionDialog.notes)
      actionDialog.order.status = 'failed'
      actionDialog.order.adminNotes = actionDialog.notes
      ElMessage.success('已拒绝')
    }
    actionDialog.visible = false
    refreshStats()
  } catch (e) {
    ElMessage.error('操作失败: ' + (e.message || '未知错误'))
  } finally {
    actionDialog.loading = false
  }
}

function viewDetail(row) {
  detailDialog.order = row
  detailDialog.visible = true
}

async function batchApprove() {
  try {
    await ElMessageBox.confirm(`确定批量确认 ${selectedIds.value.length} 笔充值订单?`, '批量确认', { type: 'warning' })
    for (const order of orders.value) {
      if (selectedIds.value.includes(order.id)) {
        try {
          await approveDeposit(order.id, '')
          order.status = 'completed'
        } catch (e) { /* skip */ }
      }
    }
    ElMessage.success(`已批量确认 ${selectedIds.value.length} 笔`)
    selectedIds.value = []
    refreshStats()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量操作失败')
  }
}

async function batchReject() {
  try {
    await ElMessageBox.confirm(`确定批量拒绝 ${selectedIds.value.length} 笔充值订单?`, '批量拒绝', { type: 'warning' })
    for (const order of orders.value) {
      if (selectedIds.value.includes(order.id)) {
        try {
          await rejectDeposit(order.id, '批量拒绝')
          order.status = 'failed'
        } catch (e) { /* skip */ }
      }
    }
    ElMessage.success(`已批量拒绝 ${selectedIds.value.length} 笔`)
    selectedIds.value = []
    refreshStats()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量操作失败')
  }
}

async function exportCSV() {
  try {
    const response = await exportDepositsCSV()
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'deposits_export.csv'
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

function refreshStats() {
  const all = orders.value
  stats.pendingCount = all.filter(o => o.status === 'pending').length
  stats.completedCount = all.filter(o => o.status === 'completed').length
  stats.rejectedCount = all.filter(o => o.status === 'failed').length
}

function editChannel(row) {
  Object.assign(channelForm, { id: row.id, name: row.name, network: row.network, address: row.address, enabled: row.enabled })
  showChannelDialog.value = true
}

async function saveChannel() {
  if (!channelForm.name || !channelForm.address) {
    ElMessage.warning('请填写必填项')
    return
  }
  try {
    const result = await saveDepositChannel(channelForm)
    if (channelForm.id) {
      const idx = depositChannels.value.findIndex(c => c.id === channelForm.id)
      if (idx >= 0) Object.assign(depositChannels.value[idx], channelForm)
    } else {
      depositChannels.value.push({ ...channelForm, id: result.id, todayAmount: 0 })
    }
    showChannelDialog.value = false
    Object.assign(channelForm, { id: null, name: '', network: 'TRC20', address: '', enabled: true })
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function removeChannel(row) {
  try {
    await ElMessageBox.confirm(`删除通道 "${row.name}"?`, '确认', { type: 'warning' })
    await deleteDepositChannel(row.id)
    depositChannels.value = depositChannels.value.filter(c => c.id !== row.id)
    ElMessage.success('已删除')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function toggleChannel(row) {
  try {
    await saveDepositChannel({ id: row.id, enabled: row.enabled })
  } catch (e) {
    row.enabled = !row.enabled
    ElMessage.error('更新失败')
  }
}
</script>
