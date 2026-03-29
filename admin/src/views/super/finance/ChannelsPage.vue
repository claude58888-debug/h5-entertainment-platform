<template>
  <div>
    <h2 class="section-title">支付通道管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary"><el-icon><Plus /></el-icon>添加通道</el-button>
      </div>
      <el-table :data="channels" stripe style="margin-top: 16px;">
        <el-table-column prop="name" label="通道名称" width="140" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }"><el-tag size="small">{{ row.type === 'crypto' ? '加密货币' : '银行' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="手续费" width="80">
          <template #default="{ row }">{{ row.fee }}%</template>
        </el-table-column>
        <el-table-column label="单笔限额" width="180">
          <template #default="{ row }">¥{{ row.minAmount.toLocaleString() }} ~ ¥{{ row.maxAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="今日交易额" width="140">
          <template #default="{ row }">¥{{ (row.todayVolume / 10000).toFixed(1) }}万</template>
        </el-table-column>
        <el-table-column label="钱包数" width="80">
          <template #default="{ row }">{{ row.walletCount || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>配置</el-button>
            <el-button v-if="row.type === 'crypto'" size="small" type="warning" text>钱包管理</el-button>
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" size="small" style="margin-left: 8px;" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <h3 class="section-title" style="margin-top: 24px;">汇率配置</h3>
    <div class="form-card">
      <el-form label-width="140px">
        <el-form-item label="USDT/CNY 汇率">
          <el-input-number v-model="usdtRate" :precision="2" :step="0.01" :min="6" :max="8" />
          <span style="margin-left: 12px; color: #888;">当前: 1 USDT = ¥{{ usdtRate }}</span>
        </el-form-item>
        <el-form-item label="汇率模式">
          <el-radio-group v-model="rateMode">
            <el-radio value="manual">手动设置</el-radio>
            <el-radio value="auto">API自动获取</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="ElMessage.success('汇率已更新')">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChannels } from '@/api/finance'
import { ElMessage } from 'element-plus'

const channels = ref([])

onMounted(async () => {
  try {
    const data = await getChannels()
    channels.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})
const usdtRate = ref(7.24)
const rateMode = ref('manual')
</script>
