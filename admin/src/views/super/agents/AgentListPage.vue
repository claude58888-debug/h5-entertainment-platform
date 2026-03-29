<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">代理管理</h2>
      <el-button type="primary" @click="$router.push('/super/agents/create')">
        <el-icon><Plus /></el-icon>创建代理
      </el-button>
    </div>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索代理名称/域名" style="width: 240px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="正常" value="active" />
          <el-option label="暂停" value="suspended" />
          <el-option label="封禁" value="banned" />
        </el-select>
      </div>
      <el-table :data="filteredAgents" stripe>
        <el-table-column prop="id" label="代理ID" width="90" />
        <el-table-column prop="brand" label="品牌名称" width="120" />
        <el-table-column prop="domain" label="域名" width="150" />
        <el-table-column prop="contact" label="联系人" width="110" />
        <el-table-column prop="members" label="会员数" width="90" sortable />
        <el-table-column label="余额" width="120" sortable sort-by="balance">
          <template #default="{ row }">¥{{ row.balance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="月收入" width="130" sortable sort-by="monthRevenue">
          <template #default="{ row }">¥{{ (row.monthRevenue / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="分成" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.shareMode === 'revenue' ? '收入' : '流水' }} {{ row.shareRate }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'suspended' ? 'warning' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : row.status === 'suspended' ? '暂停' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="$router.push('/super/agents/' + row.id)">详情</el-button>
            <el-button size="small" type="warning" text @click="handleTopup(row)">充值</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleStatus(row)">
              {{ row.status === 'active' ? '暂停' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredAgents.length" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAgents, updateAgent } from '@/api/agents'
import { agentsList } from '@/mock/data'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const agents = ref([...agentsList])

onMounted(async () => {
  try {
    const data = await getAgents()
    if (data?.length) agents.value = data
  } catch (e) { console.warn('Agents API failed, using mock data', e) }
})

const filteredAgents = computed(() => {
  return agents.value.filter(a => {
    if (search.value && !a.brand.includes(search.value) && !a.domain.includes(search.value)) return false
    if (statusFilter.value && a.status !== statusFilter.value) return false
    return true
  })
})

function handleTopup(row) {
  ElMessageBox.prompt(`为 ${row.brand} 充值`, '代理充值', {
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效金额'
  }).then(({ value }) => {
    row.balance += parseInt(value)
    ElMessage.success(`已为 ${row.brand} 充值 ¥${value}`)
  }).catch(() => {})
}

function toggleStatus(row) {
  const action = row.status === 'active' ? '暂停' : '启用'
  ElMessageBox.confirm(`确定要${action}代理 ${row.brand} 吗?`, '确认', { type: 'warning' }).then(() => {
    row.status = row.status === 'active' ? 'suspended' : 'active'
    ElMessage.success(`已${action} ${row.brand}`)
  }).catch(() => {})
}
</script>
