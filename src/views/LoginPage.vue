<template>
  <div class="login-page">
    <div class="page-header">
      <h2>{{ t('auth.loginTitle') }}</h2>
    </div>
    <van-form @submit="onSubmit" class="auth-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
          :label="t('auth.phone')"
          :placeholder="t('auth.phonePlaceholder')"
          type="tel"
          maxlength="11"
          :rules="[{ required: true, message: t('auth.phonePlaceholder') }]"
        />
        <van-field
          v-model="password"
          name="password"
          :label="t('auth.password')"
          :placeholder="t('auth.passwordPlaceholder')"
          :type="showPassword ? 'text' : 'password'"
          :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPassword = !showPassword"
          :rules="[{ required: true, message: t('auth.passwordPlaceholder') }]"
        />
      </van-cell-group>
      <div class="form-actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          {{ t('common.login') }}
        </van-button>
      </div>
      <div class="form-footer">
        <span>{{ t('auth.noAccount') }}</span>
        <router-link to="/register">{{ t('auth.goRegister') }}</router-link>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await userStore.login(phone.value, password.value)
    showToast({ message: t('auth.loginSuccess'), type: 'success' })
    router.push('/home')
  } catch (e) {
    showToast({ message: e.message || t('common.error'), type: 'fail' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  padding: 40px 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 24px;
    background: linear-gradient(135deg, $accent-purple-light, $accent-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.auth-form {
  :deep(.van-cell-group--inset) {
    margin: 0;
    background: transparent;
  }
  :deep(.van-cell) {
    background: $bg-card;
    margin-bottom: 12px;
    border-radius: 8px;
  }
}

.form-actions {
  margin-top: 32px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: $text-secondary;

  a {
    color: $accent-purple-light;
    margin-left: 4px;
  }
}
</style>
