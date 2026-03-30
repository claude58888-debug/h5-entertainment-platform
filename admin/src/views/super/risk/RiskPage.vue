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
            <el-table-column label="IP归属" width="140"><template #default="{ row }"><span style="color: #606266;">{{ row.region || '未知' }}</span></template></el-table-column>
            <el-table-column label="访问次数" width="100"><template #default="{ row }"><span style="font-weight: 600;">{{ row.hitCount || 0 }}</span></template></el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'blacklist' ? 'danger' : 'success'" size="small">{{ row.type === 'blacklist' ? '黑名单' : '白名单' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" />
            <el-table-column prop="addedBy" label="添加人" width="120" />
            <el-table-column prop="addedAt" label="添加时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }"><el-button size="small" type="danger" text @click="removeIp(row)">移除</el-button></template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="风控规则" name="rules">
        <div class="table-card">
          <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px;">风控规则配置</h3>
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-tag type="info" size="small">共 {{ rules.length }} 条规则 / {{ rules.filter(r => r.enabled).length }} 条启用</el-tag>
              <el-button type="primary" size="small" @click="openRuleDialog(null)"><el-icon><Plus /></el-icon>添加规则</el-button>
            </div>
          </div>
          <el-table :data="rules" stripe>
            <el-table-column prop="name" label="规则名称" width="200"><template #default="{ row }"><span style="font-weight: 600;">{{ row.name }}</span></template></el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column label="类型" width="120">
              <template #default="{ row }"><el-tag size="small" type="info">{{ row.ruleType || '通用' }}</el-tag></template>
            </el-table-column>
            <el-table-column label="触发条件" width="160"><template #default="{ row }"><el-tag size="small" type="info">阈值: {{ row.threshold }}</el-tag></template></el-table-column>
            <el-table-column label="风险级别" width="100">
              <template #default="{ row }">
                <el-tag :type="row.severity === 'high' ? 'danger' : row.severity === 'medium' ? 'warning' : 'success'" size="small" effect="dark">{{ row.severity === 'high' ? '高' : row.severity === 'medium' ? '中' : '低' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100"><template #default="{ row }"><el-switch v-model="row.enabled" size="small" @change="toggleRule(row)" /></template></el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <el-button size="small" type="primary" text @click="openRuleDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" text @click="deleteRuleHandler(row)">删除</el-button>
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
                <el-tag :type="row.level === 'high' ? 'danger' : row.level === 'medium' ? 'warning' : 'success'" size="small" effect="dark">{{ row.level === 'high' ? '高危' : row.level === 'medium' ? '中危' : '低危' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120"><template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag></template></el-table-column>
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="agent" label="代理" width="100" />
            <el-table-column label="IP地址" width="140"><template #default="{ row }"><span style="font-family: monospace;">{{ row.ip || '-' }}</span></template></el-table-column>
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

      <el-tab-pane label="异常投注" name="abnormal">
        <div class="table-card">
          <div style="margin-bottom: 16px;"><h3 style="margin: 0; font-size: 16px;">异常投注模式检测</h3></div>
          <el-table :data="abnormalBets" stripe>
            <el-table-column prop="member" label="会员" width="120" />
            <el-table-column prop="pattern" label="异常模式" width="160" />
            <el-table-column label="风险分数" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.riskScore" :color="row.riskScore >= 80 ? '#f56c6c' : row.riskScore >= 50 ? '#e6a23c' : '#67c23a'" :stroke-width="16" :text-inside="true" />
              </template>
            </el-table-column>
            <el-table-column label="投注金额" width="140"><template #default="{ row }">¥{{ row.betAmount.toLocaleString() }}</template></el-table-column>
            <el-table-column label="投注次数" width="100"><template #default="{ row }">{{ row.betCount }}</template></el-table-column>
            <el-table-column label="时间范围" width="160"><template #default="{ row }">{{ row.timeRange }}</template></el-table-column>
            <el-table-column prop="description" label="详情" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" type="warning" text @click="handleAlert(row, 'review')">审查</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="IP监控" name="ipMonitor">
        <div class="table-card">
          <div style="margin-bottom: 16px;"><h3 style="margin: 0; font-size: 16px;">同IP多账号监控</h3></div>
          <el-table :data="ipMonitorData" stripe>
            <el-table-column prop="ip" label="IP地址" width="160"><template #default="{ row }"><span style="font-family: monospace;">{{ row.ip }}</span></template></el-table-column>
            <el-table-column label="归属地" width="140"><template #default="{ row }">{{ row.region }}</template></el-table-column>
            <el-table-column label="关联账号数" width="120">
              <template #default="{ row }">
                <el-tag :type="row.accountCount >= 5 ? 'danger' : row.accountCount >= 3 ? 'warning' : 'success'" size="small" effect="dark">{{ row.accountCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联账号" min-width="200"><template #default="{ row }">{{ row.accounts.join(', ') }}</template></el-table-column>
            <el-table-column prop="lastActive" label="最后活跃" width="180" />
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="会员风险" name="memberRisk">
        <div class="table-card">
          <div style="margin-bottom: 16px;"><h3 style="margin: 0; font-size: 16px;">会员风险等级</h3></div>
          <el-table :data="memberRiskData" stripe>
            <el-table-column prop="memberId" label="会员ID" width="120" />
            <el-table-column prop="username" label="用户名" width="140" />
            <el-table-column label="风险等级" width="120">
              <template #default="{ row }">
                <el-tag :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'" size="small" effect="dark">
                  {{ row.riskLevel === 'high' ? '高风险' : row.riskLevel === 'medium' ? '中风险' : '低风险' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="风险分数" width="140">
              <template #default="{ row }">
                <el-progress :percentage="row.riskScore" :color="row.riskScore >= 70 ? '#f56c6c' : row.riskScore >= 40 ? '#e6a23c' : '#67c23a'" :stroke-width="16" :text-inside="true" />
              </template>
            </el-table-column>
            <el-table-column label="总投注" width="140"><template #default="{ row }">¥{{ row.totalBets.toLocaleString() }}</template></el-table-column>
            <el-table-column label="总提现" width="140"><template #default="{ row }">¥{{ row.totalWithdrawals.toLocaleString() }}</template></el-table-column>
            <el-table-column prop="riskFactors" label="风险因素" />
            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd) => updateRiskLevel(row, cmd)">
                  <el-button size="small" type="primary" text>调整等级<el-icon style="margin-left: 2px;"><ArrowDown /></el-icon></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="low">低风险</el-dropdown-item>
                      <el-dropdown-item command="medium">中风险</el-dropdown-item>
                      <el-dropdown-item command="high">高风险</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
            <el-table-column label="操作" width="100"><template #default="{ row }"><el-button size="small" type="danger" text @click="unbanDevice(row)">解封</el-button></template></el-table-column>
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
              <el-tag :type="alert.level === 'high' ? 'danger' : alert.level === 'medium' ? 'warning' : 'success'" size="small" effect="dark" style="flex-shrink: 0;">{{ alert.level === 'high' ? '高危' : alert.level === 'medium' ? '中危' : '低危' }}</el-tag>
              <div style="flex: 1; min-width: 0;"><div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">{{ alert.type }}</div><div style="font-size: 12px; color: #909399;">{{ alert.description }} - {{ alert.member }}</div></div>
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
            <el-radio value="blacklist">黑名单</el-radio><el-radio value="whitelist">白名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因"><el-input v-model="newIp.reason" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addIpDialog = false">取消</el-button>
        <el-button type="primary" @click="addIp">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialogVisible" :title="editingRule ? '编辑规则' : '添加规则'" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称" required><el-input v-model="ruleForm.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="ruleForm.description" type="textarea" /></el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.ruleType" style="width: 100%;">
            <el-option label="最大投注限制" value="max_bet" /><el-option label="最大提现限制" value="max_withdraw" />
            <el-option label="每日限额" value="daily_limit" /><el-option label="频率限制" value="frequency" />
            <el-option label="IP限制" value="ip_limit" /><el-option label="通用" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值"><el-input v-model="ruleForm.threshold" placeholder="例: ¥50000 或 10次/小时" /></el-form-item>
        <el-form-item label="风险级别">
          <el-radio-group v-model="ruleForm.severity">
            <el-radio value="low">低</el-radio><el-radio value="medium">中</el-radio><el-radio value="high">高</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">{{ editingRule ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { getRiskRules, getBlacklist, addBlacklist, removeBlacklist, createRiskRule, updateRiskRule, deleteRiskRule, getRiskAlerts, getIpMonitoring, getMemberRiskLevels, updateMemberRiskLevel as apiUpdateMemberRiskLevel } from '@/api/risk'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'

const activeTab = ref('ip')
const ipSearch = ref('')
const addIpDialog = ref(false)
const ips = ref([])
const rules = ref([])
const alerts = ref([])
const realtimeAlerts = ref([])
let realtimeTimer = null
const newIp = reactive({ ip: '', type: 'blacklist', reason: '' })
const ruleDialogVisible = ref(false)
const editingRule = ref(null)
const ruleForm = ref({ name: '', description: '', ruleType: 'general', threshold: '', severity: 'medium' })

const filteredIps = computed(() => ips.value.filter(ip => !ipSearch.value || ip.ip.includes(ipSearch.value)))

const abnormalBets = ref([
  { member: 'M10023', pattern: '马丁格尔策略', riskScore: 92, betAmount: 580000, betCount: 128, timeRange: '03-28 ~ 03-30', description: '连续加倍投注,疑似使用马丁格尔策略' },
  { member: 'M10088', pattern: '对冲投注', riskScore: 85, betAmount: 320000, betCount: 64, timeRange: '03-29 ~ 03-30', description: '在不同游戏中进行对冲投注' },
  { member: 'M10045', pattern: '异常频率', riskScore: 78, betAmount: 150000, betCount: 890, timeRange: '03-30', description: '短时间内大量小额投注' },
  { member: 'M10012', pattern: '异常时段', riskScore: 65, betAmount: 420000, betCount: 45, timeRange: '03-29 02:00-05:00', description: '凌晨异常大额投注' },
  { member: 'M10067', pattern: '规律投注', riskScore: 55, betAmount: 98000, betCount: 200, timeRange: '03-25 ~ 03-30', description: '固定金额固定时间投注' },
])

const ipMonitorData = ref([
  { ip: '203.156.78.12', region: '广东深圳', accountCount: 7, accounts: ['M10001', 'M10023', 'M10045', 'M10067', 'M10089', 'M10102', 'M10115'], lastActive: '2026-03-30 08:15' },
  { ip: '118.89.34.56', region: '上海', accountCount: 5, accounts: ['M10005', 'M10012', 'M10088', 'M10099', 'M10120'], lastActive: '2026-03-30 07:42' },
  { ip: '42.120.67.89', region: '浙江杭州', accountCount: 3, accounts: ['M10008', 'M10055', 'M10078'], lastActive: '2026-03-29 23:10' },
  { ip: '183.36.112.45', region: '广东广州', accountCount: 3, accounts: ['M10033', 'M10044', 'M10066'], lastActive: '2026-03-29 20:30' },
])

const memberRiskData = ref([
  { memberId: 'M10023', username: 'player_tiger', riskLevel: 'high', riskScore: 92, totalBets: 2800000, totalWithdrawals: 1500000, riskFactors: '马丁格尔策略, 多IP登录, 高额提现' },
  { memberId: 'M10088', username: 'lucky_star88', riskLevel: 'high', riskScore: 85, totalBets: 1650000, totalWithdrawals: 980000, riskFactors: '对冲投注, 频繁提现' },
  { memberId: 'M10045', username: 'fast_player', riskLevel: 'medium', riskScore: 65, totalBets: 890000, totalWithdrawals: 420000, riskFactors: '异常投注频率' },
  { memberId: 'M10012', username: 'night_owl', riskLevel: 'medium', riskScore: 58, totalBets: 1200000, totalWithdrawals: 650000, riskFactors: '凌晨大额投注' },
  { memberId: 'M10067', username: 'steady_bet', riskLevel: 'low', riskScore: 35, totalBets: 450000, totalWithdrawals: 180000, riskFactors: '规律投注模式' },
  { memberId: 'M10001', username: 'new_player1', riskLevel: 'low', riskScore: 15, totalBets: 120000, totalWithdrawals: 30000, riskFactors: '无异常' },
])

const deviceBlacklist = ref([
  { fingerprint: 'fp_abc123def456', relatedAccounts: 3, accounts: 'user_1001, user_1005, user_1009', addedAt: '2026-03-05 14:00' },
  { fingerprint: 'fp_xyz789ghi012', relatedAccounts: 2, accounts: 'user_1003, user_1012', addedAt: '2026-03-04 09:30' },
  { fingerprint: 'fp_mno345pqr678', relatedAccounts: 4, accounts: 'user_1007, user_1008, user_1015, user_1020', addedAt: '2026-03-02 18:45' },
])

onMounted(async () => {
  try {
    const [rulesData, blacklistData] = await Promise.all([getRiskRules(), getBlacklist()])
    if (rulesData?.length) rules.value = rulesData.map(r => ({ ...r, enabled: r.status === 'active' }))
    if (blacklistData?.length) ips.value = blacklistData.map(b => ({ ip: b.ip, reason: b.reason, addedBy: b.addedBy, addedAt: b.addedTime, type: 'blacklist' }))
  } catch (e) { console.warn('API request failed', e) }
  if (!rules.value.length) {
    rules.value = [
      { id: 1, name: '单笔最大投注', description: '单笔投注不得超过限额', ruleType: 'max_bet', threshold: '¥50,000', severity: 'high', enabled: true },
      { id: 2, name: '单日最大提现', description: '单日提现总额限制', ruleType: 'max_withdraw', threshold: '¥200,000', severity: 'high', enabled: true },
      { id: 3, name: '每日投注限额', description: '每日投注总额限制', ruleType: 'daily_limit', threshold: '¥500,000', severity: 'medium', enabled: true },
      { id: 4, name: '投注频率限制', description: '短时间内投注次数限制', ruleType: 'frequency', threshold: '100次/小时', severity: 'medium', enabled: true },
      { id: 5, name: '同IP注册限制', description: '同一IP注册账号数限制', ruleType: 'ip_limit', threshold: '3个/天', severity: 'low', enabled: false },
    ]
  }
})

async function addIp() {
  try {
    await addBlacklist(newIp.ip, newIp.reason)
    ips.value.unshift({ ...newIp, addedBy: 'superadmin', addedAt: new Date().toLocaleString('zh-CN') })
    addIpDialog.value = false
    ElMessage.success('IP已添加')
  } catch (e) { ElMessage.error('添加失败') }
}

function removeIp(row) {
  ElMessageBox.confirm('确定移除 ' + row.ip + '?', '确认', { type: 'warning' }).then(async () => {
    try { await removeBlacklist(row.ip); ips.value = ips.value.filter(ip => ip.ip !== row.ip); ElMessage.success('已移除') } catch (e) { ElMessage.error('移除失败') }
  }).catch(() => {})
}

function handleAlert(row, action) {
  if (action === 'freeze') {
    ElMessageBox.confirm('确定要冻结会员 ' + row.member + ' 的账户吗？', '确认冻结', { type: 'warning' }).then(() => { ElMessage.success('已冻结账户') }).catch(() => {})
  } else {
    const labels = { review: '标记为审查中', dismiss: '已忽略' }
    ElMessage.success(labels[action])
  }
}

function unbanDevice(row) {
  ElMessageBox.confirm('确定要解封设备 ' + row.fingerprint.substring(0, 16) + '... 吗？', '确认解封', { type: 'warning' }).then(() => {
    deviceBlacklist.value = deviceBlacklist.value.filter(d => d.fingerprint !== row.fingerprint)
    ElMessage.success('已解封设备')
  }).catch(() => {})
}

function toggleRule(rule) { ElMessage.success('规则「' + rule.name + '」已' + (rule.enabled ? '启用' : '禁用')) }

function openRuleDialog(rule) {
  editingRule.value = rule
  if (rule) {
    ruleForm.value = { ...rule }
  } else {
    ruleForm.value = { name: '', description: '', ruleType: 'general', threshold: '', severity: 'medium' }
  }
  ruleDialogVisible.value = true
}

async function saveRule() {
  if (!ruleForm.value.name) { ElMessage.warning('请输入规则名称'); return }
  try {
    if (editingRule.value) {
      await updateRiskRule(editingRule.value.id, ruleForm.value)
      const idx = rules.value.findIndex(r => r.id === editingRule.value.id)
      if (idx !== -1) rules.value[idx] = { ...rules.value[idx], ...ruleForm.value }
      ElMessage.success('规则已更新')
    } else {
      const res = await createRiskRule(ruleForm.value)
      rules.value.push({ ...ruleForm.value, id: res?.id || Date.now(), enabled: true })
      ElMessage.success('规则已添加')
    }
    ruleDialogVisible.value = false
  } catch (e) { ElMessage.error('操作失败') }
}

function deleteRuleHandler(rule) {
  ElMessageBox.confirm('确定删除规则「' + rule.name + '」吗？', '确认删除', { type: 'warning' }).then(async () => {
    try { await deleteRiskRule(rule.id); rules.value = rules.value.filter(r => r.id !== rule.id); ElMessage.success('已删除') } catch (e) { ElMessage.error('删除失败') }
  }).catch(() => {})
}

async function updateRiskLevel(row, level) {
  try {
    await apiUpdateMemberRiskLevel(row.memberId, level)
    row.riskLevel = level
    const labels = { low: '低风险', medium: '中风险', high: '高风险' }
    ElMessage.success('已调整为' + labels[level])
  } catch (e) { ElMessage.error('调整失败') }
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
onBeforeUnmount(() => { if (realtimeTimer) clearInterval(realtimeTimer) })
</script>
