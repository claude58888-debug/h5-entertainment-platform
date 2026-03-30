<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">活动管理</h2>
      <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>创建活动</el-button>
    </div>

    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">活动总数</div><div style="font-size: 24px; font-weight: 700; color: #409eff;">{{ promoStats.total }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">进行中</div><div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ promoStats.active }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总领取次数</div><div style="font-size: 24px; font-weight: 700; color: #e6a23c;">{{ promoStats.totalClaims.toLocaleString() }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总成本</div><div style="font-size: 24px; font-weight: 700; color: #f56c6c;">¥{{ promoStats.totalCost.toLocaleString() }}</div></div></el-card>
    </div>

    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索活动标题" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="活动类型" style="width: 140px;" clearable>
          <el-option label="注册奖励" value="registration" /><el-option label="首充奖励" value="first-deposit" />
          <el-option label="每日活动" value="daily" /><el-option label="每周活动" value="weekly" />
          <el-option label="推荐奖励" value="referral" /><el-option label="VIP专属" value="vip" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="进行中" value="active" /><el-option label="已结束" value="ended" /><el-option label="草稿" value="draft" />
        </el-select>
      </div>
      <el-table :data="filteredPromotions" stripe @expand-change="handleExpandChange">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 12px 20px;">
              <h4 style="color: #e0e0e0; margin-bottom: 12px;">领取记录</h4>
              <el-table :data="row.claims || []" size="small" stripe>
                <el-table-column prop="userId" label="用户ID" width="100" />
                <el-table-column prop="username" label="用户名" width="130" />
                <el-table-column label="领取金额" width="110"><template #default="{ row: claim }">¥{{ claim.amount.toLocaleString() }}</template></el-table-column>
                <el-table-column label="流水要求" width="130"><template #default="{ row: claim }">¥{{ claim.wagerRequired.toLocaleString() }}</template></el-table-column>
                <el-table-column label="已完成流水" width="130"><template #default="{ row: claim }">¥{{ claim.wagerCompleted.toLocaleString() }}</template></el-table-column>
                <el-table-column label="状态" width="90">
                  <template #default="{ row: claim }">
                    <el-tag :type="claim.status === 'completed' ? 'success' : claim.status === 'in_progress' ? 'warning' : 'danger'" size="small">{{ claim.status === 'completed' ? '已完成' : claim.status === 'in_progress' ? '进行中' : '已过期' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="claimedAt" label="领取时间" width="170" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" width="150" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" :type="promotionTypeTag(row.type)">{{ promotionTypeLabel(row.type) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="金额" width="100"><template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template></el-table-column>
        <el-table-column label="流水倍数" width="90"><template #default="{ row }">{{ row.wagerMultiplier }}x</template></el-table-column>
        <el-table-column label="预算" width="160">
          <template #default="{ row }">
            <div v-if="row.budget">
              <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">¥{{ (row.budgetUsed || 0).toLocaleString() }} / ¥{{ row.budget.toLocaleString() }}</div>
              <el-progress :percentage="Math.min(100, Math.round(((row.budgetUsed || 0) / row.budget) * 100))" :stroke-width="8" :color="((row.budgetUsed || 0) / row.budget) >= 0.9 ? '#f56c6c' : '#409eff'" />
            </div>
            <span v-else style="color: #909399;">无限制</span>
          </template>
        </el-table-column>
        <el-table-column label="领取限制" width="100">
          <template #default="{ row }">{{ row.claimLimit ? row.claimLimit + '次' : '无限' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="190">
          <template #default="{ row }">
            <div style="font-size: 12px;">
              <div>{{ row.startAt || '-' }}</div>
              <div style="color: #909399;">~ {{ row.endAt || '长期' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'ended' ? 'info' : 'warning'" size="small">{{ row.status === 'active' ? '进行中' : row.status === 'ended' ? '已结束' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleStatus(row)">{{ row.status === 'active' ? '停用' : '启用' }}</el-button>
            <el-button size="small" type="danger" text @click="handleDeletePromo(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredPromotions.length" :page-size="10" />
      </div>
    </div>

    <div class="table-card">
      <span style="font-size: 15px; font-weight: 600; color: #e0e0e0; margin-bottom: 12px; display: block;">游戏流水贡献比例</span>
      <el-table :data="gameContributions" stripe size="small">
        <el-table-column prop="gameType" label="游戏类型" width="150" />
        <el-table-column label="贡献比例" width="120"><template #default="{ row }">{{ row.contribution }}%</template></el-table-column>
        <el-table-column prop="remark" label="说明" />
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '创建活动'" width="640px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="活动标题" required><el-input v-model="form.title" placeholder="请输入活动标题" /></el-form-item>
        <el-form-item label="活动类型" required>
          <el-select v-model="form.type" placeholder="选择类型" style="width: 100%;" @change="onTypeChange">
            <el-option label="注册奖励" value="registration" /><el-option label="首充奖励" value="first-deposit" />
            <el-option label="每日活动" value="daily" /><el-option label="每周活动" value="weekly" />
            <el-option label="推荐奖励" value="referral" /><el-option label="VIP专属" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动描述"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="活动详细描述" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="奖励金额"><el-input-number v-model="form.amount" :min="0" style="width: 100%;" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="流水倍数"><el-input-number v-model="form.wagerMultiplier" :min="1" :max="100" style="width: 100%;" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="流水天数"><el-input-number v-model="form.wagerDays" :min="1" :max="365" style="width: 100%;" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="目标VIP等级"><el-select v-model="form.targetVipLevel" placeholder="全部等级" style="width: 100%;" clearable><el-option v-for="i in 6" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="预算总额"><el-input-number v-model="form.budget" :min="0" style="width: 100%;" placeholder="0=无限" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="领取限制"><el-input-number v-model="form.claimLimit" :min="0" style="width: 100%;" placeholder="0=无限" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="开始时间"><el-date-picker v-model="form.startAt" type="datetime" placeholder="选择开始时间" style="width: 100%;" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="结束时间"><el-date-picker v-model="form.endAt" type="datetime" placeholder="选择结束时间" style="width: 100%;" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="游戏贡献">
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <span v-for="(val, key) in form.gameContribution" :key="key" style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #a0a0b0; font-size: 13px;">{{ gameContribLabel(key) }}:</span>
              <el-input-number v-model="form.gameContribution[key]" :min="0" :max="100" size="small" style="width: 90px;" />
              <span style="color: #a0a0b0; font-size: 13px;">%</span>
            </span>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%;"><el-option label="进行中" value="active" /><el-option label="草稿" value="draft" /></el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePromotion">{{ isEdit ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, createActivity, updateActivity, deleteActivity } from '@/api/promotions'
import { Plus } from '@element-plus/icons-vue'

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)

const wagerDefaults = {
  'registration': { wagerMultiplier: 20, wagerDays: 7 },
  'first-deposit': { wagerMultiplier: 15, wagerDays: 30 },
  'daily': { wagerMultiplier: 12, wagerDays: 14 },
  'weekly': { wagerMultiplier: 10, wagerDays: 21 },
  'referral': { wagerMultiplier: 18, wagerDays: 14 },
  'vip': { wagerMultiplier: 8, wagerDays: 30 }
}

const defaultForm = {
  title: '', type: '', description: '', amount: 0, wagerMultiplier: 20, wagerDays: 7,
  gameContribution: { slots: 100, live: 50, sports: 100, chess: 30 },
  startAt: '', endAt: '', targetVipLevel: null, status: 'draft', budget: 0, claimLimit: 0
}
const form = ref({ ...defaultForm, gameContribution: { ...defaultForm.gameContribution } })

const gameContributions = [
  { gameType: '电子游戏 (Slots)', contribution: 100, remark: '全额计入流水' },
  { gameType: '真人视讯 (Live)', contribution: 50, remark: '50%计入流水' },
  { gameType: '体育竞猜 (Sports)', contribution: 100, remark: '全额计入流水' },
  { gameType: '棋牌游戏 (Chess)', contribution: 30, remark: '30%计入流水' }
]

const promotions = ref([])

onMounted(async () => {
  try {
    const data = await getActivities()
    promotions.value = (data || []).map(p => ({ ...p, claims: p.claims || [], budget: p.budget || 0, budgetUsed: p.budgetUsed || 0, claimLimit: p.claimLimit || 0 }))
  } catch (e) { console.warn('API request failed', e) }
})

const promoStats = computed(() => {
  const all = promotions.value
  const totalClaims = all.reduce((sum, p) => sum + (p.claims?.length || 0), 0)
  const totalCost = all.reduce((sum, p) => sum + (p.budgetUsed || 0), 0)
  return { total: all.length, active: all.filter(p => p.status === 'active').length, totalClaims, totalCost }
})

const filteredPromotions = computed(() => {
  return promotions.value.filter(p => {
    if (search.value && !p.title.includes(search.value)) return false
    if (typeFilter.value && p.type !== typeFilter.value) return false
    if (statusFilter.value && p.status !== statusFilter.value) return false
    return true
  })
})

function promotionTypeLabel(type) {
  const map = { 'registration': '注册奖励', 'first-deposit': '首充奖励', 'daily': '每日活动', 'weekly': '每周活动', 'referral': '推荐奖励', 'vip': 'VIP专属' }
  return map[type] || type
}

function promotionTypeTag(type) {
  const map = { 'registration': 'success', 'first-deposit': 'warning', 'daily': 'primary', 'weekly': '', 'referral': 'danger', 'vip': 'danger' }
  return map[type] || 'info'
}

function gameContribLabel(key) {
  const map = { slots: '电子', live: '真人', sports: '体育', chess: '棋牌' }
  return map[key] || key
}

function onTypeChange(type) {
  if (wagerDefaults[type]) {
    form.value.wagerMultiplier = wagerDefaults[type].wagerMultiplier
    form.value.wagerDays = wagerDefaults[type].wagerDays
  }
}

function openCreateDialog() {
  isEdit.value = false
  form.value = { ...defaultForm, gameContribution: { ...defaultForm.gameContribution } }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  form.value = { ...row, gameContribution: row.gameContribution ? { ...row.gameContribution } : { slots: 100, live: 50, sports: 100, chess: 30 } }
  dialogVisible.value = true
}

function handleExpandChange() {}

async function savePromotion() {
  if (!form.value.title) { ElMessage.warning('请输入活动标题'); return }
  try {
    if (isEdit.value) {
      await updateActivity(form.value.id, form.value)
      const idx = promotions.value.findIndex(p => p.id === form.value.id)
      if (idx !== -1) promotions.value[idx] = { ...form.value, claims: promotions.value[idx].claims }
      ElMessage.success('活动已更新')
    } else {
      const newItem = await createActivity(form.value)
      promotions.value.unshift({ ...form.value, id: newItem?.id || Date.now(), claims: [] })
      ElMessage.success('活动已创建')
    }
    dialogVisible.value = false
  } catch (e) { ElMessage.error('操作失败') }
}

function toggleStatus(row) {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm('确定要' + action + '活动 "' + row.title + '" 吗?', '确认', { type: 'warning' }).then(async () => {
    const newStatus = row.status === 'active' ? 'ended' : 'active'
    try { await updateActivity(row.id, { status: newStatus }); row.status = newStatus; ElMessage.success('已' + action + ' "' + row.title + '"') } catch (e) { ElMessage.error('操作失败') }
  }).catch(() => {})
}

function handleDeletePromo(row) {
  ElMessageBox.confirm('确定删除活动 "' + row.title + '" 吗？此操作不可恢复。', '确认删除', { type: 'warning' }).then(async () => {
    try { await deleteActivity(row.id); promotions.value = promotions.value.filter(p => p.id !== row.id); ElMessage.success('已删除') } catch (e) { ElMessage.error('删除失败') }
  }).catch(() => {})
}
</script>
