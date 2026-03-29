<template>
  <div>
    <h2 class="section-title">系统设置</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="全局配置" name="global">
        <div class="form-card">
          <el-form label-width="140px" style="max-width: 600px;">
            <el-form-item label="平台名称"><el-input v-model="settings.platformName" /></el-form-item>
            <el-form-item label="维护模式">
              <el-switch v-model="settings.maintenance" active-text="开启维护" inactive-text="正常运行" />
              <div v-if="settings.maintenance" style="color:#f56c6c; margin-top: 4px; font-size: 12px;">⚠ 维护模式开启后，所有代理前端将显示维护页面</div>
            </el-form-item>
            <el-form-item label="维护公告"><el-input v-model="settings.maintenanceMsg" type="textarea" :rows="2" :disabled="!settings.maintenance" /></el-form-item>
            <el-form-item label="新用户注册">
              <el-switch v-model="settings.allowRegister" active-text="允许" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="默认货币">
              <el-select v-model="settings.currency"><el-option label="CNY (人民币)" value="CNY" /><el-option label="USDT" value="USDT" /></el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="settings.timezone"><el-option label="Asia/Shanghai (UTC+8)" value="Asia/Shanghai" /><el-option label="UTC" value="UTC" /></el-select>
            </el-form-item>
            <el-divider />
            <el-form-item label="USDT刷新频率">
              <el-select v-model="settings.usdtRefreshInterval" style="width: 200px;">
                <el-option label="手动刷新" value="manual" />
                <el-option label="每小时" value="hourly" />
                <el-option label="每天" value="daily" />
              </el-select>
              <span v-if="settings.lastUsdtRefresh" style="margin-left: 12px; color: #a0a0b0; font-size: 12px;">
                上次刷新: {{ settings.lastUsdtRefresh }}
              </span>
            </el-form-item>
            <el-form-item label="提现审核阈值">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="settings.withdrawalReviewThreshold" :min="0" :step="1000" style="width: 200px;" />
                <span style="color: #a0a0b0;">CNY (超过此金额需人工审核)</span>
              </div>
            </el-form-item>
            <el-divider />
            <el-form-item label="VIP积分规则">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: #a0a0b0;">每投注 10 CNY = 1 积分 | 6个VIP等级</span>
                <el-button type="primary" text size="small" @click="$router.push('/super/vip')">前往VIP管理</el-button>
              </div>
            </el-form-item>
            <el-form-item label="返水设置">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: #a0a0b0;">VIP0: 0.5% ~ VIP5: 1.5% | 每日自动结算</span>
                <el-button type="primary" text size="small" @click="$router.push('/super/rakeback')">前往返水管理</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <div class="form-card">
          <el-form label-width="160px" style="max-width: 600px;">
            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="settings.maxLoginAttempts" :min="3" :max="10" />
            </el-form-item>
            <el-form-item label="会话超时(分钟)">
              <el-input-number v-model="settings.sessionTimeout" :min="15" :max="480" :step="15" />
            </el-form-item>
            <el-form-item label="强制双因素认证">
              <el-switch v-model="settings.force2FA" />
            </el-form-item>
            <el-form-item label="IP白名单(管理后台)">
              <el-input v-model="settings.adminIpWhitelist" type="textarea" :rows="3" placeholder="每行一个IP地址，留空则不限制" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="素材库" name="assets">
        <div class="table-card">
          <div class="page-header" style="margin-bottom: 0;">
            <span style="color: #a0a0b0;">Banner模板素材库 - 供代理使用</span>
            <el-button type="primary"><el-icon><Upload /></el-icon>上传素材</el-button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px;">
            <div v-for="(asset, i) in assets" :key="i" class="asset-card">
              <div class="asset-preview" :style="{ background: asset.color }">
                <span style="color: white; font-size: 18px; font-weight: bold;">{{ asset.name }}</span>
              </div>
              <div class="asset-info">
                <span>{{ asset.name }}</span>
                <span style="color: #888; font-size: 12px;">{{ asset.size }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="权限管理" name="permissions">
        <div class="table-card">
          <div style="margin-bottom: 16px; padding: 12px; background: #252538; border-radius: 8px; color: #a0a0b0; font-size: 13px;">
            <el-icon><InfoFilled /></el-icon>
            RBAC权限管理：为不同角色分配模块访问权限。superadmin拥有所有权限。
          </div>
          <el-tabs v-model="selectedRole" type="card">
            <el-tab-pane v-for="role in roles" :key="role.key" :label="role.label" :name="role.key">
              <el-table :data="rolePermissions[role.key] || []" stripe size="small">
                <el-table-column prop="module" label="模块" width="150">
                  <template #default="{ row }">{{ moduleLabel(row.module) }}</template>
                </el-table-column>
                <el-table-column label="查看" width="100" align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.canView" :disabled="role.key === 'superadmin'" />
                  </template>
                </el-table-column>
                <el-table-column label="创建" width="100" align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.canCreate" :disabled="role.key === 'superadmin'" />
                  </template>
                </el-table-column>
                <el-table-column label="编辑" width="100" align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.canEdit" :disabled="role.key === 'superadmin'" />
                  </template>
                </el-table-column>
                <el-table-column label="删除" width="100" align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.canDelete" :disabled="role.key === 'superadmin'" />
                  </template>
                </el-table-column>
              </el-table>
              <div style="margin-top: 16px;">
                <el-button type="primary" size="small" @click="savePermissions(role.key)" :disabled="role.key === 'superadmin'">保存权限</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, updateSettings, getPermissions, updatePermissions } from '@/api/system'

