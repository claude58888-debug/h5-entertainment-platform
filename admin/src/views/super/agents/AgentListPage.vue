<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">代理管理</h2>
      <div class="header-actions">
        <el-button type="info" plain @click="showHierarchy = true">
          <el-icon><Connection /></el-icon>代理层级
        </el-button>
        <el-button type="primary" @click="$router.push('/super/agents/create')">
          <el-icon><Plus /></el-icon>创建代理
        </el-button>
      </div>
    </div>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索代理ID/名称/域名" style="width: 260px;" clearable prefix-icon="Search" />
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="正常" value="active" />
          <el-option label="暂停" value="suspended" />
          <el-option label="封禁" value="banned" />
        </el-select>
        <el-select v-model="commissionFilter" placeholder="佣金等级" style="width: 130px;" clearable>
          <el-option label="S级" value="S" />
          <el-option label="A级" value="A" />
          <el-option label="B级" value="B" />
          <el-option label="C级" value="C" />
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
        <el-table-column label="下级代理" width="90">
          <template #default="{ row }"><span>{{ (row.sub_agents || []).length }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="90" sortable sort-by="status">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" sortable>
          <template #default="{ row }">{{ row.created_at || row.created || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="showAgentDetail(row)">快览</el-button>
            <el-button size="small" type="primary" text @click="$router.push('/super/agents/' + row.id)">详情</el-button>
            <el-button size="small" type="info" text @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" text @click="handleTopup(row)">充值</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
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
            <el-descriptions-item label="联系电话">{{ detailAgent.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="上级代理">{{ detailAgent.parent_agent || '无 (顶级代理)' }}</el-descriptions-item>
            <el-descriptions-item label="佣金等级">
              <el-tag v-if="detailAgent.commission_level" size="small" :type="commissionLevelType(detailAgent.commission_level)">{{ commissionLevelLabel(detailAgent.commission_level) }}</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType(detailAgent.status)" size="small">{{ statusLabel(detailAgent.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="会员数">{{ detailAgent.members }}</el-descriptions-item>
            <el-descriptions-item label="下级代理数">{{ (detailAgent.sub_agents || []).length }}</el-descriptions-item>
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
          <el-form :model="commissionForm" label-width="120px" style="max-width: 500px;">
            <el-form-item label="分成模式">
              <el-radio-group v-model="commissionForm.shareMode">
                <el-radio value="revenue">收入分成</el-radio>
                <el-radio value="turnover">流水分成</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="分成比例">
              <el-slider v-model="commissionForm.shareRate" :min="5" :max="60" show-input :format-tooltip="v => v + '%'" />
            </el-form-item>
            <el-form-item label="佣金等级">
              <el-select v-model="commissionForm.commission_level" style="width: 150px;">
                <el-option label="S级 (顶级)" value="S" />
                <el-option label="A级 (高级)" value="A" />
                <el-option label="B级 (中级)" value="B" />
                <el-option label="C级 (初级)" value="C" />
              </el-select>
            </el-form-item>
            <el-divider>返水比例配置</el-divider>
            <el-form-item label="电子游戏返水">
              <el-input-number v-model="commissionForm.rebate_slots" :min="0" :max="5" :step="0.1" :precision="1" /> %
            </el-form-item>
            <el-form-item label="真人视讯返水">
              <el-input-number v-model="commissionForm.rebate_live" :min="0" :max="5" :step="0.1" :precision="1" /> %
            </el-form-item>
            <el-form-item label="体育竞猜返水">
              <el-input-number v-model="commissionForm.rebate_sports" :min="0" :max="5" :step="0.1" :precision="1" /> %
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveCommissionSettings">保存佣金配置</el-button>
            </el-form-item>
          </el-form>
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

    <!-- Edit Agent Dialog -->
    <el-dialog v-model="editVisible" title="编辑代理" width="550px" destroy-on-close>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="代理ID"><span style="color: #909399;">{{ editForm.id }}</span></el-form-item>
        <el-form-item label="品牌名称"><el-input v-model="editForm.brand" /></el-form-item>
        <el-form-item label="域名"><el-input v-model="editForm.domain" /></el-form-item>
        <el-form-item label="联系人"><el-input v-model="editForm.contact" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item label="上级代理">
          <el-select v-model="editForm.parent_id" clearable placeholder="无 (顶级代理)" style="width: 100%;">
            <el-option v-for="a in agents.filter(x => x.id !== editForm.id)" :key="a.id" :label="a.brand + ' (' + a.id + ')'" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width: 160px;">
            <el-option label="正常" value="active" />
            <el-option label="暂停" value="suspended" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- Hierarchy Tree Dialog -->
    <el-dialog v-model="showHierarchy" title="代理层级结构" width="650px" destroy-on-close>
      <div class="hierarchy-tree">
        <el-tree :data="hierarchyData" :props="{ children: 'children', label: 'label' }" default-expand-all :expand-on-click-node="false">
          <template #default="{ data }">
            <div class="tree-node">
              <span class="tree-node-label">{{ data.label }}</span>
              <el-tag :type="statusTagType(data.status)" size="small" style="margin-left: 8px;">{{ statusLabel(data.status) }}</el-tag>
              <span class="tree-node-meta">会员: {{ data.members }} | 月收入: ¥{{ ((data.monthRevenue || 0) / 10000).toFixed(1) }}万</span>
            </div>
          </template>
        </el-tree>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAgents, getAgent, updateAgent, getAgentSettlements } from '@/api/agents'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const statusFilter = ref('')
const commissionFilter = ref('')
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
const editVisible = ref(false)
const editForm = ref({})
const showHierarchy = ref(false)
const commissionForm = ref({ shareMode: 'revenue', shareRate: 40, commission_level: 'B', rebate_slots: 1.0, rebate_live: 0.6, rebate_sports: 0.4 })

onMounted(async () => {
  try {
    const data = await getAgents()
    agents.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})

const filteredAgents = computed(() => {
  return agents.value.filter(a => {
    if (search.value) {
      const s = search.value.toLowerCase()
      if (!a.brand.toLowerCase().includes(s) && !(a.domain || '').toLowerCase().includes(s) && !(a.id || '').toLowerCase().includes(s)) return false
    }
    if (statusFilter.value && a.status !== statusFilter.value) return false
    if (commissionFilter.value && a.commission_level !== commissionFilter.value) return false
    return true
  })
})

const hierarchyData = computed(() => {
  const agentMap = {}
  agents.value.forEach(a => { agentMap[a.id] = { ...a, label: a.brand + ' (' + a.id + ')', children: [] } })
  const roots = []
  agents.value.forEach(a => {
    const node = agentMap[a.id]
    if (a.parent_id && agentMap[a.parent_id]) { agentMap[a.parent_id].children.push(node) } else { roots.push(node) }
  })
  return roots
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

function statusTagType(status) { return status === 'active' ? 'success' : status === 'suspended' ? 'warning' : 'danger' }
function statusLabel(status) { return status === 'active' ? '正常' : status === 'suspended' ? '暂停' : '封禁' }

function toggleStatus(row) {
  if (row.status === 'active') {
    ElMessageBox.confirm(`确定要禁用代理 ${row.brand} 吗？`, '禁用代理', { distinguishCancelAndClose: true, confirmButtonText: '暂停', cancelButtonText: '封禁', type: 'warning' })
      .then(() => { row.status = 'suspended'; ElMessage.success(`已暂停 ${row.brand}`) })
      .catch((action) => { if (action === 'cancel') { row.status = 'banned'; ElMessage.success(`已封禁 ${row.brand}`) } })
  } else {
    ElMessageBox.confirm(`确定要启用代理 ${row.brand} 吗?`, '确认', { type: 'warning' }).then(() => { row.status = 'active'; ElMessage.success(`已启用 ${row.brand}`) }).catch(() => {})
  }
}

function openEditDialog(row) {
  editForm.value = { id: row.id, brand: row.brand, domain: row.domain, contact: row.contact, phone: row.phone || '', parent_id: row.parent_id || '', status: row.status, _ref: row }
  editVisible.value = true
}

function saveEdit() {
  const row = editForm.value._ref
  row.brand = editForm.value.brand; row.domain = editForm.value.domain; row.contact = editForm.value.contact
  row.phone = editForm.value.phone; row.parent_id = editForm.value.parent_id; row.status = editForm.value.status
  const parent = agents.value.find(a => a.id === editForm.value.parent_id)
  row.parent_agent = parent ? parent.brand : null
  editVisible.value = false; ElMessage.success('代理信息已更新')
}

async function showAgentDetail(row) {
  detailTab.value = 'info'; detailAgent.value = row; detailMembers.value = []; detailSettlements.value = []
  commissionForm.value = { shareMode: row.shareMode || 'revenue', shareRate: row.shareRate || 40, commission_level: row.commission_level || 'B', rebate_slots: row.rebate_slots || 1.0, rebate_live: row.rebate_live || 0.6, rebate_sports: row.rebate_sports || 0.4 }
  detailVisible.value = true
  try { const data = await getAgent(row.id); if (data) { detailAgent.value = { ...row, ...data }; detailMembers.value = data.membersList || [] } } catch (e) { console.warn(e) }
  try { const s = await getAgentSettlements({ agentId: row.id }); detailSettlements.value = (s || []).filter(x => x.agent_id === row.id) } catch (e) { console.warn(e) }
}

function saveCommissionSettings() {
  detailAgent.value.shareMode = commissionForm.value.shareMode
  detailAgent.value.shareRate = commissionForm.value.shareRate
  detailAgent.value.commission_level = commissionForm.value.commission_level
  detailAgent.value.rebate_slots = commissionForm.value.rebate_slots
  detailAgent.value.rebate_live = commissionForm.value.rebate_live
  detailAgent.value.rebate_sports = commissionForm.value.rebate_sports
  ElMessage.success('佣金配置已保存')
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
.hierarchy-tree { max-height: 500px; overflow-y: auto; }
.tree-node { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
.tree-node-label { font-weight: 600; color: #e0e0e0; }
.tree-node-meta { font-size: 12px; color: #909399; margin-left: 12px; }
</style>
