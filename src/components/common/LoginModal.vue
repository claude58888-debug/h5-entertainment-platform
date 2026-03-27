<template>
  <van-popup
    v-model:show="userStore.showLoginModal"
    position="bottom"
    round
    :style="{ maxWidth: '480px', margin: '0 auto' }"
    closeable
    close-icon-position="top-right"
  >
    <div class="login-modal">
      <h3 class="modal-title">{{ t('auth.loginTitle') }}</h3>
      <van-form @submit="onSubmit" class="login-form">
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
          <router-link to="/register" @click="userStore.showLoginModal = false">{{ t('auth.goRegister') }}</router-link>
        </div>
      </van-form>
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const { t } = useI18n()
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
    phone.value = ''
    password.value = ''
  } catch (e) {
    showToast({ message: e.message || t('common.error'), type: 'fail' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-modal {
  padding: 24px 16px 32px;
  background: $bg-primary;

  .modal-title {
    text-align: center;
    font-size: 20px;
    margin-bottom: 24px;
    color: $text-primary;
  }
}

.login-form {
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
  margin-top: 24px;
  padding: 0 16px;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: $text-secondary;

  a {
    color: $accent-purple-light;
    margin-left: 4px;
  }
}
</style>
