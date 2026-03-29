<template>
  <div>
    <h2 class="section-title">操作日志</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索操作人/内容" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="操作类型" style="width: 140px;" clearable>
          <el-option label="登录" value="login" /><el-option label="会员" value="member" />
          <el-option label="财务" value="finance" /><el-option label="系统" value="system" />
          <el-option label="风控" value="risk" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" />
        <el-button type="primary" plain><el-icon><Download /></el-icon>导出日志</el-button>
      </div>
      <el-table :data="filteredLogs" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="operator" label="操作人" width="130" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="logTypeColor(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作内容" min-width="240" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column label="详情" width="80">
          <template #default>
            <el-button size="small" type="primary" text>查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredLogs.length" :page-size="15" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLogs } from '@/api/system'

const search = ref('')
const typeFilter = ref('')
const dateRange = ref(null)
const logs = ref([])

onMounted(async () => {
  try {
    const data = await getLogs()
    logs.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredLogs = computed(() => logs.value.filter(l => {
  if (search.value && !l.operator.includes(search.value) && !l.action.includes(search.value)) return false
  if (typeFilter.value && l.type !== typeFilter.value) return false
  return true
}))

function logTypeColor(type) {
  return { login: '', member: 'success', finance: 'warning', system: 'danger', risk: 'danger' }[type] || 'info'
}
</script>
