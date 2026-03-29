<template>
  <div>
    <h2 class="section-title">提现订单 (全平台)</h2>
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
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <el-empty description="暂无提现订单" />
      </div>

      <el-table v-else :data="filteredOrders" stripe>
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="agent" label="代理" width="100" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }"><span style="color: #e6a23c; font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column prop="address" label="提现地址" width="160" show-overflow-tooltip />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWithdrawals, updateWithdrawal } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const riskFilter = ref('')
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    loading.value = true
    const data = await getWithdrawals()
    orders.value = data || []
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => orders.value.filter(o => {
  if (search.value && !o.id.includes(search.value) && !o.member.includes(search.value)) return false
  if (statusFilter.value && o.status !== statusFilter.value) return false
  if (riskFilter.value && o.riskLevel !== riskFilter.value) return false
  return true
}))

function statusType(s) { return { pending: 'info', review: 'warning', approved: '', completed: 'success' }[s] || 'info' }
function statusLabel(s) { return { pending: '待审核', review: '审核中', approved: '已批准', completed: '已完成' }[s] || s }

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
</script>
