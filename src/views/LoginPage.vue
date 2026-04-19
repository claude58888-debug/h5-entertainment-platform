<template>
  <div class="login-page">
    <div class="logo-wrap">
      <div class="logo-square">DD</div>
      <div class="brand-name">H5 Entertainment</div>
      <div class="brand-sub">{{ t('auth.loginTitle') }}</div>
    </div>

    <van-form @submit="onSubmit" class="auth-form">
      <div class="field-group">
        <van-field
          v-model="phone"
          name="phone"
          :placeholder="t('auth.phonePlaceholder')"
          type="tel"
          maxlength="11"
          left-icon="phone-o"
          :rules="[{ required: true, message: t('auth.phonePlaceholder') }]"
        />
        <van-field
          v-model="password"
          name="password"
          :placeholder="t('auth.passwordPlaceholder')"
          :type="showPassword ? 'text' : 'password'"
          left-icon="lock"
          :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPassword = !showPassword"
          :rules="[{ required: true, message: t('auth.passwordPlaceholder') }]"
        />
      </div>
      <div class="form-actions">
        <van-button round block native-type="submit" :loading="loading" class="gold-btn">
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
  min-height: 100vh;
  padding: 56px 20px 40px;
  background:
    radial-gradient(600px 300px at 50% 0%, rgba(201, 166, 84, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, #0a0e1a 0%, #111827 100%);
}

.logo-wrap {
  text-align: center;
  margin-bottom: 40px;
}

.logo-square {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: 18px;
  background: $gold-gradient;
  color: #1a1407;
  font-weight: 900;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(201, 166, 84, 0.4);
  letter-spacing: 1px;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 13px;
  color: $text-muted;
  margin-top: 4px;
}

.auth-form {
  max-width: 420px;
  margin: 0 auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 14px;

  :deep(.van-field) {
    background: $glass-bg;
    border: $glass-border;
    backdrop-filter: blur($glass-blur);
    -webkit-backdrop-filter: blur($glass-blur);
    border-radius: $radius-md;
    padding: 14px 16px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &::after {
      display: none;
    }

    &:focus-within {
      border-color: $gold;
      box-shadow: 0 0 0 3px rgba(201, 166, 84, 0.18);
    }

    .van-field__left-icon {
      color: $gold-light;
      margin-right: 8px;
    }

    .van-field__right-icon {
      color: $text-muted;
    }

    input {
      color: $text-primary;
      caret-color: $gold-light;
      font-size: 15px;

      &::placeholder {
        color: $text-muted;
      }
    }
  }
}

.form-actions {
  margin-top: 28px;
}

.gold-btn {
  background: $gold-gradient !important;
  border: none !important;
  color: #1a1407 !important;
  font-weight: 700 !important;
  height: 48px !important;
  font-size: 16px !important;
  box-shadow: $shadow-gold !important;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: $text-secondary;

  a {
    color: $gold-light;
    margin-left: 6px;
    font-weight: 600;
  }
}
</style>
