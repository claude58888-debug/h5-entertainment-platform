<template>
  <div>
    <h2 class="section-title">会员管理 (全平台)</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索用户名/手机号/ID" style="width: 220px;" clearable prefix-icon="Search" aria-label="搜索用户名/手机号/ID" />
        <el-select v-model="agentFilter" placeholder="所属代理" style="width: 140px;" clearable aria-label="筛选代理">
          <el-option v-for="a in agents" :key="a" :label="a" :value="a" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable aria-label="筛选状态">
          <el-option label="正常" value="active" />
          <el-option label="冻结" value="frozen" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-select v-model="vipFilter" placeholder="VIP等级" style="width: 120px;" clearable aria-label="筛选VIP等级">
          <el-option v-for="i in 9" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" />
        </el-select>
      </div>

      <!-- Advanced search filters -->
      <div class="advanced-filter-bar">
        <el-date-picker
          v-model="registerDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="注册开始日期"
          end-placeholder="注册结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 280px;"
          clearable
        />
        <div class="balance-range-filter">
          <span class="filter-label">余额:</span>
          <el-input-number v-model="balanceMin" :min="0" :precision="0" :step="1000" placeholder="最低" size="small" style="width: 120px;" controls-position="right" />
          <span class="filter-separator">-</span>
          <el-input-number v-model="balanceMax" :min="0" :precision="0" :step="1000" placeholder="最高" size="small" style="width: 120px;" controls-position="right" />
        </div>
        <el-button size="small" @click="resetAdvancedFilters">重置筛选</el-button>
      </div>

      <!-- Batch operations toolbar -->
      <div v-if="selectedMembers.length" class="batch-toolbar">
        <span class="batch-info">已选择 {{ selectedMembers.length }} 个会员</span>
        <el-button size="small" type="danger" @click="batchFreeze">批量冻结</el-button>
        <el-button size="small" type="success" @click="batchUnfreeze">批量解冻</el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
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

      <el-table v-else ref="tableRef" :data="paginatedMembers" stripe v-loading="loading" @row-click="openDetail" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="会员ID" width="90" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="phone" label="手机号" width="120" />
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
            <el-tag :type="memberStatusType(row.status)" size="small">{{ memberStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click.stop="openDetail(row)">详情</el-button>
            <el-button size="small" type="warning" text @click.stop="openBalanceDialog(row)">调额</el-button>
            <el-button size="small" type="info" text @click.stop="handleForceLogout(row)">下线</el-button>
            <el-button size="small" type="info" text @click.stop="openStatusDialog(row)">状态</el-button>
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

    <!-- Member Detail Drawer -->
    <el-drawer v-model="detailVisible" :title="'会员详情 - ' + (detailData.username || '')" size="720px" destroy-on-close>
      <div v-loading="detailLoading">
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

        <!-- Tabs: profile / transactions / login history -->
        <el-tabs v-model="detailTab" style="margin-top: 16px;">
          <el-tab-pane label="个人资料" name="profile">
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
                <span class="detail-label">手机号</span>
                <span class="detail-value">{{ detailData.phone || '-' }}</span>
              </div>
              <div class="detail-summary-item">
                <span class="detail-label">状态</span>
                <span class="detail-value">
                  <el-tag :type="memberStatusType(detailData.status)" size="small">{{ memberStatusLabel(detailData.status) }}</el-tag>
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

            <!-- VIP Progress -->
            <div v-if="detailData.vipProgress" class="vip-progress-section" style="margin-top: 16px;">
              <h4 style="margin-bottom: 8px; color: #e0e0e0;">VIP升级进度 (VIP{{ detailData.vipProgress.currentLevel }} → VIP{{ detailData.vipProgress.nextLevel }} {{ detailData.vipProgress.nextLevelName }})</h4>
              <div style="margin-bottom: 8px;">
                <span class="detail-label">充值进度: </span>
                <span class="detail-value">¥{{ (detailData.vipProgress.currentDeposit || 0).toLocaleString() }} / ¥{{ (detailData.vipProgress.depositNeeded || 0).toLocaleString() }}</span>
                <el-progress :percentage="Math.min(100, detailData.vipProgress.depositNeeded ? Math.round(detailData.vipProgress.currentDeposit / detailData.vipProgress.depositNeeded * 100) : 0)" :stroke-width="10" style="margin-top: 4px;" />
              </div>
              <div>
                <span class="detail-label">流水进度: </span>
                <span class="detail-value">¥{{ (detailData.vipProgress.currentWager || 0).toLocaleString() }} / ¥{{ (detailData.vipProgress.wagerNeeded || 0).toLocaleString() }}</span>
                <el-progress :percentage="Math.min(100, detailData.vipProgress.wagerNeeded ? Math.round(detailData.vipProgress.currentWager / detailData.vipProgress.wagerNeeded * 100) : 0)" :stroke-width="10" style="margin-top: 4px;" />
              </div>
            </div>

            <!-- Bank Cards -->
            <div style="margin-top: 16px;">
              <h4 style="margin-bottom: 8px; color: #e0e0e0;">银行卡</h4>
              <div v-if="(detailData.bankCards || []).length">
                <div v-for="card in detailData.bankCards" :key="card.id" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <el-tag size="small" type="info">{{ card.bank_name || '银行卡' }}</el-tag>
                  <span style="color: #e0e0e0;">{{ card.card_number || '-' }}</span>
                  <span style="color: #909399; font-size: 12px;">{{ card.holder_name || '' }}</span>
                </div>
              </div>
              <div v-else style="color: #999;">暂无银行卡信息</div>
            </div>

            <div class="detail-info-grid" style="margin-top: 16px;">
              <h4 style="margin-bottom: 8px; color: #e0e0e0;">设备信息</h4>
              <div v-for="device in (detailData.devices || [])" :key="device.id" class="device-item">
                <el-tag size="small" type="info">设备</el-tag>
                <span>{{ device.fingerprint || device.device_info || '未知设备' }}</span>
              </div>
              <div v-if="!(detailData.devices || []).length" style="color: #999;">暂无设备信息</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="交易记录" name="transactions">
            <el-table :data="allTransactions" stripe max-height="500" size="small">
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

            <h4 style="margin: 16px 0 8px; color: #e0e0e0;">投注记录</h4>
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

          <el-tab-pane label="登录历史" name="loginHistory">
            <el-table :data="detailData.loginHistory || []" stripe max-height="500" size="small">
              <el-table-column prop="time" label="登录时间" width="180" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="device" label="设备" width="160" />
              <el-table-column prop="location" label="地区" width="120" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!(detailData.loginHistory || []).length" style="color: #999; text-align: center; padding: 40px 0;">暂无登录历史记录</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

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

    <!-- Member Status Dialog -->
    <el-dialog v-model="statusDialogVisible" title="会员状态管理" width="450px" destroy-on-close>
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="会员">
          <span>{{ statusForm.username }} ({{ statusForm.memberId }})</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="memberStatusType(statusForm.currentStatus)" size="small">{{ memberStatusLabel(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item label="新状态" required>
          <el-radio-group v-model="statusForm.newStatus">
            <el-radio value="active">正常</el-radio>
            <el-radio value="frozen">冻结</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="statusForm.reason" type="textarea" :rows="2" placeholder="请输入状态变更原因（必填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusChange">确认变更</el-button>
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
const registerDateRange = ref(null)
const balanceMin = ref(undefined)
const balanceMax = ref(undefined)
const members = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedMembers = ref([])
const tableRef = ref(null)

// Detail dialog
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref({})
const detailTab = ref('profile')
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

// Status change
const statusDialogVisible = ref(false)
const statusForm = ref({ memberId: '', username: '', currentStatus: '', newStatus: '', reason: '' })

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

function memberStatusType(status) {
  return status === 'active' ? 'success' : status === 'frozen' ? 'warning' : 'danger'
}
function memberStatusLabel(status) {
  return status === 'active' ? '正常' : status === 'frozen' ? '冻结' : '禁用'
}

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    if (search.value) {
      const s = search.value.toLowerCase()
      if (!m.username.toLowerCase().includes(s) && !(m.phone || '').includes(search.value) && !(m.id || '').toLowerCase().includes(s)) return false
    }
    if (agentFilter.value && m.agent !== agentFilter.value) return false
    if (statusFilter.value && m.status !== statusFilter.value) return false
    if (vipFilter.value !== '' && m.vip !== vipFilter.value) return false
    if (registerDateRange.value && registerDateRange.value.length === 2) {
      const reg = m.registered || m.created_at || ''
      if (reg < registerDateRange.value[0] || reg > registerDateRange.value[1] + ' 23:59:59') return false
    }
    if (balanceMin.value !== undefined && balanceMin.value !== null && m.balance < balanceMin.value) return false
    if (balanceMax.value !== undefined && balanceMax.value !== null && m.balance > balanceMax.value) return false
    return true
  })
})

function resetAdvancedFilters() {
  registerDateRange.value = null
  balanceMin.value = undefined
  balanceMax.value = undefined
}

function handleSelectionChange(rows) {
  selectedMembers.value = rows
}

function clearSelection() {
  tableRef.value?.clearSelection()
}

function batchFreeze() {
  const names = selectedMembers.value.map(m => m.username).join('、')
  ElMessageBox.confirm(`确定要批量冻结以下会员吗？\n${names}`, '批量冻结', { type: 'warning' }).then(async () => {
    let successCount = 0
    for (const member of selectedMembers.value) {
      if (member.status === 'active') {
        try {
          await memberAction(member.id, 'freeze')
          member.status = 'frozen'
          successCount++
        } catch (e) {
          console.warn(`冻结会员 ${member.username} 失败`, e)
        }
      }
    }
    ElMessage.success(`已成功冻结 ${successCount} 个会员`)
    clearSelection()
  }).catch(() => {})
}

function batchUnfreeze() {
  const names = selectedMembers.value.map(m => m.username).join('、')
  ElMessageBox.confirm(`确定要批量解冻以下会员吗？\n${names}`, '批量解冻', { type: 'warning' }).then(async () => {
    let successCount = 0
    for (const member of selectedMembers.value) {
      if (member.status === 'frozen') {
        try {
          await memberAction(member.id, 'unfreeze')
          member.status = 'active'
          successCount++
        } catch (e) {
          console.warn(`解冻会员 ${member.username} 失败`, e)
        }
      }
    }
    ElMessage.success(`已成功解冻 ${successCount} 个会员`)
    clearSelection()
  }).catch(() => {})
}

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

function openStatusDialog(row) {
  statusForm.value = { memberId: row.id, username: row.username, currentStatus: row.status, newStatus: row.status, reason: '' }
  statusDialogVisible.value = true
}

async function submitStatusChange() {
  if (!statusForm.value.reason) { ElMessage.warning('请输入状态变更原因'); return }
  if (statusForm.value.newStatus === statusForm.value.currentStatus) { ElMessage.info('状态未变更'); statusDialogVisible.value = false; return }
  try {
    const actionMap = { active: 'unfreeze', frozen: 'freeze', disabled: 'disable' }
    await memberAction(statusForm.value.memberId, actionMap[statusForm.value.newStatus] || statusForm.value.newStatus)
    const m = members.value.find(m => m.id === statusForm.value.memberId)
    if (m) m.status = statusForm.value.newStatus
    if (detailData.value.id === statusForm.value.memberId) detailData.value.status = statusForm.value.newStatus
    ElMessage.success(`会员状态已变更为: ${memberStatusLabel(statusForm.value.newStatus)}`)
    statusDialogVisible.value = false
  } catch (e) {
    ElMessage.error('状态变更失败: ' + (e.message || '未知错误'))
  }
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
  detailTab.value = 'profile'
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
.advanced-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.balance-range-filter {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-label {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
}
.filter-separator {
  color: #909399;
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
