<template>
  <div>
    <h2 class="section-title">负责任博彩设置</h2>

    <el-form :model="form" label-width="200px" class="table-card" style="padding: 24px;">
      <h3 style="color: #e0e0e0; margin-bottom: 20px;">充值限额默认值</h3>
      <el-form-item label="每日充值限额 (¥)">
        <el-input-number v-model="form.default_daily_deposit_limit" :min="0" :step="1000" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="每周充值限额 (¥)">
        <el-input-number v-model="form.default_weekly_deposit_limit" :min="0" :step="5000" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="每月充值限额 (¥)">
        <el-input-number v-model="form.default_monthly_deposit_limit" :min="0" :step="10000" style="width: 200px;" />
      </el-form-item>

      <el-divider />

      <h3 style="color: #e0e0e0; margin-bottom: 20px;">投注限额默认值</h3>
      <el-form-item label="每日投注限额 (¥)">
        <el-input-number v-model="form.default_daily_bet_limit" :min="0" :step="1000" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="每周投注限额 (¥)">
        <el-input-number v-model="form.default_weekly_bet_limit" :min="0" :step="5000" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="每月投注限额 (¥)">
        <el-input-number v-model="form.default_monthly_bet_limit" :min="0" :step="10000" style="width: 200px;" />
      </el-form-item>

      <el-divider />

      <h3 style="color: #e0e0e0; margin-bottom: 20px;">冷却期与年龄验证</h3>
      <el-form-item label="冷却期选项">
        <el-input v-model="form.cooling_off_periods" placeholder="24h,7d,30d,6m,permanent" style="width: 400px;" />
        <div style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">用逗号分隔多个选项</div>
      </el-form-item>
      <el-form-item label="年龄验证">
        <el-switch v-model="ageVerificationEnabled" active-text="启用" inactive-text="禁用" />
      </el-form-item>
      <el-form-item label="最低年龄">
        <el-input-number v-model="form.minimum_age" :min="16" :max="25" style="width: 200px;" />
      </el-form-item>

      <el-divider />

      <h3 style="color: #e0e0e0; margin-bottom: 20px;">AML设置</h3>
      <el-form-item label="AML警报阈值 (¥)">
        <el-input-number v-model="form.aml_threshold" :min="0" :step="1000" style="width: 200px;" />
        <div style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">超过此金额的交易将触发AML警报</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getComplianceSettings, updateComplianceSettings } from '@/api/compliance'
import { ElMessage } from 'element-plus'

const saving = ref(false)
const form = reactive({
  default_daily_deposit_limit: 50000,
  default_weekly_deposit_limit: 200000,
  default_monthly_deposit_limit: 500000,
  default_daily_bet_limit: 100000,
  default_weekly_bet_limit: 500000,
  default_monthly_bet_limit: 1000000,
  cooling_off_periods: '24h,7d,30d,6m,permanent',
  age_verification_required: 'true',
  minimum_age: 18,
  aml_threshold: 10000
})

const ageVerificationEnabled = computed({
  get: () => form.age_verification_required === 'true',
  set: (val) => { form.age_verification_required = val ? 'true' : 'false' }
})

onMounted(async () => {
  try {
    const data = await getComplianceSettings()
    if (data?.responsible_gaming) {
      const s = data.responsible_gaming
      form.default_daily_deposit_limit = Number(s.default_daily_deposit_limit) || 50000
      form.default_weekly_deposit_limit = Number(s.default_weekly_deposit_limit) || 200000
      form.default_monthly_deposit_limit = Number(s.default_monthly_deposit_limit) || 500000
      form.default_daily_bet_limit = Number(s.default_daily_bet_limit) || 100000
      form.default_weekly_bet_limit = Number(s.default_weekly_bet_limit) || 500000
      form.default_monthly_bet_limit = Number(s.default_monthly_bet_limit) || 1000000
      form.cooling_off_periods = s.cooling_off_periods || '24h,7d,30d,6m,permanent'
      form.age_verification_required = s.age_verification_required || 'true'
      form.minimum_age = Number(s.minimum_age) || 18
      form.aml_threshold = Number(s.aml_threshold) || 10000
    }
  } catch (e) {
    console.warn('Failed to load settings', e)
  }
})

async function saveSettings() {
  saving.value = true
  try {
    await updateComplianceSettings({
      responsible_gaming: {
        default_daily_deposit_limit: String(form.default_daily_deposit_limit),
        default_weekly_deposit_limit: String(form.default_weekly_deposit_limit),
        default_monthly_deposit_limit: String(form.default_monthly_deposit_limit),
        default_daily_bet_limit: String(form.default_daily_bet_limit),
        default_weekly_bet_limit: String(form.default_weekly_bet_limit),
        default_monthly_bet_limit: String(form.default_monthly_bet_limit),
        cooling_off_periods: form.cooling_off_periods,
        age_verification_required: form.age_verification_required,
        minimum_age: String(form.minimum_age),
        aml_threshold: String(form.aml_threshold)
      }
    })
    ElMessage.success('设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>
