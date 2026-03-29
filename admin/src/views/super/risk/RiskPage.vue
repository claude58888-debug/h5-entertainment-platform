<template>
  <div>
    <h2 class="section-title">风控管理</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="IP黑名单" name="ip">
        <div class="table-card">
          <div class="page-header" style="margin-bottom: 0;">
            <el-input v-model="ipSearch" placeholder="搜索IP地址" style="width: 240px;" clearable prefix-icon="Search" />
            <el-button type="primary" @click="addIpDialog = true"><el-icon><Plus /></el-icon>添加IP</el-button>
          </div>
          <el-table :data="filteredIps" stripe style="margin-top: 16px;">
            <el-table-column prop="ip" label="IP地址" width="160" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'blacklist' ? 'danger' : 'success'" size="small">{{ row.type === 'blacklist' ? '黑名单' : '白名单' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" />
            <el-table-column prop="addedBy" label="添加人" width="120" />
            <el-table-column prop="addedAt" label="添加时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" type="danger" text @click="removeIp(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="风控规则" name="rules">
        <div class="table-card">
          <el-table :data="rules" stripe>
            <el-table-column prop="name" label="规则名称" width="200" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="阈值" width="120">
              <template #default="{ row }">{{ row.threshold }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default>
                <el-button size="small" type="primary" text>编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="可疑活动" name="alerts">
        <div class="table-card">
          <el-table :data="alerts" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="agent" label="代理" width="100" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" type="warning" text @click="handleAlert(row, 'review')">审查</el-button>
                <el-button size="small" type="danger" text @click="handleAlert(row, 'freeze')">冻结账户</el-button>
                <el-button size="small" type="success" text @click="handleAlert(row, 'dismiss')">忽略</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="设备指纹" name="device">
        <div class="table-card">
          <el-table :data="deviceBlacklist" stripe>
            <el-table-column prop="fingerprint" label="设备指纹" width="260" show-overflow-tooltip />
            <el-table-column prop="relatedAccounts" label="关联账号数" width="110" />
            <el-table-column prop="accounts" label="关联账号" show-overflow-tooltip />
            <el-table-column prop="addedAt" label="封禁时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" type="danger" text @click="unbanDevice(row)">解封</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="addIpDialog" title="添加IP" width="400px">
      <el-form label-width="80px">
        <el-form-item label="IP地址"><el-input v-model="newIp.ip" placeholder="例: 192.168.1.100" /></el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="newIp.type">
            <el-radio value="blacklist">黑名单</el-radio>
            <el-radio value="whitelist">白名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因"><el-input v-model="newIp.reason" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addIpDialog = false">取消</el-button>
        <el-button type="primary" @click="addIp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getRiskRules, getBlacklist, addBlacklist, removeBlacklist } from '@/api/risk'
import { riskRules, ipBlacklist, realtimeAlerts } from '@/mock/data'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('ip')
const ipSearch = ref('')
const addIpDialog = ref(false)
const ips = ref([...ipBlacklist])
const rules = ref([...riskRules])

onMounted(async () => {
  try {
    const [rulesData, blacklistData] = await Promise.all([getRiskRules(), getBlacklist()])
    if (rulesData?.length) rules.value = rulesData.map(r => ({ ...r, enabled: r.status === 'active' }))
    if (blacklistData?.length) ips.value = blacklistData.map(b => ({ ip: b.ip, reason: b.reason, addedBy: b.addedBy, addedAt: b.addedTime, type: 'blacklist' }))
  } catch (e) { console.warn('Risk API failed, using mock data', e) }
})
const alerts = ref(realtimeAlerts.map((a, i) => ({ ...a, id: i + 1, member: ['user_' + (1000 + i)][0], agent: ['金沙娱乐', '皇冠体育', '新濠天地'][i % 3] })))
const newIp = reactive({ ip: '', type: 'blacklist', reason: '' })

const filteredIps = computed(() => ips.value.filter(ip => !ipSearch.value || ip.ip.includes(ipSearch.value)))

const deviceBlacklist = ref([
  { fingerprint: 'fp_abc123def456', relatedAccounts: 3, accounts: 'user_1001, user_1005, user_1009', addedAt: '2026-03-05 14:00' },
  { fingerprint: 'fp_xyz789ghi012', relatedAccounts: 2, accounts: 'user_1003, user_1012', addedAt: '2026-03-04 09:30' },
  { fingerprint: 'fp_mno345pqr678', relatedAccounts: 4, accounts: 'user_1007, user_1008, user_1015, user_1020', addedAt: '2026-03-02 18:45' }
])

function addIp() {
  ips.value.unshift({ ...newIp, addedBy: 'superadmin', addedAt: new Date().toLocaleString('zh-CN') })
  addIpDialog.value = false
  ElMessage.success('IP已添加')
}

function removeIp(row) {
  ElMessageBox.confirm(`确定移除 ${row.ip}?`, '确认', { type: 'warning' }).then(() => {
    ips.value = ips.value.filter(ip => ip.ip !== row.ip)
    ElMessage.success('已移除')
  }).catch(() => {})
}

function handleAlert(row, action) {
  if (action === 'freeze') {
    ElMessageBox.confirm(`确定要冻结会员 ${row.member} 的账户吗？此操作将立即生效。`, '确认冻结', { type: 'warning', confirmButtonText: '确定冻结', cancelButtonText: '取消' }).then(() => {
      ElMessage.success('已冻结账户')
    }).catch(() => {})
  } else {
    const labels = { review: '标记为审查中', dismiss: '已忽略' }
    ElMessage.success(labels[action])
  }
}

function unbanDevice(row) {
  ElMessageBox.confirm(`确定要解封设备 ${row.fingerprint.substring(0, 16)}... 吗？关联的 ${row.relatedAccounts} 个账号将恢复正常。`, '确认解封', { type: 'warning' }).then(() => {
    deviceBlacklist.value = deviceBlacklist.value.filter(d => d.fingerprint !== row.fingerprint)
    ElMessage.success('已解封设备')
  }).catch(() => {})
}
</script>
