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
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, updateSettings } from '@/api/system'

const activeTab = ref('global')
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
  adminIpWhitelist: ''
})

onMounted(async () => {
  try {
    const data = await getSettings()
    if (data && Array.isArray(data)) {
      for (const item of data) {
        if (item.key === 'platformName') settings.platformName = item.value
        else if (item.key === 'maintenance') settings.maintenance = item.value === 'true'
        else if (item.key === 'maintenanceMsg') settings.maintenanceMsg = item.value
        else if (item.key === 'allowRegister') settings.allowRegister = item.value === 'true'
        else if (item.key === 'currency') settings.currency = item.value
        else if (item.key === 'timezone') settings.timezone = item.value
        else if (item.key === 'maxLoginAttempts') settings.maxLoginAttempts = parseInt(item.value) || 5
        else if (item.key === 'sessionTimeout') settings.sessionTimeout = parseInt(item.value) || 120
        else if (item.key === 'force2FA') settings.force2FA = item.value === 'true'
        else if (item.key === 'adminIpWhitelist') settings.adminIpWhitelist = item.value
      }
    }
  } catch (e) { console.warn('API request failed', e) }
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
</script>

<style scoped>
.asset-card { background: #1e1e2e; border-radius: 8px; overflow: hidden; }
.asset-preview { height: 120px; display: flex; align-items: center; justify-content: center; }
.asset-info { padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
</style>
