<template>
  <div>
    <h2 class="section-title">风控管理</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="提现限额" name="withdraw">
        <div class="form-card">
          <el-form label-width="160px" style="max-width: 600px;">
            <el-form-item label="单笔最低提现"><el-input-number v-model="limits.withdrawMin" :min="10" :step="10" /><span style="margin-left:8px;color:#888;">元</span></el-form-item>
            <el-form-item label="单笔最高提现"><el-input-number v-model="limits.withdrawMax" :min="100" :step="1000" /><span style="margin-left:8px;color:#888;">元</span></el-form-item>
            <el-form-item label="每日提现限额"><el-input-number v-model="limits.dailyWithdrawLimit" :min="1000" :step="10000" /><span style="margin-left:8px;color:#888;">元</span></el-form-item>
            <el-form-item label="每日提现次数"><el-input-number v-model="limits.dailyWithdrawCount" :min="1" :max="50" /></el-form-item>
            <el-divider />
            <el-form-item label="单笔最低充值"><el-input-number v-model="limits.depositMin" :min="1" :step="10" /><span style="margin-left:8px;color:#888;">元</span></el-form-item>
            <el-form-item label="单笔最高充值"><el-input-number v-model="limits.depositMax" :min="100" :step="10000" /><span style="margin-left:8px;color:#888;">元</span></el-form-item>
            <el-form-item><el-button type="primary" @click="ElMessage.success('限额配置已保存')">保存</el-button></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="游戏限注" name="betlimit">
        <div class="table-card">
          <el-table :data="betLimits" stripe>
            <el-table-column prop="category" label="游戏分类" width="120" />
            <el-table-column label="单注上限" width="150">
              <template #default="{ row }"><el-input-number v-model="row.maxBet" size="small" :step="100" /></template>
            </el-table-column>
            <el-table-column label="单局上限" width="150">
              <template #default="{ row }"><el-input-number v-model="row.maxRound" size="small" :step="1000" /></template>
            </el-table-column>
            <el-table-column label="状态" width="100"><template #default="{ row }"><el-switch v-model="row.enabled" size="small" /></template></el-table-column>
          </el-table>
          <div style="margin-top: 16px;"><el-button type="primary" @click="ElMessage.success('限注配置已保存')">保存</el-button></div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="异常警报" name="alerts">
        <div class="table-card">
          <el-table :data="alerts" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="warning" text @click="ElMessage.success('已标记审查')">审查</el-button>
                <el-button size="small" type="success" text @click="ElMessage.success('已忽略')">忽略</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('withdraw')
const limits = reactive({
  withdrawMin: 100, withdrawMax: 50000, dailyWithdrawLimit: 200000, dailyWithdrawCount: 10,
  depositMin: 50, depositMax: 500000
})

const betLimits = ref([])

const alerts = ref([])
</script>
