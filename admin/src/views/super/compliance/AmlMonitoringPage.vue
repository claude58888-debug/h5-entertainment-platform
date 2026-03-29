<template>
  <div>
    <h2 class="section-title">AML监控</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <el-select v-model="statusFilter" placeholder="筛选状态" style="width: 160px;" clearable @change="loadData">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="open" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已上报" value="escalated" />
          <el-option label="已忽略" value="dismissed" />
        </el-select>
        <div>
          <el-tag type="danger" style="margin-right: 8px;">AML阈值: ¥10,000</el-tag>
          <el-tag type="info">超过阈值的交易将自动触发警报</el-tag>
        </div>
      </div>
      <el-table :data="alerts" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="alertType" label="警报类型" width="140">
          <template #default="{ row }">
            <el-tag :type="alertTypeMap[row.alertType]?.type || 'info'" size="small">
              {{ alertTypeMap[row.alertType]?.label || row.alertType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.amount >= 10000 ? '#f56c6c' : '#e0e0e0', fontWeight: row.amount >= 10000 ? '700' : '400' }">
              ¥{{ row.amount?.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="transactionId" label="交易ID" width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'open'">
              <el-button size="small" type="success" text @click="handleAlert(row, 'resolve')">解决</el-button>
              <el-button size="small" type="warning" text @click="handleAlert(row, 'escalate')">上报SAR</el-button>
              <el-button size="small" type="info" text @click="handleAlert(row, 'dismiss')">忽略</el-button>
            </template>
            <span v-else style="color: #a0a0b0; font-size: 12px;">
              {{ row.resolvedBy }} @ {{ row.resolvedAt }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAmlAlerts, resolveAmlAlert } from '@/api/compliance'
import { ElMessage, ElMessageBox } from 'element-plus'

const statusFilter = ref('')
const alerts = ref([])

const alertTypeMap = {
  large_transaction: { label: '大额交易', type: 'danger' },
  frequent_transaction: { label: '频繁交易', type: 'warning' },
  suspicious_pattern: { label: '可疑模式', type: 'danger' },
  structuring: { label: '拆分交易', type: 'warning' },
  cross_border: { label: '跨境交易', type: 'info' }
}

const statusMap = {
  open: { label: '待处理', type: 'danger' },
  resolved: { label: '已解决', type: 'success' },
  escalated: { label: '已上报', type: 'warning' },
  dismissed: { label: '已忽略', type: 'info' }
}

async function loadData() {
  try {
    const data = await getAmlAlerts(statusFilter.value)
    if (data) alerts.value = data
  } catch (e) {
    console.warn('Failed to load AML alerts', e)
  }
}

onMounted(loadData)

function handleAlert(row, action) {
  const labels = { resolve: '解决', escalate: '上报SAR', dismiss: '忽略' }
  const types = { resolve: 'success', escalate: 'warning', dismiss: 'info' }

  ElMessageBox.confirm(
    `确定要${labels[action]}此AML警报？用户: ${row.username}, 金额: ¥${row.amount?.toLocaleString()}`,
    `确认${labels[action]}`,
    { type: types[action] }
  ).then(async () => {
    try {
      await resolveAmlAlert(row.id, action)
      ElMessage.success(`已${labels[action]}`)
      loadData()
    } catch (e) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}
</script>
