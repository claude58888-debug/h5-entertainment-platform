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

      <el-table v-else :data="paginatedMembers" stripe v-loading="loading" @row-click="openDetail">
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
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click.stop="openDetail(row)">详情</el-button>
            <el-button size="small" type="warning" text @click.stop="openBalanceDialog(row)">调额</el-button>
            <el-button size="small" type="info" text @click.stop="handleForceLogout(row)">下线</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click.stop="toggleFreeze(row)">
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

    <!-- Member Detail Dialog -->
    <el-dialog v-model="detailVisible" :title="'会员详情 - ' + (detailData.username || '')" width="800px" destroy-on-close>
      <div v-loading="detailLoading">
        <!-- Basic Info Summary -->
        <div class="detail-summary">
          <div class="detail-summary-item">
            <span class="detail-label">会员ID</span>
            <span class="detail-value">{{ detailData.id }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">用户名</span>
            <span class="detail-value">{{ detailData.username }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">所属代理</span>
            <span class="detail-value">{{ detailData.agent || '-' }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">VIP等级</span>
            <span class="detail-value">
              <el-select v-model="detailVipLevel" size="small" style="width: 100px;" @change="handleVipChange">
                <el-option v-for="i in 10" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" />
              </el-select>
            </span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">余额</span>
            <span class="detail-value" style="color: #409eff;">¥{{ (detailData.balance || 0).toLocaleString() }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">状态</span>
            <span class="detail-value">
              <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'" size="small">
                {{ detailData.status === 'active' ? '正常' : '冻结' }}
              </el-tag>
            </span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">注册时间</span>
            <span class="detail-value">{{ detailData.registered || '-' }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">最后登录</span>
            <span class="detail-value">{{ detailData.lastLogin || '-' }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">总充值</span>
            <span class="detail-value">¥{{ ((detailData.totalDeposit || 0) / 10000).toFixed(1) }}万</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">总提现</span>
            <span class="detail-value">¥{{ ((detailData.totalWithdraw || 0) / 10000).toFixed(1) }}万</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">总投注次数</span>
            <span class="detail-value">{{ detailData.betStats?.totalBets || 0 }}</span>
          </div>
          <div class="detail-summary-item">
            <span class="detail-label">总投注金额</span>
            <span class="detail-value">¥{{ ((detailData.betStats?.totalBetAmount || 0) / 10000).toFixed(1) }}万</span>
          </div>
        </div>

        <!-- Tags -->
        <div class="detail-tags-section">
          <span class="detail-label" style="margin-right: 8px;">标签:</span>
          <el-tag
            v-for="tag in detailTags"
            :key="tag"
            closable
            size="small"
            :type="tagType(tag)"
            style="margin-right: 6px;"
            @close="removeTag(tag)"
          >{{ tag }}</el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            size="small"
            style="width: 100px;"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
        </div>

        <!-- Tabs -->
        <el-tabs v-model="detailTab" style="margin-top: 16px;">
          <el-tab-pane label="基本信息" name="basic">
            <div class="detail-info-grid">
              <div v-for="device in (detailData.devices || [])" :key="device.id" class="device-item">
                <el-tag size="small" type="info">设备</el-tag>
                <span>{{ device.fingerprint || device.device_info || '未知设备' }}</span>
              </div>
              <div v-if="!(detailData.devices || []).length" style="color: #999;">暂无设备信息</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="投注记录" name="bets">
            <el-table :data="detailData.bets || []" stripe max-height="400" size="small">
              <el-table-column prop="id" label="注单ID" width="100" />
              <el-table-column prop="game" label="游戏" width="120" />
              <el-table-column prop="provider" label="供应商" width="100" />
              <el-table-column label="投注额" width="100">
                <template #default="{ row }">¥{{ (row.betAmount || 0).toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="中奖额" width="100">
                <template #default="{ row }">¥{{ (row.winAmount || 0).toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80" />
              <el-table-column prop="time" label="时间" width="160" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="交易记录" name="transactions">
            <el-table :data="allTransactions" stripe max-height="400" size="small">
              <el-table-column prop="id" label="订单ID" width="100" />
              <el-table-column label="类型" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'deposit' || row.type === 'admin_deposit' ? 'success' : 'danger'" size="small">
                    {{ txTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="120">
                <template #default="{ row }">¥{{ (row.amount || 0).toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="channel" label="渠道" width="100" />
              <el-table-column prop="status" label="状态" width="80" />
              <el-table-column label="时间" width="160">
                <template #default="{ row }">{{ row.time || row.created_at }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- Balance Adjustment Dialog -->
    <el-dialog v-model="balanceDialogVisible" title="余额调整" width="450px" destroy-on-close>
      <el-form :model="balanceForm" label-width="80px">
        <el-form-item label="会员">
          <span>{{ balanceForm.username }} ({{ balanceForm.memberId }})</span>
        </el-form-item>
        <el-form-item label="当前余额">
          <span style="color: #409eff;">¥{{ (balanceForm.currentBalance || 0).toLocaleString() }}</span>
        </el-form-item>
        <el-form-item label="操作类型" required>
          <el-radio-group v-model="balanceForm.type">
            <el-radio label="deposit">充值 (+)</el-radio>
            <el-radio label="deduction">扣减 (-)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="balanceForm.amount" :min="0.01" :precision="2" :step="100" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="balanceForm.reason" type="textarea" :rows="2" placeholder="请输入调整原因（必填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="balanceSubmitting" @click="submitBalanceAdjust">确认调整</el-button>
      </template>
    </el-dialog>

    <!-- VIP Adjustment Reason Dialog -->
    <el-dialog v-model="vipReasonVisible" title="VIP等级调整" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="原等级">VIP{{ vipChangeData.oldLevel }}</el-form-item>
        <el-form-item label="新等级">VIP{{ vipChangeData.newLevel }}</el-form-item>
        <el-form-item label="调整原因">
          <el-input v-model="vipChangeData.reason" type="textarea" :rows="2" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelVipChange">取消</el-button>
        <el-button type="primary" :loading="vipSubmitting" @click="submitVipChange">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getMembers, getMemberDetail, memberAction, updateMemberVip, updateMemberTags, forceLogoutMember, adjustMemberBalance } from '@/api/members'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const agentFilter = ref('')
const statusFilter = ref('')
const vipFilter = ref('')
const members = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

// Detail dialog
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref({})
const detailTab = ref('basic')
const detailVipLevel = ref(0)

// Tags
const detailTags = ref([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

// VIP change
const vipReasonVisible = ref(false)
const vipSubmitting = ref(false)
const vipChangeData = ref({ oldLevel: 0, newLevel: 0, reason: '' })

// Balance adjustment
const balanceDialogVisible = ref(false)
const balanceSubmitting = ref(false)
const balanceForm = ref({ memberId: '', username: '', currentBalance: 0, type: 'deposit', amount: 100, reason: '' })

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

const allTransactions = computed(() => {
  const txs = [...(detailData.value.transactions || []), ...(detailData.value.h5Transactions || [])]
  return txs.sort((a, b) => ((b.time || b.created_at) || '').localeCompare((a.time || a.created_at) || ''))
})

function tagType(tag) {
  if (tag === '高价值' || tag === 'VIP') return 'warning'
  if (tag === '风险') return 'danger'
  if (tag === '活跃') return 'success'
  return 'info'
}

function txTypeLabel(type) {
  const map = { deposit: '充值', withdrawal: '提现', admin_deposit: '手动充值', admin_deduction: '手动扣减' }
  return map[type] || type
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

// Member Detail
async function openDetail(row) {
  detailVisible.value = true
  detailLoading.value = true
  detailTab.value = 'basic'
  try {
    const data = await getMemberDetail(row.id)
    detailData.value = data
    detailVipLevel.value = data.vip || 0
    detailTags.value = [...(data.tags || [])]
  } catch (e) {
    ElMessage.error('获取会员详情失败')
    console.warn(e)
  } finally {
    detailLoading.value = false
  }
}

// VIP adjustment
function handleVipChange(newLevel) {
  vipChangeData.value = {
    oldLevel: detailData.value.vip || 0,
    newLevel,
    reason: ''
  }
  vipReasonVisible.value = true
}

function cancelVipChange() {
  detailVipLevel.value = detailData.value.vip || 0
  vipReasonVisible.value = false
}

async function submitVipChange() {
  vipSubmitting.value = true
  try {
    await updateMemberVip(detailData.value.id, vipChangeData.value.newLevel, vipChangeData.value.reason)
    detailData.value.vip = vipChangeData.value.newLevel
    // Update in list too
    const m = members.value.find(m => m.id === detailData.value.id)
    if (m) m.vip = vipChangeData.value.newLevel
    ElMessage.success('VIP等级已更新')
    vipReasonVisible.value = false
  } catch (e) {
    ElMessage.error('VIP调整失败: ' + (e.message || '未知错误'))
    detailVipLevel.value = detailData.value.vip || 0
  } finally {
    vipSubmitting.value = false
  }
}

// Tags
function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

async function addTag() {
  const val = tagInputValue.value.trim()
  if (val && !detailTags.value.includes(val)) {
    const newTags = [...detailTags.value, val]
    try {
      await updateMemberTags(detailData.value.id, newTags)
      detailTags.value = newTags
      detailData.value.tags = newTags
      const m = members.value.find(m => m.id === detailData.value.id)
      if (m) m.tags = [...newTags]
      ElMessage.success('标签已添加')
    } catch (e) {
      ElMessage.error('添加标签失败')
    }
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

async function removeTag(tag) {
  const newTags = detailTags.value.filter(t => t !== tag)
  try {
    await updateMemberTags(detailData.value.id, newTags)
    detailTags.value = newTags
    detailData.value.tags = newTags
    const m = members.value.find(m => m.id === detailData.value.id)
    if (m) m.tags = [...newTags]
  } catch (e) {
    ElMessage.error('删除标签失败')
  }
}

// Force logout
function handleForceLogout(row) {
  ElMessageBox.confirm(`确定要强制下线会员 ${row.username} 吗?`, '强制下线', { type: 'warning' }).then(async () => {
    try {
      await forceLogoutMember(row.id)
      ElMessage.success(`已强制下线 ${row.username}`)
    } catch (e) {
      ElMessage.error('强制下线失败: ' + (e.message || '未知错误'))
    }
  }).catch(() => {})
}

// Balance adjustment
function openBalanceDialog(row) {
  balanceForm.value = {
    memberId: row.id,
    username: row.username,
    currentBalance: row.balance,
    type: 'deposit',
    amount: 100,
    reason: ''
  }
  balanceDialogVisible.value = true
}

async function submitBalanceAdjust() {
  if (!balanceForm.value.reason) {
    ElMessage.warning('请输入调整原因')
    return
  }
  balanceSubmitting.value = true
  try {
    const res = await adjustMemberBalance(
      balanceForm.value.memberId,
      balanceForm.value.amount,
      balanceForm.value.type,
      balanceForm.value.reason
    )
    // Update local data
    const m = members.value.find(m => m.id === balanceForm.value.memberId)
    if (m) m.balance = res.newBalance
    if (detailData.value.id === balanceForm.value.memberId) {
      detailData.value.balance = res.newBalance
    }
    ElMessage.success(`余额已调整: ¥${res.oldBalance} → ¥${res.newBalance}`)
    balanceDialogVisible.value = false
  } catch (e) {
    ElMessage.error('余额调整失败: ' + (e.error || e.message || '未知错误'))
  } finally {
    balanceSubmitting.value = false
  }
}
</script>

<style scoped>
.detail-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.detail-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 12px;
  color: #909399;
}
.detail-value {
  font-size: 14px;
  color: #e0e0e0;
}
.detail-tags-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid #2a2a3e;
  border-bottom: 1px solid #2a2a3e;
}
.detail-info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.device-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
