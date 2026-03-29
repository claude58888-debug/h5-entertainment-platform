<template>
  <div>
    <h2 class="section-title">VIP管理</h2>
    <div class="table-card">
      <div style="margin-bottom: 16px; color: #a0a0b0; font-size: 13px;">
        <el-icon><InfoFilled /></el-icon>
        积分规则：每充值 10 CNY = 1 积分，每季度审核一次等级
      </div>
      <el-table :data="vipLevels" stripe>
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">VIP{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="100" />
        <el-table-column label="所需积分" width="120">
          <template #default="{ row }">{{ row.pointsRequired.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="benefits" label="权益" min-width="200" />
        <el-table-column prop="upgradeCondition" label="升级条件" min-width="180" />
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
    <el-dialog v-model="editDialogVisible" title="编辑VIP等级" width="520px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="等级">
          <el-input :value="'VIP' + editForm.level" disabled />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="editForm.pointsRequired" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="权益">
          <el-input v-model="editForm.benefits" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="升级条件">
          <el-input v-model="editForm.upgradeCondition" />
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const vipLevels = ref([
  { level: 0, name: '普通会员', pointsRequired: 0, benefits: '基础游戏权限', upgradeCondition: '注册即可', status: 'active' },
  { level: 1, name: '青铜VIP', pointsRequired: 1000, benefits: '0.5%返水、每月红包88元、专属客服', upgradeCondition: '累计充值 ≥ 10,000 CNY', status: 'active' },
  { level: 2, name: '白银VIP', pointsRequired: 10000, benefits: '0.8%返水、每月红包288元、生日礼金588元', upgradeCondition: '累计充值 ≥ 100,000 CNY', status: 'active' },
  { level: 3, name: '黄金VIP', pointsRequired: 50000, benefits: '1.0%返水、每月红包588元、生日礼金1288元、优先提现', upgradeCondition: '累计充值 ≥ 500,000 CNY', status: 'active' },
  { level: 4, name: '铂金VIP', pointsRequired: 200000, benefits: '1.2%返水、每月红包1288元、生日礼金2888元、专属活动', upgradeCondition: '累计充值 ≥ 2,000,000 CNY', status: 'active' },
  { level: 5, name: '钻石VIP', pointsRequired: 500000, benefits: '1.5%返水、每月红包2888元、生日礼金5888元、1对1管家', upgradeCondition: '累计充值 ≥ 5,000,000 CNY', status: 'active' }
])

const editDialogVisible = ref(false)
const editForm = ref({})

function levelTagType(level) {
  const types = ['info', '', 'success', 'warning', 'danger', 'danger']
  return types[level] || 'info'
}

function handleEdit(row) {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

function saveEdit() {
  const idx = vipLevels.value.findIndex(v => v.level === editForm.value.level)
  if (idx !== -1) {
    vipLevels.value[idx] = { ...editForm.value }
  }
  editDialogVisible.value = false
  ElMessage.success('VIP等级配置已更新')
}
</script>
