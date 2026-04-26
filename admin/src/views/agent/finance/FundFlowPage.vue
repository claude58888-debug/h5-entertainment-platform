<template>
  <div>
    <h2 class="section-title">资金流水</h2>
    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索会员/订单号" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="typeFilter" placeholder="类型" style="width: 120px;" clearable>
          <el-option label="充值" value="deposit" /><el-option label="提现" value="withdrawal" />
          <el-option label="投注" value="bet" /><el-option label="派彩" value="payout" />
          <el-option label="奖金" value="bonus" /><el-option label="调额" value="adjust" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px;" />
        <el-button type="primary" plain @click="ElMessage.success('导出中...')"><el-icon><Download /></el-icon>导出Excel</el-button>
      </div>
      <el-table :data="filteredFlows" stripe>
        <el-table-column prop="id" label="流水号" width="160" />
        <el-table-column prop="member" label="会员" width="120" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeColor(row.type)" size="small">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template #default="{ row }">
            <span :style="{ color: row.amount > 0 ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
              {{ row.amount > 0 ? '+' : '' }}¥{{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前余额" width="120">
          <template #default="{ row }">¥{{ row.beforeBalance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="变动后余额" width="120">
          <template #default="{ row }">¥{{ row.afterBalance.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination layout="total, prev, pager, next" :total="filteredFlows.length" :page-size="15" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const typeFilter = ref('')
const dateRange = ref(null)

const flows = ref([])

const filteredFlows = computed(() => flows.value.filter(f => {
  if (search.value && !f.member.includes(search.value) && !f.id.includes(search.value)) return false
  if (typeFilter.value && f.type !== typeFilter.value) return false
  return true
}))

function typeColor(t) { return { deposit: 'success', withdrawal: 'danger', bet: 'warning', payout: '', bonus: 'success', adjust: 'info' }[t] || 'info' }
function typeLabel(t) { return { deposit: '充值', withdrawal: '提现', bet: '投注', payout: '派彩', bonus: '奖金', adjust: '调额' }[t] || t }
</script>
