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
      </div>
      <el-table :data="filteredOrders" stripe>
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="agent" label="代理" width="100" />
        <el-table-column label="金额" width="120" sortable sort-by="amount">
          <template #default="{ row }"><span style="color: #67c23a; font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDeposits, updateDeposit } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const dateRange = ref(null)
const orders = ref([])

onMounted(async () => {
  try {
    const data = await getDeposits()
    orders.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
    if (statusFilter.value && o.status !== statusFilter.value) return false
    if (channelFilter.value && o.channel !== channelFilter.value) return false
    return true
  })
})

function approve(row) {
  ElMessageBox.confirm(`确认充值订单 ${row.id} 金额 ¥${row.amount.toLocaleString()}?`, '确认到账').then(() => {
    row.status = 'completed'
    ElMessage.success('已确认到账')
  }).catch(() => {})
}
function reject(row) {
  ElMessageBox.confirm(`拒绝充值订单 ${row.id}?`, '拒绝', { type: 'warning' }).then(() => {
    row.status = 'failed'
    ElMessage.success('已拒绝')
  }).catch(() => {})
}
</script>
