<template>
  <div>
    <h2 class="section-title">账户设置</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="品牌信息" name="brand">
        <div class="form-card">
          <el-form label-width="120px" style="max-width: 600px;">
            <el-form-item label="品牌名称"><el-input v-model="brand.name" /></el-form-item>
            <el-form-item label="域名"><el-input v-model="brand.domain" /></el-form-item>
            <el-form-item label="联系人"><el-input v-model="brand.contact" /></el-form-item>
            <el-form-item label="品牌Logo">
              <el-upload action="#" :auto-upload="false" list-type="picture-card" :limit="1">
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="主题色"><el-color-picker v-model="brand.themeColor" /></el-form-item>
            <el-form-item><el-button type="primary" @click="ElMessage.success('品牌信息已保存')">保存</el-button></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <div class="form-card">
          <el-form :model="pwdForm" :rules="pwdRules" ref="pwdRef" label-width="120px" style="max-width: 500px;">
            <el-form-item label="当前密码" prop="current"><el-input v-model="pwdForm.current" type="password" show-password /></el-form-item>
            <el-form-item label="新密码" prop="newPwd"><el-input v-model="pwdForm.newPwd" type="password" show-password /></el-form-item>
            <el-form-item label="确认密码" prop="confirm"><el-input v-model="pwdForm.confirm" type="password" show-password /></el-form-item>
            <el-form-item><el-button type="primary" @click="changePwd">修改密码</el-button></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="双因素认证" name="2fa">
        <div class="form-card">
          <div style="max-width: 500px;">
            <el-alert :title="twoFA.enabled ? '双因素认证已开启' : '双因素认证未开启'" :type="twoFA.enabled ? 'success' : 'warning'" show-icon style="margin-bottom: 20px;" />
            <div v-if="!twoFA.enabled">
              <p style="color: #a0a0b0; margin-bottom: 16px;">开启双因素认证可以增强账户安全性。启用后每次登录需要输入验证码。</p>
              <div style="text-align: center; padding: 20px; background: #1e1e2e; border-radius: 8px; margin-bottom: 16px;">
                <div style="width: 160px; height: 160px; background: white; border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #333;">
                  QR Code
                </div>
                <p style="margin-top: 12px; color: #888; font-size: 12px;">使用 Google Authenticator 扫描二维码</p>
              </div>
              <el-form label-width="90px">
                <el-form-item label="验证码"><el-input v-model="twoFA.code" placeholder="输入6位验证码" maxlength="6" /></el-form-item>
                <el-form-item><el-button type="primary" @click="twoFA.enabled = true; ElMessage.success('双因素认证已开启')">启用</el-button></el-form-item>
              </el-form>
            </div>
            <div v-else>
              <el-button type="danger" @click="twoFA.enabled = false; ElMessage.success('双因素认证已关闭')">关闭双因素认证</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <div class="table-card">
          <el-table :data="operationLogs" stripe>
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="action" label="操作" width="200" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="detail" label="详情" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('brand')
const brand = reactive({ name: '金沙娱乐', domain: 'jinsha.com', contact: '@jinsha_admin', themeColor: '#e6a23c' })
const pwdRef = ref(null)
const pwdForm = reactive({ current: '', newPwd: '', confirm: '' })
const pwdRules = {
  current: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPwd: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirm: [{ required: true, message: '请确认密码', trigger: 'blur' }, {
    validator: (rule, value, callback) => { value !== pwdForm.newPwd ? callback(new Error('两次密码不一致')) : callback() }, trigger: 'blur'
  }]
}
const twoFA = reactive({ enabled: false, code: '' })

const operationLogs = ref([
  { time: '2026-03-07 15:30', action: '登录', ip: '103.45.67.89', detail: '登录成功' },
  { time: '2026-03-07 14:20', action: '修改密码', ip: '103.45.67.89', detail: '密码修改成功' },
  { time: '2026-03-07 10:00', action: '会员调额', ip: '103.45.67.89', detail: 'player_001 +¥5,000' },
  { time: '2026-03-06 18:30', action: '审批提现', ip: '103.45.67.89', detail: '批准 W20260306001 ¥8,000' },
  { time: '2026-03-06 15:00', action: '创建活动', ip: '103.45.67.89', detail: '首充奖金活动' },
  { time: '2026-03-06 09:00', action: '登录', ip: '103.45.67.89', detail: '登录成功' }
])

async function changePwd() {
  await pwdRef.value?.validate()
  ElMessage.success('密码修改成功')
  pwdForm.current = ''; pwdForm.newPwd = ''; pwdForm.confirm = ''
}
</script>
