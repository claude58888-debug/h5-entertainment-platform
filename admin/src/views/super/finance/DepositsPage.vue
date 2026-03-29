<template>
  <div>
    <h2 class="section-title">充值订单 (全平台)</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索订单号/会员" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="已完成" value="completed" />
          <el-option label="待处理" value="pending" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-select v-model="channelFilter" placeholder="渠道" style="width: 140px;" clearable>
          <el-option label="USDT-TRC20" value="USDT-TRC20" />
          <el-option label="USDT-ERC20" value="USDT-ERC20" />
          <el-option label="银行转账" value="银行转账" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px;" />
        <el-button type="primary" @click="manualDepositDialog = true"><el-icon><Plus /></el-icon>手动补单</el-button>
        <el-button @click="exportCSV"><el-icon><Download /></el-icon>导出CSV</el-button>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <el-empty description="暂无充值订单" />
      </div>

      <el-table v-else :data="filteredOrders" stripe>
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
                  <el-button size="small" type="primary" text :icon="CopyDocument" @click="copyTxHash(row.txHash)" style="margin-left: 4px;" />
                </span>
              </el-tooltip>
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'" size="small">
              {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待处理' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" text @click="approve(row)">确认</el-button>
              <el-button size="small" type="danger" text @click="reject(row)">拒绝</el-button>
            </template>
            <el-button v-else size="small" type="primary" text>详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Manual Deposit Dialog -->
    <el-dialog v-model="manualDepositDialog" title="手动补单" width="500px">
      <el-form :model="manualForm" label-width="100px">
        <el-form-item label="会员ID" required>
          <el-input v-model="manualForm.member_id" placeholder="输入会员ID (如 M10001)" />
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="manualForm.amount" :min="0.01" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="manualForm.channel" placeholder="选择渠道" style="width: 100%;">
            <el-option label="USDT-TRC20" value="USDT-TRC20" />
            <el-option label="USDT-ERC20" value="USDT-ERC20" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="手动补单" value="手动补单" />
          </el-select>
        </el-form-item>
        <el-form-item label="TxHash">
          <el-input v-model="manualForm.txhash" placeholder="区块链交易哈希 (可选)" />
        </el-form-item>
        <el-form-item label="补单原因" required>
          <el-input v-model="manualForm.reason" type="textarea" :rows="3" placeholder="请输入补单原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualDepositDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitManualDeposit">确认补单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getDeposits, updateDeposit, createManualDeposit, exportDepositsCSV } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, CopyDocument } from '@element-plus/icons-vue'

const search = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const dateRange = ref(null)
const orders = ref([])
const loading = ref(true)
const manualDepositDialog = ref(false)
const submitting = ref(false)
const manualForm = reactive({
  member_id: '',
  amount: 0,
  channel: '手动补单',
  txhash: '',
  reason: ''
})

onMounted(async () => {
  try {
    loading.value = true
    const data = await getDeposits()
    orders.value = data || []
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
    if (statusFilter.value && o.status !== statusFilter.value) return false
    if (channelFilter.value && o.channel !== channelFilter.value) return false
    return true
  })
})

function isTRC20(row) {
  return row.channel && row.channel.includes('TRC20')
}

function copyTxHash(hash) {
  navigator.clipboard.writeText(hash).then(() => {
    ElMessage.success('已复制TxHash')
  }).catch(() => {
    ElMessage.warning('复制失败，请手动复制')
  })
}

async function submitManualDeposit() {
  if (!manualForm.member_id || !manualForm.amount || !manualForm.reason) {
    ElMessage.warning('请填写必填项')
    return
  }
  submitting.value = true
  try {
    const result = await createManualDeposit(manualForm)
    orders.value.unshift({
      id: result.id,
      member: manualForm.member_id,
      agent: '',
      amount: manualForm.amount,
      channel: manualForm.channel || '手动补单',
      status: 'completed',
      txHash: manualForm.txhash || '',
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    })
    manualDepositDialog.value = false
    Object.assign(manualForm, { member_id: '', amount: 0, channel: '手动补单', txhash: '', reason: '' })
    ElMessage.success('补单成功')
  } catch (e) {
    ElMessage.error('补单失败: ' + (e.error || e.message || '未知错误'))
  } finally {
    submitting.value = false
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

function approve(row) {
  ElMessageBox.confirm(`确认充值订单 ${row.id} 金额 ¥${row.amount.toLocaleString()}?`, '确认到账').then(async () => {
    try {
      await updateDeposit(row.id, { status: 'completed' })
      row.status = 'completed'
      ElMessage.success('已确认到账')
    } catch (e) {
      ElMessage.error(`操作失败: ${e.message || '未知错误'}`)
    }
  }).catch(() => {})
}
function reject(row) {
  ElMessageBox.confirm(`拒绝充值订单 ${row.id}?`, '拒绝', { type: 'warning' }).then(async () => {
    try {
      await updateDeposit(row.id, { status: 'failed' })
      row.status = 'failed'
      ElMessage.success('已拒绝')
    } catch (e) {
      ElMessage.error(`操作失败: ${e.message || '未知错误'}`)
    }
  }).catch(() => {})
}
</script>
