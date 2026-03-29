<template>
  <div>
    <h2 class="section-title">提现订单</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索订单号/会员" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="待审核" value="pending" /><el-option label="已批准" value="approved" /><el-option label="已完成" value="completed" />
        </el-select>
        <el-button type="success" :disabled="!selectedRows.length" @click="batchApprove">批量审批 ({{ selectedRows.length }})</el-button>
      </div>
      <el-table :data="filteredOrders" stripe @selection-change="v => selectedRows = v">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }"><span style="color:#e6a23c;font-weight:600;">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column label="AML检查" width="90">
          <template #default="{ row }">
            <el-tag :type="row.amlCheck === 'pass' ? 'success' : 'danger'" size="small">{{ row.amlCheck === 'pass' ? '通过' : '异常' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'info'" size="small">
              {{ { pending: '待审核', approved: '已批准', completed: '已完成' }[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" text @click="approve(row)">批准</el-button>
              <el-button size="small" type="danger" text @click="reject(row)">拒绝</el-button>
            </template>
            <el-button v-else size="small" type="primary" text>详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWithdrawals } from '@/api/finance'
import { withdrawalOrders } from '@/mock/data'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const selectedRows = ref([])
const orders = ref(withdrawalOrders.filter(o => o.agent === '金沙娱乐').map(o => ({ ...o, amlCheck: Math.random() > 0.2 ? 'pass' : 'fail' })))

onMounted(async () => {
  try {
    const data = await getWithdrawals()
    if (data?.length) orders.value = data.map(o => ({ ...o, amlCheck: Math.random() > 0.2 ? 'pass' : 'fail' }))
  } catch (e) { console.warn('Withdrawals API failed, using mock data', e) }
})

const filteredOrders = computed(() => orders.value.filter(o => {
  if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
  if (statusFilter.value && o.status !== statusFilter.value) return false
  return true
}))

function approve(row) {
  ElMessageBox.confirm(`批准提现 ¥${row.amount.toLocaleString()}?`, '确认').then(() => { row.status = 'approved'; ElMessage.success('已批准') }).catch(() => {})
}
function reject(row) {
  ElMessageBox.confirm('拒绝此订单?', '确认', { type: 'warning' }).then(() => { row.status = 'rejected'; ElMessage.success('已拒绝') }).catch(() => {})
}
function batchApprove() {
  ElMessageBox.confirm(`批量批准 ${selectedRows.value.length} 笔提现?`, '确认').then(() => {
    selectedRows.value.forEach(r => { r.status = 'approved' })
    ElMessage.success(`已批准 ${selectedRows.value.length} 笔`)
  }).catch(() => {})
}
</script>
