<template>
  <div>
    <h2 class="section-title">合规管理总览</h2>

    <el-row :gutter="16" style="margin-bottom: 24px;">
      <el-col :span="6">
        <div class="kpi-card kpi-warning">
          <div class="kpi-value">{{ kpi.kycPending }}</div>
          <div class="kpi-label">KYC待审核</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card kpi-success">
          <div class="kpi-value">{{ kpi.kycApproved }}</div>
          <div class="kpi-label">KYC已通过</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card kpi-danger">
          <div class="kpi-value">{{ kpi.amlOpenAlerts }}</div>
          <div class="kpi-label">AML待处理</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card kpi-info">
          <div class="kpi-value">{{ kpi.selfExcludedUsers }}</div>
          <div class="kpi-label">自我排除用户</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-bottom: 24px;">
      <el-col :span="6">
        <div class="kpi-card">
          <div class="kpi-value">{{ kpi.kycTotal }}</div>
          <div class="kpi-label">KYC总提交</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card">
          <div class="kpi-value">{{ kpi.kycRejected }}</div>
          <div class="kpi-label">KYC已拒绝</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card">
          <div class="kpi-value">{{ kpi.amlTotalAlerts }}</div>
          <div class="kpi-label">AML总警报</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card">
          <div class="kpi-value">{{ kpi.usersWithLimits }}</div>
          <div class="kpi-label">设置限额用户</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="table-card">
          <h3 style="margin-bottom: 16px; color: #e0e0e0;">最近KYC提交</h3>
          <el-table :data="recentKyc" stripe size="small">
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="documentType" label="文档类型" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'" size="small">
                  {{ row.status === 'approved' ? '已通过' : row.status === 'rejected' ? '已拒绝' : '待审核' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="table-card">
          <h3 style="margin-bottom: 16px; color: #e0e0e0;">最近AML警报</h3>
          <el-table :data="recentAlerts" stripe size="small">
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="alertType" label="类型" width="120" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.amount?.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'open' ? 'danger' : 'info'" size="small">
                  {{ row.status === 'open' ? '待处理' : '已处理' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getComplianceDashboard } from '@/api/compliance'

const kpi = reactive({
  kycPending: 0,
  kycApproved: 0,
  kycRejected: 0,
  kycTotal: 0,
  amlOpenAlerts: 0,
  amlTotalAlerts: 0,
  selfExcludedUsers: 0,
  selfExcludedTotal: 0,
  usersWithLimits: 0
})
const recentAlerts = ref([])
const recentKyc = ref([])

onMounted(async () => {
  try {
    const data = await getComplianceDashboard()
    if (data?.kpi) Object.assign(kpi, data.kpi)
    if (data?.recentAlerts) recentAlerts.value = data.recentAlerts
    if (data?.recentKyc) recentKyc.value = data.recentKyc
  } catch (e) {
    console.warn('Failed to load compliance dashboard', e)
  }
})
</script>

<style scoped>
.kpi-card {
  background: #1e1e3a;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #2a2a4a;
}
.kpi-card.kpi-warning { border-left: 4px solid #e6a23c; }
.kpi-card.kpi-success { border-left: 4px solid #67c23a; }
.kpi-card.kpi-danger { border-left: 4px solid #f56c6c; }
.kpi-card.kpi-info { border-left: 4px solid #409eff; }
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #e0e0e0;
}
.kpi-label {
  font-size: 13px;
  color: #a0a0b0;
  margin-top: 4px;
}
</style>
