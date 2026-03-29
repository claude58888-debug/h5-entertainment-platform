<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">活动管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>创建活动
      </el-button>
    </div>

    <!-- Promotions Table -->
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索活动标题" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="活动类型" style="width: 140px;" clearable>
          <el-option label="注册奖励" value="registration" />
          <el-option label="首充奖励" value="first-deposit" />
          <el-option label="每日活动" value="daily" />
          <el-option label="VIP专属" value="vip" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="进行中" value="active" />
          <el-option label="已结束" value="ended" />
          <el-option label="草稿" value="draft" />
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
                <el-table-column label="领取金额" width="110">
                  <template #default="{ row: claim }">¥{{ claim.amount.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column label="流水要求" width="130">
                  <template #default="{ row: claim }">¥{{ claim.wagerRequired.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column label="已完成流水" width="130">
                  <template #default="{ row: claim }">¥{{ claim.wagerCompleted.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                  <template #default="{ row: claim }">
                    <el-tag :type="claim.status === 'completed' ? 'success' : claim.status === 'in_progress' ? 'warning' : 'danger'" size="small">
                      {{ claim.status === 'completed' ? '已完成' : claim.status === 'in_progress' ? '进行中' : '已过期' }}
                    </el-tag>
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
          <template #default="{ row }">
            <el-tag size="small" :type="promotionTypeTag(row.type)">{{ promotionTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="流水倍数" width="100">
          <template #default="{ row }">{{ row.wagerMultiplier }}x</template>
        </el-table-column>
        <el-table-column label="流水天数" width="100">
          <template #default="{ row }">{{ row.wagerDays }}天</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'ended' ? 'info' : 'warning'" size="small">
              {{ row.status === 'active' ? '进行中' : row.status === 'ended' ? '已结束' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'danger' : 'success'" text @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredPromotions.length" :page-size="10" />
      </div>
    </div>

    <!-- Game Contribution Reference -->
    <div class="table-card">
      <span style="font-size: 15px; font-weight: 600; color: #e0e0e0; margin-bottom: 12px; display: block;">游戏流水贡献比例</span>
      <el-table :data="gameContributions" stripe size="small">
        <el-table-column prop="gameType" label="游戏类型" width="150" />
        <el-table-column label="贡献比例" width="120">
          <template #default="{ row }">{{ row.contribution }}%</template>
        </el-table-column>
        <el-table-column prop="remark" label="说明" />
      </el-table>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '创建活动'" width="640px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="活动标题" required>
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="活动类型" required>
          <el-select v-model="form.type" placeholder="选择类型" style="width: 100%;" @change="onTypeChange">
            <el-option label="注册奖励" value="registration" />
            <el-option label="首充奖励" value="first-deposit" />
            <el-option label="每日活动" value="daily" />
            <el-option label="VIP专属" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="活动详细描述" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="奖励金额">
              <el-input-number v-model="form.amount" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流水倍数">
              <el-input-number v-model="form.wagerMultiplier" :min="1" :max="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="流水天数">
              <el-input-number v-model="form.wagerDays" :min="1" :max="365" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标VIP等级">
              <el-select v-model="form.targetVipLevel" placeholder="全部等级" style="width: 100%;" clearable>
                <el-option v-for="i in 6" :key="i-1" :label="'VIP' + (i-1)" :value="i-1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker v-model="form.startAt" type="datetime" placeholder="选择开始时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker v-model="form.endAt" type="datetime" placeholder="选择结束时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
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
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="进行中" value="active" />
            <el-option label="草稿" value="draft" />
          </el-select>
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)

const wagerDefaults = {
  'registration': { wagerMultiplier: 20, wagerDays: 7 },
  'first-deposit': { wagerMultiplier: 15, wagerDays: 30 },
  'daily': { wagerMultiplier: 12, wagerDays: 14 },
  'vip': { wagerMultiplier: 8, wagerDays: 30 }
}

const defaultForm = {
  title: '',
  type: '',
  description: '',
  amount: 0,
  wagerMultiplier: 20,
  wagerDays: 7,
  gameContribution: { slots: 100, live: 50, sports: 100, chess: 30 },
  startAt: '',
  endAt: '',
  targetVipLevel: null,
  status: 'draft'
}

const form = ref({ ...defaultForm, gameContribution: { ...defaultForm.gameContribution } })

const gameContributions = [
  { gameType: '电子游戏 (Slots)', contribution: 100, remark: '全额计入流水' },
  { gameType: '真人视讯 (Live)', contribution: 50, remark: '50%计入流水' },
  { gameType: '体育竞猜 (Sports)', contribution: 100, remark: '全额计入流水' },
  { gameType: '棋牌游戏 (Chess)', contribution: 30, remark: '30%计入流水' }
]

const promotions = ref([
  {
    id: 1, title: '新人注册彩金', type: 'registration', amount: 88, wagerMultiplier: 20, wagerDays: 7, status: 'active',
    claims: [
      { userId: 'M10008', username: 'newbie_2026', amount: 88, wagerRequired: 1760, wagerCompleted: 520, status: 'in_progress', claimedAt: '2026-03-01 12:00:00' },
      { userId: 'M10009', username: 'new_player01', amount: 88, wagerRequired: 1760, wagerCompleted: 1760, status: 'completed', claimedAt: '2026-02-25 09:30:00' }
    ]
  },
  {
    id: 2, title: '首充100%奖励', type: 'first-deposit', amount: 5000, wagerMultiplier: 15, wagerDays: 30, status: 'active',
    claims: [
      { userId: 'M10002', username: 'lucky_star88', amount: 5000, wagerRequired: 75000, wagerCompleted: 45000, status: 'in_progress', claimedAt: '2026-03-05 14:20:00' },
      { userId: 'M10006', username: 'fish_lover', amount: 2000, wagerRequired: 30000, wagerCompleted: 30000, status: 'completed', claimedAt: '2026-02-20 16:00:00' }
    ]
  },
  {
    id: 3, title: '每日签到奖励', type: 'daily', amount: 18, wagerMultiplier: 12, wagerDays: 14, status: 'active',
    claims: [
      { userId: 'M10001', username: 'player_wang', amount: 18, wagerRequired: 216, wagerCompleted: 216, status: 'completed', claimedAt: '2026-03-07 08:00:00' },
      { userId: 'M10003', username: 'dragon_888', amount: 18, wagerRequired: 216, wagerCompleted: 100, status: 'in_progress', claimedAt: '2026-03-07 09:15:00' }
    ]
  },
  {
    id: 4, title: 'VIP专属月度红包', type: 'vip', amount: 2888, wagerMultiplier: 8, wagerDays: 30, status: 'active',
    claims: [
      { userId: 'M10003', username: 'dragon_888', amount: 2888, wagerRequired: 23104, wagerCompleted: 23104, status: 'completed', claimedAt: '2026-03-01 00:00:00' },
      { userId: 'M10007', username: 'slot_queen', amount: 1288, wagerRequired: 10304, wagerCompleted: 6000, status: 'in_progress', claimedAt: '2026-03-01 00:00:00' }
    ]
  },
  {
    id: 5, title: '春节特别活动', type: 'daily', amount: 188, wagerMultiplier: 12, wagerDays: 14, status: 'ended',
    claims: []
  },
  {
    id: 6, title: '周末存送30%', type: 'first-deposit', amount: 10000, wagerMultiplier: 15, wagerDays: 30, status: 'draft',
    claims: []
  }
])

const filteredPromotions = computed(() => {
  return promotions.value.filter(p => {
    if (search.value && !p.title.includes(search.value)) return false
    if (typeFilter.value && p.type !== typeFilter.value) return false
    if (statusFilter.value && p.status !== statusFilter.value) return false
    return true
  })
})

function promotionTypeLabel(type) {
  const map = { 'registration': '注册奖励', 'first-deposit': '首充奖励', 'daily': '每日活动', 'vip': 'VIP专属' }
  return map[type] || type
}

function promotionTypeTag(type) {
  const map = { 'registration': 'success', 'first-deposit': 'warning', 'daily': 'primary', 'vip': 'danger' }
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
  form.value = {
    ...row,
    gameContribution: { slots: 100, live: 50, sports: 100, chess: 30 }
  }
  dialogVisible.value = true
}

function handleExpandChange() {
  // expand change handler
}

function savePromotion() {
  if (!form.value.title) {
    ElMessage.warning('请输入活动标题')
    return
  }
  if (isEdit.value) {
    const idx = promotions.value.findIndex(p => p.id === form.value.id)
    if (idx !== -1) {
      promotions.value[idx] = { ...form.value, claims: promotions.value[idx].claims }
    }
    ElMessage.success('活动已更新')
  } else {
    const newId = Math.max(...promotions.value.map(p => p.id)) + 1
    promotions.value.unshift({ ...form.value, id: newId, claims: [] })
    ElMessage.success('活动已创建')
  }
  dialogVisible.value = false
}

function toggleStatus(row) {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}活动 "${row.title}" 吗?`, '确认', { type: 'warning' }).then(() => {
    row.status = row.status === 'active' ? 'ended' : 'active'
    ElMessage.success(`已${action} "${row.title}"`)
  }).catch(() => {})
}
</script>
