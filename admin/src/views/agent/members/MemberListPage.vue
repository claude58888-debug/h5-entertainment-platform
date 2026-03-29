<template>
  <div>
    <h2 class="section-title">会员管理</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索用户名/手机号" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="正常" value="active" /><el-option label="冻结" value="frozen" />
        </el-select>
        <el-select v-model="vipFilter" placeholder="VIP等级" style="width: 120px;" clearable>
          <el-option v-for="i in 9" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" />
        </el-select>
        <el-select v-model="tagFilter" placeholder="标签" style="width: 120px;" clearable>
          <el-option label="高价值" value="高价值" /><el-option label="风险" value="风险" /><el-option label="活跃" value="活跃" /><el-option label="流失" value="流失" />
        </el-select>
        <el-button type="primary" plain>批量操作</el-button>
      </div>
      <el-table :data="filteredMembers" stripe @selection-change="handleSelection">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="会员ID" width="90" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column label="VIP" width="70">
          <template #default="{ row }"><el-tag size="small" type="warning">V{{ row.vip }}</el-tag></template>
        </el-table-column>
        <el-table-column label="余额" width="120" sortable sort-by="balance">
          <template #default="{ row }">¥{{ row.balance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="总充值" width="120">
          <template #default="{ row }">¥{{ (row.totalDeposit / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="标签" width="140">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" :type="tagType(tag)" style="margin-right: 4px;">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '正常' : '冻结' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="$router.push('/agent/members/' + row.id)">详情</el-button>
            <el-button size="small" type="warning" text @click="adjustBalance(row)">调额</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleFreeze(row)">
              {{ row.status === 'active' ? '冻结' : '解冻' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredMembers.length" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMembers } from '@/api/members'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const vipFilter = ref('')
const tagFilter = ref('')
const selectedMembers = ref([])
const members = ref(membersList.filter(m => m.agent === '金沙娱乐'))

onMounted(async () => {
  try {
    const data = await getMembers()
    members.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredMembers = computed(() => members.value.filter(m => {
  if (search.value && !m.username.includes(search.value)) return false
  if (statusFilter.value && m.status !== statusFilter.value) return false
  if (vipFilter.value !== '' && m.vip !== vipFilter.value) return false
  if (tagFilter.value && !(m.tags || []).includes(tagFilter.value)) return false
  return true
}))

function tagType(tag) {
  return { '高价值': 'warning', '风险': 'danger', '活跃': 'success', '流失': 'info', 'VIP': 'warning' }[tag] || 'info'
}
function handleSelection(val) { selectedMembers.value = val }
function toggleFreeze(row) {
  const action = row.status === 'active' ? '冻结' : '解冻'
  ElMessageBox.confirm(`确定${action} ${row.username}?`, '确认', { type: 'warning' }).then(() => {
    row.status = row.status === 'active' ? 'frozen' : 'active'
    ElMessage.success(`已${action}`)
  }).catch(() => {})
}
function adjustBalance(row) {
  ElMessageBox.prompt('请输入调整金额 (正数加款, 负数扣款)', '余额调整', {
    inputPattern: /^-?\d+$/,
    inputErrorMessage: '请输入有效数字'
  }).then(({ value }) => {
    row.balance += parseInt(value)
    ElMessage.success(`余额已调整 ${value > 0 ? '+' : ''}${value}`)
  }).catch(() => {})
}
</script>