const activeTab = ref('global')
const selectedRole = ref('admin')
const settings = reactive({
  platformName: '',
  maintenance: false,
  maintenanceMsg: '',
  allowRegister: true,
  currency: 'CNY',
  timezone: 'Asia/Shanghai',
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  force2FA: false,
  adminIpWhitelist: '',
  usdtRefreshInterval: 'manual',
  lastUsdtRefresh: '',
  withdrawalReviewThreshold: 50000
})

const roles = [
  { key: 'superadmin', label: '超级管理员' },
  { key: 'admin', label: '管理员' },
  { key: 'finance', label: '财务' },
  { key: 'cs', label: '客服' },
  { key: 'risk', label: '风控' }
]

const permModules = ['dashboard', 'members', 'agents', 'finance', 'games', 'risk', 'system', 'compliance', 'vip', 'rakeback', 'messages']

const rolePermissions = reactive({})

const defaultPerms = {
  superadmin: permModules.map(m => ({ module: m, canView: true, canCreate: true, canEdit: true, canDelete: true })),
  admin: permModules.map(m => ({ module: m, canView: true, canCreate: m !== 'system', canEdit: m !== 'system', canDelete: false })),
  finance: permModules.map(m => ({ module: m, canView: ['dashboard', 'finance', 'members'].includes(m), canCreate: m === 'finance', canEdit: m === 'finance', canDelete: false })),
  cs: permModules.map(m => ({ module: m, canView: ['dashboard', 'members', 'messages'].includes(m), canCreate: ['messages'].includes(m), canEdit: ['members', 'messages'].includes(m), canDelete: false })),
  risk: permModules.map(m => ({ module: m, canView: ['dashboard', 'risk', 'compliance', 'members'].includes(m), canCreate: ['risk'].includes(m), canEdit: ['risk', 'compliance'].includes(m), canDelete: false }))
}

function moduleLabel(mod) {
  const map = {
    dashboard: '仪表盘', members: '会员管理', agents: '代理管理',
    finance: '财务管理', games: '游戏管理', risk: '风控管理',
    system: '系统设置', compliance: '合规管理', vip: 'VIP管理',
    rakeback: '返水管理', messages: '消息管理'
  }
  return map[mod] || mod
}

function applySettings(data) {
  if (!data || typeof data !== 'object') return
  // Handle grouped format: { global: {...}, security: {...}, finance: {...} }
  const flat = {}
  for (const [category, entries] of Object.entries(data)) {
    if (typeof entries === 'object' && entries !== null) {
      Object.assign(flat, entries)
    }
  }
  if (flat.site_name) settings.platformName = flat.site_name
  if (flat.platformName) settings.platformName = flat.platformName
  if (flat.maintenance_mode !== undefined) settings.maintenance = flat.maintenance_mode === 'true'
  if (flat.maintenance !== undefined) settings.maintenance = flat.maintenance === 'true'
  if (flat.maintenanceMsg) settings.maintenanceMsg = flat.maintenanceMsg
  if (flat.register_enabled !== undefined) settings.allowRegister = flat.register_enabled === 'true'
  if (flat.allowRegister !== undefined) settings.allowRegister = flat.allowRegister === 'true'
  if (flat.currency) settings.currency = flat.currency
  if (flat.timezone) settings.timezone = flat.timezone
  if (flat.maxLoginAttempts) settings.maxLoginAttempts = parseInt(flat.maxLoginAttempts) || 5
  if (flat.session_timeout) settings.sessionTimeout = parseInt(flat.session_timeout) || 120
  if (flat.sessionTimeout) settings.sessionTimeout = parseInt(flat.sessionTimeout) || 120
  if (flat.two_factor_enabled !== undefined) settings.force2FA = flat.two_factor_enabled === 'true'
  if (flat.force2FA !== undefined) settings.force2FA = flat.force2FA === 'true'
  if (flat.ip_whitelist_enabled !== undefined) settings.adminIpWhitelist = flat.adminIpWhitelist || ''
  if (flat.adminIpWhitelist) settings.adminIpWhitelist = flat.adminIpWhitelist
}

onMounted(async () => {
  try {
    const data = await getSettings()
    applySettings(data)
  } catch (e) { console.warn('API request failed', e) }

  // Load RBAC permissions
  try {
    for (const role of roles) {
      const perms = await getPermissions(role.key)
      if (perms && perms.length > 0) {
        rolePermissions[role.key] = perms.map(p => ({
          module: p.module,
          canView: Boolean(p.canView),
          canCreate: Boolean(p.canCreate),
          canEdit: Boolean(p.canEdit),
          canDelete: Boolean(p.canDelete)
        }))
      } else {
        rolePermissions[role.key] = defaultPerms[role.key] || []
      }
    }
  } catch (e) {
    console.warn('Failed to load permissions, using defaults', e)
    for (const role of roles) {
      rolePermissions[role.key] = defaultPerms[role.key] || []
    }
  }
})

const assets = ref([
  { name: '首充活动模板', size: '1920x600', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: '返水活动模板', size: '1920x600', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { name: '签到活动模板', size: '1920x600', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { name: '推荐好友模板', size: '1920x600', color: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { name: 'VIP晋级模板', size: '1920x600', color: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { name: '节日活动模板', size: '1920x600', color: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' }
])

async function save() {
  try {
    await updateSettings(settings)
    ElMessage.success('设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function savePermissions(role) {
  try {
    const perms = rolePermissions[role]
    await updatePermissions(role, perms)
    ElMessage.success('权限已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.asset-card { background: #1e1e2e; border-radius: 8px; overflow: hidden; }
.asset-preview { height: 120px; display: flex; align-items: center; justify-content: center; }
.asset-info { padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
</style>
