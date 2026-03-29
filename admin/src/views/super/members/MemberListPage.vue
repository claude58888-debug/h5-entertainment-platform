<template>
  <div>
    <h2 class="section-title">会员管理 (全平台)</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索用户名" style="width: 200px;" clearable prefix-icon="Search" aria-label="搜索用户名" />
        <el-select v-model="agentFilter" placeholder="所属代理" style="width: 140px;" clearable aria-label="筛选代理">
          <el-option v-for="a in agents" :key="a" :label="a" :value="a" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable aria-label="筛选状态">
          <el-option label="正常" value="active" />
          <el-option label="冻结" value="frozen" />
        </el-select>
        <el-select v-model="vipFilter" placeholder="VIP等级" style="width: 120px;" clearable aria-label="筛选VIP等级">
          <el-option v-for="i in 9" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" />
        </el-select>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-table">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredMembers.length" class="empty-state">
        <el-empty description="暂无会员数据">
          <template #image>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </template>
        </el-empty>
      </div>

      <el-table v-else :data="paginatedMembers" stripe v-loading="loading">
        <el-table-column prop="id" label="会员ID" width="90" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="agent" label="所属代理" width="110" />
        <el-table-column label="VIP" width="70">
          <template #default="{ row }"><el-tag size="small" type="warning">V{{ row.vip }}</el-tag></template>
        </el-table-column>
        <el-table-column label="余额" width="120" sortable sort-by="balance">
          <template #default="{ row }">¥{{ row.balance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="总充值" width="120">
          <template #default="{ row }">¥{{ (row.totalDeposit / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="总提现" width="120">
          <template #default="{ row }">¥{{ (row.totalWithdraw / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="标签" width="140">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" :type="tagType(tag)" style="margin-right: 4px;">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>详情</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleFreeze(row)">
              {{ row.status === 'active' ? '冻结' : '解冻' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredMembers.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMembers, memberAction } from '@/api/members'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const agentFilter = ref('')
const statusFilter = ref('')
const vipFilter = ref('')
const members = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
  try {
    loading.value = true
    const data = await getMembers()
    members.value = data || []
  } catch (e) { console.warn('API request failed', e) } finally {
    loading.value = false
  }
})
const agents = ['金沙娱乐', '皇冠体育', '新濠天地', '永利娱乐', '澳门威尼斯']

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    if (search.value && !m.username.includes(search.value)) return false
    if (agentFilter.value && m.agent !== agentFilter.value) return false
    if (statusFilter.value && m.status !== statusFilter.value) return false
    if (vipFilter.value !== '' && m.vip !== vipFilter.value) return false
    return true
  })
})

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMembers.value.slice(start, start + pageSize.value)
})

function tagType(tag) {
  if (tag === '高价值' || tag === 'VIP') return 'warning'
  if (tag === '风险') return 'danger'
  if (tag === '活跃') return 'success'
  return 'info'
}

function toggleFreeze(row) {
  const action = row.status === 'active' ? '冻结' : '解冻'
  ElMessageBox.confirm(`确定要${action}会员 ${row.username} 吗?`, '确认', { type: 'warning' }).then(async () => {
    try {
      await memberAction(row.id, row.status === 'active' ? 'freeze' : 'unfreeze')
      row.status = row.status === 'active' ? 'frozen' : 'active'
      ElMessage.success(`已${action} ${row.username}`)
    } catch (e) {
      ElMessage.error(`${action}失败: ${e.message || '未知错误'}`)
    }
  }).catch(() => {})
}
</script>
