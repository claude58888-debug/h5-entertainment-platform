<template>
  <div>
    <h2 class="section-title">余额调整 (Manual Balance Adjustment)</h2>

    <!-- Adjustment Form -->
    <div class="table-card" style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 16px; font-size: 16px; color: #e0e0e0;">手动调整会员余额</h3>
      <el-form :model="adjustForm" label-width="120px" style="max-width: 600px;">
        <el-form-item label="会员ID" required>
          <el-input v-model="adjustForm.memberId" placeholder="输入会员ID (如 M10001)">
            <template #append>
              <el-button @click="lookupMember" :loading="lookingUp">查询</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="memberInfo" label="会员信息">
          <el-descriptions :column="2" border size="small" style="width: 100%;">
            <el-descriptions-item label="用户名">{{ memberInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="VIP">Lv.{{ memberInfo.vip }}</el-descriptions-item>
            <el-descriptions-item label="当前余额"><span style="color: #67c23a; font-weight: 600;">¥{{ memberInfo.balance.toLocaleString() }}</span></el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="memberInfo.status === 'active' ? 'success' : 'danger'" size="small">{{ memberInfo.status === 'active' ? '正常' : memberInfo.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <el-form-item label="调整类型" required>
          <el-radio-group v-model="adjustForm.type">
            <el-radio-button value="deposit">
              <el-icon><Plus /></el-icon> 增加余额
            </el-radio-button>
            <el-radio-button value="deduction">
              <el-icon><Minus /></el-icon> 扣减余额
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="金额" required>
          <el-input-number v-model="adjustForm.amount" :min="0.01" :precision="2" :step="100" style="width: 240px;" />
          <span v-if="memberInfo && adjustForm.amount" style="margin-left: 12px; color: #909399; font-size: 13px;">
            调整后: ¥{{ expectedBalance.toLocaleString() }}
          </span>
        </el-form-item>

        <el-form-item label="原因类别" required>
          <el-select v-model="adjustForm.reasonType" placeholder="选择原因" style="width: 240px;">
            <el-option label="奖励/赠送 (Bonus)" value="bonus" />
            <el-option label="余额修正 (Correction)" value="correction" />
            <el-option label="活动奖励 (Promotion)" value="promotion" />
            <el-option label="返水补偿 (Rakeback)" value="rakeback" />
            <el-option label="客服赔偿 (CS Compensation)" value="compensation" />
            <el-option label="其他 (Other)" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细说明" required>
          <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入详细调整原因，此内容会记录到操作日志" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="confirmAdjust">
            <el-icon><Check /></el-icon> 提交调整
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Recent Adjustments Log -->
    <div class="table-card">
      <h3 style="margin: 0 0 16px; font-size: 16px; color: #e0e0e0;">近期余额调整记录</h3>
      <div v-if="loadingLogs" class="skeleton-table">
        <el-skeleton :rows="4" animated />
      </div>
      <el-table v-else :data="adjustmentLogs" stripe>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="memberId" label="会员" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'deposit' ? 'success' : 'danger'" size="small">
              {{ row.type === 'deposit' ? '增加' : '扣减' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'deposit' ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
              {{ row.type === 'deposit' ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="调整前" width="130">
          <template #default="{ row }">¥{{ (row.balanceBefore || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="调整后" width="130">
          <template #default="{ row }">¥{{ (row.balanceAfter || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="原因类别" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ reasonLabel(row.reasonType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="详细说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作员" width="120" />
      </el-table>
    </div>

    <!-- Confirmation Dialog -->
    <el-dialog v-model="confirmDialogVisible" title="确认余额调整" width="500px">
      <el-alert :type="adjustForm.type === 'deposit' ? 'success' : 'warning'" :closable="false" style="margin-bottom: 16px;">
        <template #title>
          {{ adjustForm.type === 'deposit' ? '增加' : '扣减' }}会员 {{ adjustForm.memberId }} 余额 ¥{{ adjustForm.amount.toLocaleString() }}
        </template>
      </el-alert>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="会员ID">{{ adjustForm.memberId }}</el-descriptions-item>
        <el-descriptions-item v-if="memberInfo" label="用户名">{{ memberInfo.username }}</el-descriptions-item>
        <el-descriptions-item v-if="memberInfo" label="当前余额">¥{{ memberInfo.balance.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="调整类型">
          <el-tag :type="adjustForm.type === 'deposit' ? 'success' : 'danger'" size="small">
            {{ adjustForm.type === 'deposit' ? '增加' : '扣减' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="调整金额">
          <span :style="{ color: adjustForm.type === 'deposit' ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
            {{ adjustForm.type === 'deposit' ? '+' : '-' }}¥{{ adjustForm.amount.toLocaleString() }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="memberInfo" label="预计余额">¥{{ expectedBalance.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="原因类别">{{ reasonLabel(adjustForm.reasonType) }}</el-descriptions-item>
        <el-descriptions-item label="详细说明">{{ adjustForm.reason }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button :type="adjustForm.type === 'deposit' ? 'success' : 'danger'" :loading="submitting" @click="submitAdjust">
          确认{{ adjustForm.type === 'deposit' ? '增加' : '扣减' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getMemberInfo, adjustMemberBalance, getBalanceAdjustLogs } from '@/api/finance'
import { ElMessage } from 'element-plus'
import { Plus, Minus, Check } from '@element-plus/icons-vue'

const adjustForm = reactive({
  memberId: '',
  type: 'deposit',
  amount: 0,
  reasonType: '',
  reason: ''
})

const memberInfo = ref(null)
const lookingUp = ref(false)
const submitting = ref(false)
const confirmDialogVisible = ref(false)
const adjustmentLogs = ref([])
const loadingLogs = ref(true)

const canSubmit = computed(() => {
  return adjustForm.memberId && adjustForm.amount > 0 && adjustForm.reasonType && adjustForm.reason
})

const expectedBalance = computed(() => {
  if (!memberInfo.value) return 0
  if (adjustForm.type === 'deposit') return memberInfo.value.balance + adjustForm.amount
  return Math.max(0, memberInfo.value.balance - adjustForm.amount)
})

onMounted(() => {
  loadLogs()
})

async function lookupMember() {
  if (!adjustForm.memberId) {
    ElMessage.warning('请输入会员ID')
    return
  }
  lookingUp.value = true
  try {
    const res = await getMemberInfo(adjustForm.memberId)
    memberInfo.value = res
    if (!res) ElMessage.warning('会员不存在')
  } catch (e) {
    memberInfo.value = null
    ElMessage.error('查询失败: ' + (e.error || e.message || '未知错误'))
  } finally {
    lookingUp.value = false
  }
}

function confirmAdjust() {
  if (!canSubmit.value) {
    ElMessage.warning('请填写所有必填项')
    return
  }
  if (adjustForm.type === 'deduction' && memberInfo.value && adjustForm.amount > memberInfo.value.balance) {
    ElMessage.warning('扣减金额超过当前余额')
    return
  }
  confirmDialogVisible.value = true
}

async function submitAdjust() {
  submitting.value = true
  try {
    const result = await adjustMemberBalance({
      memberId: adjustForm.memberId,
      type: adjustForm.type,
      amount: adjustForm.amount,
      reasonType: adjustForm.reasonType,
      reason: adjustForm.reason
    })
    ElMessage.success('余额调整成功')
    confirmDialogVisible.value = false

    // Add to logs
    adjustmentLogs.value.unshift({
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      memberId: adjustForm.memberId,
      type: adjustForm.type,
      amount: adjustForm.amount,
      balanceBefore: memberInfo.value ? memberInfo.value.balance : 0,
      balanceAfter: result.newBalance || expectedBalance.value,
      reasonType: adjustForm.reasonType,
      reason: adjustForm.reason,
      operator: result.operator || 'admin'
    })

    // Update member info
    if (memberInfo.value) {
      memberInfo.value.balance = result.newBalance || expectedBalance.value
    }

    resetForm()
  } catch (e) {
    ElMessage.error('调整失败: ' + (e.error || e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  adjustForm.memberId = ''
  adjustForm.type = 'deposit'
  adjustForm.amount = 0
  adjustForm.reasonType = ''
  adjustForm.reason = ''
  memberInfo.value = null
}

async function loadLogs() {
  loadingLogs.value = true
  try {
    const res = await getBalanceAdjustLogs()
    adjustmentLogs.value = res || []
  } catch (e) {
    console.warn('Failed to load logs', e)
  } finally {
    loadingLogs.value = false
  }
}

function reasonLabel(type) {
  const labels = {
    bonus: '奖励/赠送',
    correction: '余额修正',
    promotion: '活动奖励',
    rakeback: '返水补偿',
    compensation: '客服赔偿',
    other: '其他'
  }
  return labels[type] || type || '-'
}
</script>
