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
            <el-table-column label="IP归属" width="140">
              <template #default="{ row }">
                <span style="color: #606266;">{{ row.region || '未知' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="访问次数" width="100">
              <template #default="{ row }">
                <span style="font-weight: 600;">{{ row.hitCount || 0 }}</span>
              </template>
            </el-table-column>
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
          <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px;">风控规则配置</h3>
            <el-tag type="info" size="small">共 {{ rules.length }} 条规则 / {{ rules.filter(r => r.enabled).length }} 条启用</el-tag>
          </div>
          <el-table :data="rules" stripe>
            <el-table-column prop="name" label="规则名称" width="200">
              <template #default="{ row }">
                <span style="font-weight: 600;">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column label="触发条件" width="160">
              <template #default="{ row }">
                <el-tag size="small" type="info">阈值: {{ row.threshold }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="风险级别" width="100">
              <template #default="{ row }">
                <el-tag :type="row.severity === 'high' ? 'danger' : row.severity === 'medium' ? 'warning' : 'success'" size="small" effect="dark">
                  {{ row.severity === 'high' ? '高' : row.severity === 'medium' ? '中' : '低' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" active-text="启用" inactive-text="禁用" @change="toggleRule(row)" />
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
            <el-table-column label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag :type="row.level === 'high' ? 'danger' : row.level === 'medium' ? 'warning' : 'success'" size="small" effect="dark">
                  {{ row.level === 'high' ? '高危' : row.level === 'medium' ? '中危' : '低危' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="agent" label="代理" width="100" />
            <el-table-column label="IP地址" width="140">
              <template #default="{ row }">
                <span style="font-family: monospace;">{{ row.ip || '-' }}</span>
              </template>
            </el-table-column>
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
      <el-tab-pane label="实时警报" name="realtime">
        <div class="table-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 16px;">实时风控警报</h3>
            <el-tag type="success" size="small" effect="dark">• 实时监控中</el-tag>
          </div>
          <div v-if="!realtimeAlerts.length" style="text-align: center; padding: 40px; color: #909399;">暂无实时警报</div>
          <div v-else style="max-height: 500px; overflow-y: auto;">
            <div v-for="alert in realtimeAlerts" :key="alert.id" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #ebeef5; transition: background-color 0.2s;" @mouseenter="$event.currentTarget.style.backgroundColor='#f5f7fa'" @mouseleave="$event.currentTarget.style.backgroundColor='transparent'">
              <el-tag :type="alert.level === 'high' ? 'danger' : alert.level === 'medium' ? 'warning' : 'success'" size="small" effect="dark" style="flex-shrink: 0;">
                {{ alert.level === 'high' ? '高危' : alert.level === 'medium' ? '中危' : '低危' }}
              </el-tag>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">{{ alert.type }}</div>
                <div style="font-size: 12px; color: #909399;">{{ alert.description }} - {{ alert.member }}</div>
              </div>
              <div style="flex-shrink: 0; font-size: 12px; color: #c0c4cc;">{{ alert.time }}</div>
            </div>
          </div>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { getRiskRules, getBlacklist, addBlacklist, removeBlacklist } from '@/api/risk'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('ip')
const ipSearch = ref('')
const addIpDialog = ref(false)
const ips = ref([])
const rules = ref([])

onMounted(async () => {
  try {
    const [rulesData, blacklistData] = await Promise.all([getRiskRules(), getBlacklist()])
    if (rulesData?.length) rules.value = rulesData.map(r => ({ ...r, enabled: r.status === 'active' }))
    if (blacklistData?.length) ips.value = blacklistData.map(b => ({ ip: b.ip, reason: b.reason, addedBy: b.addedBy, addedAt: b.addedTime, type: 'blacklist' }))
  } catch (e) { console.warn('API request failed', e) }
})
const alerts = ref([])
const realtimeAlerts = ref([])
let realtimeTimer = null
const newIp = reactive({ ip: '', type: 'blacklist', reason: '' })

const filteredIps = computed(() => ips.value.filter(ip => !ipSearch.value || ip.ip.includes(ipSearch.value)))

const deviceBlacklist = ref([
  { fingerprint: 'fp_abc123def456', relatedAccounts: 3, accounts: 'user_1001, user_1005, user_1009', addedAt: '2026-03-05 14:00' },
  { fingerprint: 'fp_xyz789ghi012', relatedAccounts: 2, accounts: 'user_1003, user_1012', addedAt: '2026-03-04 09:30' },
  { fingerprint: 'fp_mno345pqr678', relatedAccounts: 4, accounts: 'user_1007, user_1008, user_1015, user_1020', addedAt: '2026-03-02 18:45' }
])

async function addIp() {
  try {
    await addBlacklist(newIp.ip, newIp.reason)
    ips.value.unshift({ ...newIp, addedBy: 'superadmin', addedAt: new Date().toLocaleString('zh-CN') })
    addIpDialog.value = false
    ElMessage.success('IP已添加')
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

function removeIp(row) {
  ElMessageBox.confirm(`确定移除 ${row.ip}?`, '确认', { type: 'warning' }).then(async () => {
    try {
      await removeBlacklist(row.ip)
      ips.value = ips.value.filter(ip => ip.ip !== row.ip)
      ElMessage.success('已移除')
    } catch (e) {
      ElMessage.error('移除失败')
    }
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

function toggleRule(rule) {
  ElMessage.success(`规则「${rule.name}」已${rule.enabled ? '启用' : '禁用'}`)
}

function startRealtimeFeed() {
  const sampleTypes = ['异常登录', '大额提现', '多设备登录', '频繁下注', '异常IP', '可疑充值']
  const sampleLevels = ['high', 'medium', 'low']
  const sampleMembers = ['M10001', 'M10005', 'M10012', 'M10088', 'M10023']
  realtimeTimer = setInterval(() => {
    if (realtimeAlerts.value.length >= 50) realtimeAlerts.value.pop()
    realtimeAlerts.value.unshift({
      id: Date.now(),
      type: sampleTypes[Math.floor(Math.random() * sampleTypes.length)],
      level: sampleLevels[Math.floor(Math.random() * sampleLevels.length)],
      member: sampleMembers[Math.floor(Math.random() * sampleMembers.length)],
      description: '系统自动检测到可疑活动',
      time: new Date().toLocaleString('zh-CN')
    })
  }, 5000)
}

startRealtimeFeed()

onBeforeUnmount(() => {
  if (realtimeTimer) clearInterval(realtimeTimer)
})
</script>
