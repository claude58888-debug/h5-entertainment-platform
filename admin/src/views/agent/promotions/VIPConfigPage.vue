<template>
  <div>
    <h2 class="section-title">VIP等级配置</h2>
    <div class="table-card">
      <el-table :data="vipLevels" stripe>
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }"><el-tag type="warning" size="small">VIP{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column label="升级充值" width="130">
          <template #default="{ row }">¥{{ row.upgradeDeposit.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="升级流水" width="130">
          <template #default="{ row }">¥{{ row.upgradeBet.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="升级礼金" width="100">
          <template #default="{ row }">¥{{ row.upgradeBonus.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="每日提现额度" width="130">
          <template #default="{ row }">¥{{ row.dailyWithdrawLimit.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="返水加成" width="100">
          <template #default="{ row }">+{{ row.rebateBoost }}%</template>
        </el-table-column>
        <el-table-column label="专属客服" width="90">
          <template #default="{ row }">
            <el-tag :type="row.dedicatedSupport ? 'success' : 'info'" size="small">{{ row.dedicatedSupport ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="editLevel(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="editDialog" title="编辑VIP等级" width="500px">
      <el-form label-width="120px" v-if="currentLevel">
        <el-form-item label="等级名称"><el-input v-model="currentLevel.name" /></el-form-item>
        <el-form-item label="升级充值"><el-input-number v-model="currentLevel.upgradeDeposit" :step="1000" /></el-form-item>
        <el-form-item label="升级流水"><el-input-number v-model="currentLevel.upgradeBet" :step="5000" /></el-form-item>
        <el-form-item label="升级礼金"><el-input-number v-model="currentLevel.upgradeBonus" :step="10" /></el-form-item>
        <el-form-item label="每日提现额度"><el-input-number v-model="currentLevel.dailyWithdrawLimit" :step="10000" /></el-form-item>
        <el-form-item label="返水加成(%)"><el-input-number v-model="currentLevel.rebateBoost" :min="0" :max="5" :step="0.1" :precision="1" /></el-form-item>
        <el-form-item label="专属客服"><el-switch v-model="currentLevel.dedicatedSupport" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="editDialog = false; ElMessage.success('VIP配置已保存')">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const vipLevels = ref([])
const editDialog = ref(false)
const currentLevel = ref(null)

function editLevel(row) { currentLevel.value = row; editDialog.value = true }
</script>
