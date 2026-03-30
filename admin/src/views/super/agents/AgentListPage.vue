<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">代理管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/super/agents/create')">
          <el-icon><Plus /></el-icon>创建代理
        </el-button>
      </div>
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

      <!-- Batch operations toolbar -->
      <div v-if="selectedAgents.length" class="batch-toolbar">
        <span class="batch-info">已选择 {{ selectedAgents.length }} 个代理</span>
        <el-button size="small" type="success" @click="batchEnable">批量启用</el-button>
        <el-button size="small" type="warning" @click="batchDisable">批量暂停</el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="paginatedAgents"
        stripe
        @selection-change="handleSelectionChange"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="代理ID" width="90" sortable />
        <el-table-column prop="brand" label="品牌名称" width="120" sortable />
        <el-table-column prop="domain" label="域名" width="150" sortable />
        <el-table-column prop="contact" label="联系人" width="110" sortable />
        <el-table-column prop="parent_agent" label="上级代理" width="120" sortable>
          <template #default="{ row }">
            <span>{{ row.parent_agent || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commission_level" label="佣金等级" width="110" sortable>
          <template #default="{ row }">
            <el-tag v-if="row.commission_level" size="small" :type="commissionLevelType(row.commission_level)">
              {{ commissionLevelLabel(row.commission_level) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="members" label="会员数" width="90" sortable />
        <el-table-column label="余额" width="120" sortable sort-by="balance">
          <template #default="{ row }">¥{{ row.balance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="月收入" width="130" sortable sort-by="monthRevenue">
          <template #default="{ row }">¥{{ (row.monthRevenue / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="分成" width="100" sortable sort-by="shareRate">
          <template #default="{ row }">
            <el-tag size="small">{{ row.shareMode === 'revenue' ? '收入' : '流水' }} {{ row.shareRate }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" sortable sort-by="status">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'suspended' ? 'warning' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : row.status === 'suspended' ? '暂停' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" sortable>
          <template #default="{ row }">{{ row.created_at || row.created || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="showAgentDetail(row)">快览</el-button>
            <el-button size="small" type="primary" text @click="$router.push('/super/agents/' + row.id)">详情</el-button>
            <el-button size="small" type="warning" text @click="handleTopup(row)">充值</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleStatus(row)">
              {{ row.status === 'active' ? '暂停' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="filteredAgents.length"
        />
      </div>
    </div>

    <!-- Agent Details Modal -->
    <el-dialog v-model="detailVisible" :title="'代理详情 - ' + (detailAgent.brand || '')" width="720px" destroy-on-close>
      <el-tabs v-model="detailTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="代理ID">{{ detailAgent.id }}</el-descriptions-item>
            <el-descriptions-item label="品牌名称">{{ detailAgent.brand }}</el-descriptions-item>
            <el-descriptions-item label="域名">{{ detailAgent.domain || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ detailAgent.contact || '-' }}</el-descriptions-item>
            <el-descriptions-item label="上级代理">{{ detailAgent.parent_agent || '-' }}</el-descriptions-item>
            <el-descriptions-item label="佣金等级">
              <el-tag v-if="detailAgent.commission_level" size="small" :type="commissionLevelType(detailAgent.commission_level)">{{ commissionLevelLabel(detailAgent.commission_level) }}</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailAgent.status === 'active' ? 'success' : 'danger'" size="small">{{ detailAgent.status === 'active' ? '正常' : '暂停' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="会员数">{{ detailAgent.members }}</el-descriptions-item>
            <el-descriptions-item label="余额">¥{{ (detailAgent.balance || 0).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="月收入">¥{{ ((detailAgent.monthRevenue || 0) / 10000).toFixed(1) }}万</el-descriptions-item>
            <el-descriptions-item label="分成模式">
              <el-tag size="small">{{ detailAgent.shareMode === 'revenue' ? '收入分成' : '流水分成' }} {{ detailAgent.shareRate }}%</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailAgent.created_at || detailAgent.created || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="下属会员" name="members">
          <el-table :data="detailMembers" stripe size="small" max-height="360">
            <el-table-column prop="id" label="会员ID" width="90" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column label="VIP" width="60">
              <template #default="{ row }"><el-tag size="small" type="warning">V{{ row.vip }}</el-tag></template>
            </el-table-column>
            <el-table-column label="余额" width="100">
              <template #default="{ row }">¥{{ (row.balance || 0).toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="总充值" width="110">
              <template #default="{ row }">¥{{ ((row.totalDeposit || 0) / 10000).toFixed(1) }}万</template>
            </el-table-column>
            <el-table-column label="总提现" width="110">
              <template #default="{ row }">¥{{ ((row.totalWithdraw || 0) / 10000).toFixed(1) }}万</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '正常' : '冻结' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!detailMembers.length" style="text-align: center; padding: 20px; color: #888;">暂无下属会员</div>
        </el-tab-pane>

        <el-tab-pane label="佣金配置" name="commission">
          <el-descriptions :column="1" border size="small" style="max-width: 400px;">
            <el-descriptions-item label="分成模式">{{ detailAgent.shareMode === 'revenue' ? '收入分成' : '流水分成' }}</el-descriptions-item>
            <el-descriptions-item label="分成比例">{{ detailAgent.shareRate || 0 }}%</el-descriptions-item>
            <el-descriptions-item label="佣金等级">{{ commissionLevelLabel(detailAgent.commission_level) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="月收入">¥{{ ((detailAgent.monthRevenue || 0) / 10000).toFixed(1) }}万</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="结算记录" name="settlement">
          <el-table :data="detailSettlements" stripe size="small" max-height="360">
            <el-table-column prop="id" label="结算ID" width="100" />
            <el-table-column prop="agent_id" label="代理" width="90" />
            <el-table-column prop="period" label="结算周期" width="200" />
            <el-table-column label="总投注" width="120">
              <template #default="{ row }">¥{{ (row.totalBets || 0).toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="佣金率" width="80">
              <template #default="{ row }">{{ row.commissionRate || 0 }}%</template>
            </el-table-column>
            <el-table-column label="佣金金额" width="120">
              <template #default="{ row }"><span style="color: #e6a23c;">¥{{ (row.commissionAmount || 0).toLocaleString() }}</span></template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'approved' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'paid' ? '已付款' : row.status === 'approved' ? '已审批' : '待审批' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!detailSettlements.length" style="text-align: center; padding: 20px; color: #888;">暂无结算记录</div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAgents, getAgent, updateAgent, getAgentSettlements } from '@/api/agents'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const agents = ref([])
const selectedAgents = ref([])
const tableRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detailTab = ref('info')
const detailAgent = ref({})
const detailMembers = ref([])
const detailSettlements = ref([])

onMounted(async () => {
  try {
    const data = await getAgents()
    agents.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredAgents = computed(() => {
  return agents.value.filter(a => {
    if (search.value && !a.brand.includes(search.value) && !(a.domain || '').includes(search.value)) return false
    if (statusFilter.value && a.status !== statusFilter.value) return false
    return true
  })
})

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAgents.value.slice(start, start + pageSize.value)
})

function commissionLevelLabel(level) {
  const map = { A: 'A级', B: 'B级', C: 'C级', S: 'S级' }
  return map[level] || level
}

function commissionLevelType(level) {
  const map = { S: 'danger', A: 'warning', B: '', C: 'info' }
  return map[level] || ''
}

function handleSelectionChange(rows) {
  selectedAgents.value = rows
}

function clearSelection() {
  tableRef.value?.clearSelection()
}

function batchEnable() {
  const names = selectedAgents.value.map(a => a.brand).join('、')
  ElMessageBox.confirm(`确定要批量启用以下代理吗？\n${names}`, '批量启用', { type: 'warning' }).then(async () => {
    let successCount = 0
    for (const agent of selectedAgents.value) {
      if (agent.status !== 'active') {
        try {
          await updateAgent(agent.id, { status: 'active' })
          agent.status = 'active'
          successCount++
        } catch (e) {
          console.warn(`启用代理 ${agent.brand} 失败`, e)
        }
      }
    }
    ElMessage.success(`已成功启用 ${successCount} 个代理`)
    clearSelection()
  }).catch(() => {})
}

function batchDisable() {
  const names = selectedAgents.value.map(a => a.brand).join('、')
  ElMessageBox.confirm(`确定要批量暂停以下代理吗？\n${names}`, '批量暂停', { type: 'warning' }).then(async () => {
    let successCount = 0
    for (const agent of selectedAgents.value) {
      if (agent.status === 'active') {
        try {
          await updateAgent(agent.id, { status: 'suspended' })
          agent.status = 'suspended'
          successCount++
        } catch (e) {
          console.warn(`暂停代理 ${agent.brand} 失败`, e)
        }
      }
    }
    ElMessage.success(`已成功暂停 ${successCount} 个代理`)
    clearSelection()
  }).catch(() => {})
}

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

function commissionLevelType(level) {
  const map = { gold: 'warning', silver: '', bronze: 'info', diamond: 'danger' }
  return map[level] || ''
}

function commissionLevelLabel(level) {
  const map = { gold: '金牌', silver: '银牌', bronze: '铜牌', diamond: '钻石' }
  return map[level] || level || '-'
}

async function showAgentDetail(row) {
  detailTab.value = 'info'
  detailAgent.value = row
  detailMembers.value = []
  detailSettlements.value = []
  detailVisible.value = true
  try {
    const data = await getAgent(row.id)
    if (data) {
      detailAgent.value = { ...row, ...data }
      detailMembers.value = data.membersList || []
    }
  } catch (e) { console.warn('Failed to fetch agent details', e) }
  try {
    const settlements = await getAgentSettlements({ agentId: row.id })
    detailSettlements.value = (settlements || []).filter(s => s.agent_id === row.id)
  } catch (e) { console.warn('Failed to fetch settlements', e) }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}
.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 6px;
}
.batch-info {
  font-size: 14px;
  color: #409eff;
  margin-right: 8px;
}
</style>
