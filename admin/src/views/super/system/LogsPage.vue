<template>
  <div>
    <h2 class="section-title">系统日志</h2>
    <div class="table-card">
      <el-tabs v-model="activeTab">
        <!-- Operation Logs Tab -->
        <el-tab-pane label="操作日志" name="operation">
          <div class="filter-bar">
            <el-input v-model="opSearch" placeholder="搜索操作人/内容" style="width: 200px;" clearable prefix-icon="Search" />
            <el-select v-model="opTypeFilter" placeholder="操作类型" style="width: 140px;" clearable>
              <el-option label="登录" value="login" />
              <el-option label="会员" value="member" />
              <el-option label="财务" value="finance" />
              <el-option label="系统" value="system" />
              <el-option label="风控" value="risk" />
            </el-select>
            <el-select v-model="opAdminFilter" placeholder="操作人" style="width: 150px;" clearable>
              <el-option v-for="admin in operatorList" :key="admin" :label="admin" :value="admin" />
            </el-select>
            <el-date-picker v-model="opDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 280px;" clearable />
            <el-button type="primary" plain><el-icon><Download /></el-icon>导出日志</el-button>
          </div>
          <el-table :data="paginatedOpLogs" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="operator" label="操作人" width="130" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="logTypeColor(row.type)" size="small">{{ logTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作内容" min-width="240" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="time" label="操作时间" width="180" sortable />
            <el-table-column label="详情" width="80">
              <template #default="{ row }">
                <el-button size="small" type="primary" text @click="showLogDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 16px; text-align: right;">
            <el-pagination v-model:current-page="opCurrentPage" v-model:page-size="opPageSize" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" :total="filteredOpLogs.length" />
          </div>
        </el-tab-pane>

        <!-- Login Logs Tab -->
        <el-tab-pane label="登录日志" name="login">
          <div class="filter-bar">
            <el-input v-model="loginSearch" placeholder="搜索操作人/IP" style="width: 200px;" clearable prefix-icon="Search" />
            <el-select v-model="loginStatusFilter" placeholder="登录状态" style="width: 130px;" clearable>
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
            </el-select>
            <el-select v-model="loginAdminFilter" placeholder="操作人" style="width: 150px;" clearable>
              <el-option v-for="admin in loginOperatorList" :key="admin" :label="admin" :value="admin" />
            </el-select>
            <el-date-picker v-model="loginDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 280px;" clearable />
            <el-button type="primary" plain><el-icon><Download /></el-icon>导出日志</el-button>
          </div>
          <el-table :data="paginatedLoginLogs" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="operator" label="操作人" width="130" />
            <el-table-column prop="role" label="角色" width="120" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column prop="location" label="位置" width="100" />
            <el-table-column prop="device" label="设备" width="160" />
            <el-table-column prop="time" label="登录时间" width="180" sortable />
          </el-table>
          <div style="margin-top: 16px; text-align: right;">
            <el-pagination v-model:current-page="loginCurrentPage" v-model:page-size="loginPageSize" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" :total="filteredLoginLogs.length" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Log Detail Dialog -->
    <el-dialog v-model="detailVisible" title="日志详情" width="500px" destroy-on-close>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="日志ID">{{ logDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ logDetail.operator }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="logTypeColor(logDetail.type)" size="small">{{ logTypeLabel(logDetail.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ logDetail.action }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ logDetail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ logDetail.time }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLogs, getLoginLogs } from '@/api/system'

const activeTab = ref('operation')

// Operation logs state
const opSearch = ref('')
const opTypeFilter = ref('')
const opAdminFilter = ref('')
const opDateRange = ref(null)
const opLogs = ref([])
const opCurrentPage = ref(1)
const opPageSize = ref(10)

// Login logs state
const loginSearch = ref('')
const loginStatusFilter = ref('')
const loginAdminFilter = ref('')
const loginDateRange = ref(null)
const loginLogs = ref([])
const loginCurrentPage = ref(1)
const loginPageSize = ref(10)

// Detail dialog
const detailVisible = ref(false)
const logDetail = ref({})

onMounted(async () => {
  try { const data = await getLogs(); opLogs.value = data || [] } catch (e) { console.warn('API request failed', e) }
  try { const data = await getLoginLogs(); loginLogs.value = data || [] } catch (e) { console.warn('Login logs API failed', e) }
})

const operatorList = computed(() => [...new Set(opLogs.value.map(l => l.operator))].sort())
const loginOperatorList = computed(() => [...new Set(loginLogs.value.map(l => l.operator))].sort())

const filteredOpLogs = computed(() => {
  return opLogs.value.filter(l => {
    if (opSearch.value) {
      const s = opSearch.value.toLowerCase()
      if (!(l.operator || '').toLowerCase().includes(s) && !(l.action || '').toLowerCase().includes(s)) return false
    }
    if (opTypeFilter.value && l.type !== opTypeFilter.value) return false
    if (opAdminFilter.value && l.operator !== opAdminFilter.value) return false
    if (opDateRange.value && opDateRange.value.length === 2) {
      const t = (l.time || '').substring(0, 10)
      if (t < opDateRange.value[0] || t > opDateRange.value[1]) return false
    }
    return true
  })
})

const paginatedOpLogs = computed(() => {
  const start = (opCurrentPage.value - 1) * opPageSize.value
  return filteredOpLogs.value.slice(start, start + opPageSize.value)
})

const filteredLoginLogs = computed(() => {
  return loginLogs.value.filter(l => {
    if (loginSearch.value) {
      const s = loginSearch.value.toLowerCase()
      if (!(l.operator || '').toLowerCase().includes(s) && !(l.ip || '').includes(loginSearch.value)) return false
    }
    if (loginStatusFilter.value && l.status !== loginStatusFilter.value) return false
    if (loginAdminFilter.value && l.operator !== loginAdminFilter.value) return false
    if (loginDateRange.value && loginDateRange.value.length === 2) {
      const t = (l.time || '').substring(0, 10)
      if (t < loginDateRange.value[0] || t > loginDateRange.value[1]) return false
    }
    return true
  })
})

const paginatedLoginLogs = computed(() => {
  const start = (loginCurrentPage.value - 1) * loginPageSize.value
  return filteredLoginLogs.value.slice(start, start + loginPageSize.value)
})

function logTypeColor(type) {
  return { login: '', member: 'success', finance: 'warning', system: 'danger', risk: 'danger' }[type] || 'info'
}

function logTypeLabel(type) {
  return { login: '登录', member: '会员', finance: '财务', system: '系统', risk: '风控' }[type] || type
}

function showLogDetail(row) {
  logDetail.value = row
  detailVisible.value = true
}
</script>
