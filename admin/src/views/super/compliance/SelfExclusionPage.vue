<template>
  <div>
    <h2 class="section-title">自我排除管理</h2>
    <div class="table-card">
      <el-table :data="exclusions" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="userId" label="会员ID" width="100" />
        <el-table-column prop="exclusionType" label="排除类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.exclusionType] || 'info'" size="small">
              {{ typeLabels[row.exclusionType] || row.exclusionType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="180" />
        <el-table-column prop="endDate" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'danger' : row.status === 'revoked' ? 'warning' : 'info'" size="small">
              {{ row.status === 'active' ? '生效中' : row.status === 'revoked' ? '已撤销' : '已过期' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'active'" size="small" type="warning" text @click="handleRevoke(row)">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getExclusions, manageExclusion } from '@/api/compliance'
import { ElMessage, ElMessageBox } from 'element-plus'

const exclusions = ref([])

const typeLabels = { '24h': '24小时', '7d': '7天', '30d': '30天', '6m': '6个月', 'permanent': '永久' }
const typeMap = { '24h': '', '7d': 'warning', '30d': 'warning', '6m': 'danger', 'permanent': 'danger' }

async function loadData() {
  try {
    const data = await getExclusions()
    if (data) exclusions.value = data
  } catch (e) {
    console.warn('Failed to load exclusions', e)
  }
}

onMounted(loadData)

function handleRevoke(row) {
  ElMessageBox.confirm(
    `确定要撤销用户 ${row.username} 的自我排除？这将恢复该用户的账户访问权限。`,
    '确认撤销',
    { type: 'warning', confirmButtonText: '确定撤销', cancelButtonText: '取消' }
  ).then(async () => {
    try {
      await manageExclusion(row.id, 'revoke')
      ElMessage.success('已撤销自我排除')
      loadData()
    } catch (e) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}
</script>
