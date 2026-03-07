<template>
  <div>
    <h2 class="section-title">游戏厂商管理</h2>
    <div class="table-card">
      <el-table :data="providers" stripe>
        <el-table-column prop="code" label="厂商代码" width="100" />
        <el-table-column prop="name" label="厂商名称" width="140" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="游戏数" width="80">
          <template #default="{ row }">{{ row.gameCount }}</template>
        </el-table-column>
        <el-table-column label="余额" width="130">
          <template #default="{ row }">¥{{ row.balance?.toLocaleString() || '0' }}</template>
        </el-table-column>
        <el-table-column label="API响应" width="100">
          <template #default="{ row }">
            <el-tag :type="row.apiHealth > 95 ? 'success' : row.apiHealth > 80 ? 'warning' : 'danger'" size="small">{{ row.apiHealth }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="响应时间" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.apiLatency < 200 ? '#67c23a' : row.apiLatency < 500 ? '#e6a23c' : '#f56c6c' }">{{ row.apiLatency }}ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="apiKey" label="API Key" width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="configApi(row)">API配置</el-button>
            <el-button size="small" type="warning" text>余额查询</el-button>
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" size="small" style="margin-left: 8px;" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <h3 class="section-title" style="margin-top: 24px;">API健康监控</h3>
    <div class="chart-container">
      <v-chart :option="healthChart" style="height: 300px;" autoresize />
    </div>

    <el-dialog v-model="apiDialog" title="API配置" width="500px">
      <el-form label-width="100px">
        <el-form-item label="厂商">{{ currentProvider.name }}</el-form-item>
        <el-form-item label="API Key"><el-input v-model="currentProvider.apiKey" /></el-form-item>
        <el-form-item label="API Secret"><el-input v-model="apiSecret" type="password" show-password /></el-form-item>
        <el-form-item label="API地址"><el-input v-model="apiUrl" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="apiDialog = false">取消</el-button>
        <el-button type="primary" @click="apiDialog = false; ElMessage.success('API配置已保存')">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { gameProviders } from '@/mock/data'
import { ElMessage } from 'element-plus'

const providers = ref([...gameProviders])
const apiDialog = ref(false)
const currentProvider = ref({})
const apiSecret = ref('••••••••••••')
const apiUrl = ref('https://api.provider.com/v1')

function configApi(row) { currentProvider.value = row; apiDialog.value = true }

const healthChart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: providers.value.slice(0, 5).map(p => p.code), textStyle: { color: '#a0a0b0' } },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLabel: { color: '#888' } },
  yAxis: { type: 'value', min: 80, max: 100, axisLabel: { color: '#888', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#2a2a3e' } } },
  series: providers.value.slice(0, 5).map(p => ({
    name: p.code, type: 'line', smooth: true,
    data: Array(7).fill(0).map(() => (95 + Math.random() * 5).toFixed(1))
  }))
}))
</script>
