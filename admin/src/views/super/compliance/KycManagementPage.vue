<template>
  <div>
    <h2 class="section-title">KYC管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <el-select v-model="statusFilter" placeholder="筛选状态" style="width: 160px;" clearable @change="loadData">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
      <el-table :data="kycList" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="userId" label="会员ID" width="100" />
        <el-table-column prop="documentType" label="文档类型" width="120">
          <template #default="{ row }">
            {{ docTypeLabels[row.documentType] || row.documentType }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'approved' ? '已通过' : row.status === 'rejected' ? '已拒绝' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="180" />
        <el-table-column prop="reviewedBy" label="审核人" width="100" />
        <el-table-column prop="reviewedAt" label="审核时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" text @click="handleReview(row, 'approve')">通过</el-button>
              <el-button size="small" type="danger" text @click="handleReview(row, 'reject')">拒绝</el-button>
            </template>
            <el-button size="small" type="primary" text @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="rejectDialog" title="拒绝KYC" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectReason" type="textarea" rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog" title="KYC详情" width="500px">
      <el-descriptions :column="1" border v-if="selectedKyc">
        <el-descriptions-item label="用户ID">{{ selectedKyc.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ selectedKyc.username }}</el-descriptions-item>
        <el-descriptions-item label="文档类型">{{ docTypeLabels[selectedKyc.documentType] || selectedKyc.documentType }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedKyc.status === 'approved' ? 'success' : selectedKyc.status === 'rejected' ? 'danger' : 'warning'" size="small">
            {{ selectedKyc.status === 'approved' ? '已通过' : selectedKyc.status === 'rejected' ? '已拒绝' : '待审核' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ selectedKyc.submittedAt }}</el-descriptions-item>
        <el-descriptions-item label="审核人" v-if="selectedKyc.reviewedBy">{{ selectedKyc.reviewedBy }}</el-descriptions-item>
        <el-descriptions-item label="审核时间" v-if="selectedKyc.reviewedAt">{{ selectedKyc.reviewedAt }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" v-if="selectedKyc.rejectReason">{{ selectedKyc.rejectReason }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKycList, reviewKyc } from '@/api/compliance'
import { ElMessage, ElMessageBox } from 'element-plus'

const statusFilter = ref('')
const kycList = ref([])
const rejectDialog = ref(false)
const detailDialog = ref(false)
const rejectReason = ref('')
const selectedKyc = ref(null)
const pendingRejectId = ref(null)

const docTypeLabels = {
  id_card: '身份证',
  passport: '护照',
  driver_license: '驾照',
  utility_bill: '水电账单'
}

async function loadData() {
  try {
    const data = await getKycList(statusFilter.value)
    if (data) kycList.value = data
  } catch (e) {
    console.warn('Failed to load KYC list', e)
  }
}

onMounted(loadData)

async function handleReview(row, action) {
  if (action === 'approve') {
    ElMessageBox.confirm(`确定通过用户 ${row.username} 的KYC审核？`, '确认通过', { type: 'success' }).then(async () => {
      try {
        await reviewKyc(row.id, 'approve')
        ElMessage.success('KYC已通过')
        loadData()
      } catch (e) {
        ElMessage.error('操作失败')
      }
    }).catch(() => {})
  } else {
    pendingRejectId.value = row.id
    rejectReason.value = ''
    rejectDialog.value = true
  }
}

async function confirmReject() {
  try {
    await reviewKyc(pendingRejectId.value, 'reject', rejectReason.value)
    ElMessage.success('KYC已拒绝')
    rejectDialog.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

function viewDetail(row) {
  selectedKyc.value = row
  detailDialog.value = true
}
</script>
