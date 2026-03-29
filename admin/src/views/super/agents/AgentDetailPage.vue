<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">代理详情 - {{ agent.brand }}</h2>
      <el-button @click="$router.back()">返回列表</el-button>
    </div>
    <div class="detail-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="代理ID">{{ agent.id }}</el-descriptions-item>
            <el-descriptions-item label="品牌名称">{{ agent.brand }}</el-descriptions-item>
            <el-descriptions-item label="域名">{{ agent.domain }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ agent.contact }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="agent.status === 'active' ? 'success' : 'danger'" size="small">
                {{ agent.status === 'active' ? '正常' : '暂停' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建日期">{{ agent.created }}</el-descriptions-item>
            <el-descriptions-item label="会员数">{{ agent.members?.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="月收入">¥{{ ((agent.monthRevenue || 0) / 10000).toFixed(1) }}万</el-descriptions-item>
            <el-descriptions-item label="分成模式">{{ agent.shareMode === 'revenue' ? '收入分成' : '流水分成' }} {{ agent.shareRate }}%</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="余额管理" name="balance">
          <div style="margin-bottom: 20px;">
            <el-statistic title="当前余额" :value="agent.balance" prefix="¥" />
          </div>
          <el-space>
            <el-button type="primary" @click="handleBalance('topup')">充值</el-button>
            <el-button type="warning" @click="handleBalance('deduct')">扣减</el-button>
          </el-space>
          <el-table :data="balanceHistory" stripe style="margin-top: 20px;">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === '充值' ? 'success' : 'danger'" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.type === '充值' ? '#67c23a' : '#f56c6c' }">
                  {{ row.type === '充值' ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="结算记录" name="settlement">
          <el-table :data="settlements" stripe>
            <el-table-column prop="id" label="结算ID" width="100" />
            <el-table-column prop="period" label="结算周期" width="220" />
            <el-table-column label="GGR" width="120">
              <template #default="{ row }">¥{{ row.ggr.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="分成比例" width="100">
              <template #default="{ row }">{{ row.shareRate }}%</template>
            </el-table-column>
            <el-table-column label="结算金额" width="120">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'approved' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'paid' ? '已付款' : row.status === 'approved' ? '已审批' : '待审批' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="配置" name="config">
          <el-form label-width="120px" style="max-width: 600px;">
            <el-form-item label="分成模式">
              <el-radio-group v-model="agent.shareMode">
                <el-radio value="revenue">收入分成</el-radio>
                <el-radio value="turnover">流水分成</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="分成比例">
              <el-slider v-model="agent.shareRate" :min="10" :max="60" show-input />
            </el-form-item>
            <el-form-item label="结算周期">
              <el-select v-model="settlementCycle">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="ElMessage.success('配置已保存')">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAgents } from '@/api/agents'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const activeTab = ref('info')
const settlementCycle = ref('weekly')
const agent = ref({ id: '', brand: '', domain: '', contact: '', members: 0, balance: 0, monthRevenue: 0, shareMode: 'revenue', shareRate: 0, status: 'active', created: '' })
const settlements = ref([])

onMounted(async () => {
  try {
    const data = await getAgents()
    const found = (data || []).find(a => a.id === route.params.id)
    if (found) agent.value = found
  } catch (e) { console.warn('API request failed', e) }
})

const balanceHistory = ref([
  { time: '2026-03-07 10:00', type: '充值', amount: 100000, operator: 'superadmin', remark: '日常充值' },
  { time: '2026-03-05 14:30', type: '扣减', amount: 50000, operator: 'admin_finance', remark: '结算扣除' },
  { time: '2026-03-03 09:00', type: '充值', amount: 200000, operator: 'superadmin', remark: '首次充值' }
])

function handleBalance(type) {
  const label = type === 'topup' ? '充值' : '扣减'
  ElMessageBox.prompt(`请输入${label}金额`, `代理${label}`, {
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效金额'
  }).then(({ value }) => {
    const amount = parseInt(value)
    if (type === 'topup') agent.value.balance += amount
    else agent.value.balance -= amount
    balanceHistory.value.unshift({
      time: new Date().toLocaleString('zh-CN'),
      type: label, amount, operator: 'superadmin', remark: '手动操作'
    })
    ElMessage.success(`${label}成功 ¥${amount.toLocaleString()}`)
  }).catch(() => {})
}
</script>
