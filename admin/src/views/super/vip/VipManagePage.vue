<template>
  <div>
    <h2 class="section-title">VIP管理</h2>

    <!-- Points Rule Info -->
    <div class="table-card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">积分规则</span>
      </div>
      <div style="padding: 12px; background: #252538; border-radius: 8px; color: #a0a0b0; font-size: 13px;">
        <el-icon><InfoFilled /></el-icon>
        积分规则：每投注 10 CNY = 1 积分 | 每季度审核一次等级 | 降级条件：连续一季度积分不达标
      </div>
      <el-row :gutter="20" style="margin-top: 16px;">
        <el-col :span="8">
          <div style="background: #252538; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #409eff;">6</div>
            <div style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">VIP等级数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div style="background: #252538; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #e6a23c;">10 CNY</div>
            <div style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">每积分所需投注</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div style="background: #252538; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #67c23a;">季度</div>
            <div style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">审核周期</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- VIP Levels Table -->
    <div class="table-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 15px; font-weight: 600; color: #e0e0e0;">VIP等级配置</span>
      </div>
      <el-table :data="vipLevels" stripe>
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">VIP{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="100" />
        <el-table-column label="所需积分" width="120">
          <template #default="{ row }">{{ (row.minPoints || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="返水加成" width="100">
          <template #default="{ row }">
            <span style="color: #e6a23c;">+{{ row.rakebackBonus || 0 }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="权益" min-width="200">
          <template #default="{ row }">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <el-tag v-for="(b, i) in (row.benefits || [])" :key="i" size="small" type="info">{{ b }}</el-tag>
              <span v-if="!row.benefits || row.benefits.length === 0" style="color: #a0a0b0;">基础服务</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现限额" width="120">
          <template #default="{ row }">
            <span v-if="row.withdrawLimit === 'unlimited'" style="color: #67c23a;">无限制</span>
            <span v-else>¥{{ Number(row.withdrawLimit || 50000).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑VIP等级" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="等级">
          <el-input :value="'VIP' + editForm.level" disabled />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="editForm.minPoints" :min="0" :step="1000" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="返水加成">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-input-number v-model="editForm.rakebackBonus" :min="0" :max="5" :step="0.1" :precision="1" style="width: 160px;" />
            <span style="color: #a0a0b0;">%</span>
          </div>
        </el-form-item>
        <el-form-item label="权益">
          <div style="width: 100%;">
            <div v-for="(b, i) in editBenefits" :key="i" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <el-input v-model="editBenefits[i]" placeholder="输入权益描述" />
              <el-button type="danger" text @click="editBenefits.splice(i, 1)">删除</el-button>
            </div>
            <el-button type="primary" text @click="editBenefits.push('')">+ 添加权益</el-button>
          </div>
        </el-form-item>
        <el-form-item label="月度审核">
          <el-switch v-model="editForm.monthlyReview" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="季度审核">
          <el-switch v-model="editForm.quarterlyReview" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="提现限额">
          <el-input v-model="editForm.withdrawLimit" placeholder="数字或 unlimited" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.status" active-value="active" inactive-value="inactive" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getVipLevels, updateVipLevel } from '@/api/vip'

const vipLevels = ref([])

const defaultLevels = [
  { level: 0, name: '普通会员', minPoints: 0, benefits: ['基础服务'], rakebackBonus: 0, withdrawLimit: '50000', status: 'active', monthlyReview: 0, quarterlyReview: 1 },
  { level: 1, name: '白银会员', minPoints: 1000, benefits: ['生日礼金', '专属客服'], rakebackBonus: 0, withdrawLimit: '50000', status: 'active', monthlyReview: 0, quarterlyReview: 1 },
  { level: 2, name: '黄金会员', minPoints: 10000, benefits: ['月度返水+0.1%', '生日礼金', '专属客服'], rakebackBonus: 0.1, withdrawLimit: '100000', status: 'active', monthlyReview: 0, quarterlyReview: 1 },
  { level: 3, name: '铂金会员', minPoints: 50000, benefits: ['提现限额提升', '专属活动', '月度返水'], rakebackBonus: 0.3, withdrawLimit: '200000', status: 'active', monthlyReview: 0, quarterlyReview: 1 },
  { level: 4, name: '钻石会员', minPoints: 200000, benefits: ['专属经理', '每周返水', '专属活动', '优先提现'], rakebackBonus: 0.5, withdrawLimit: '500000', status: 'active', monthlyReview: 1, quarterlyReview: 1 },
  { level: 5, name: '至尊会员', minPoints: 500000, benefits: ['最高返水', '无限提现', '专属经理', 'VIP活动', '全部特权'], rakebackBonus: 1.0, withdrawLimit: 'unlimited', status: 'active', monthlyReview: 1, quarterlyReview: 1 }
]

onMounted(async () => {
  try {
    const data = await getVipLevels()
    if (data && data.length > 0) {
      vipLevels.value = data
    } else {
      vipLevels.value = defaultLevels
    }
  } catch (e) {
    console.warn('API request failed, using defaults', e)
    vipLevels.value = defaultLevels
  }
})

const editDialogVisible = ref(false)
const editForm = ref({})
const editBenefits = ref([])

function levelTagType(level) {
  const types = ['info', '', 'success', 'warning', 'danger', 'danger']
  return types[level] || 'info'
}

function handleEdit(row) {
  editForm.value = { ...row }
  editBenefits.value = [...(row.benefits || [])]
  editDialogVisible.value = true
}

async function saveEdit() {
  try {
    const benefitsJson = JSON.stringify(editBenefits.value.filter(b => b.trim()))
    const payload = {
      ...editForm.value,
      benefitsJson
    }
    await updateVipLevel(editForm.value.id || editForm.value.level, payload)
    const idx = vipLevels.value.findIndex(v => v.level === editForm.value.level)
    if (idx !== -1) {
      vipLevels.value[idx] = {
        ...editForm.value,
        benefits: editBenefits.value.filter(b => b.trim()),
        benefitsJson
      }
    }
    editDialogVisible.value = false
    ElMessage.success('VIP等级配置已更新')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>
