<template>
  <div class="bg-login">
    <!-- Ambient background -->
    <div class="bg-login__aurora bg-login__aurora--a" />
    <div class="bg-login__aurora bg-login__aurora--b" />
    <div class="bg-login__grid" />

    <div class="bg-login__card">
      <div class="bg-login__header">
        <div class="bg-login__logo">
          <span class="bg-login__logo-mark">DD</span>
        </div>
        <div>
          <h1 class="bg-login__brand">大大娱乐</h1>
          <p class="bg-login__subtitle">Luxury Admin · 管理后台</p>
        </div>
      </div>

      <div class="bg-login__role">
        <button
          type="button"
          class="bg-login__role-btn"
          :class="{ 'is-active': selectedRole === 'superadmin' }"
          @click="selectedRole = 'superadmin'"
        >
          <el-icon><Setting /></el-icon>
          超级管理员
        </button>
        <button
          type="button"
          class="bg-login__role-btn"
          :class="{ 'is-active': selectedRole === 'agent' }"
          @click="selectedRole = 'agent'"
        >
          <el-icon><UserFilled /></el-icon>
          代理管理员
        </button>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="bg-login__form"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="UserIcon"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="LockIcon"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item prop="code">
          <el-input
            v-model="form.code"
            placeholder="2FA 动态验证码（如启用）"
            maxlength="8"
            :prefix-icon="KeyIcon"
            autocomplete="one-time-code"
            inputmode="numeric"
          />
        </el-form-item>

        <div class="bg-login__row">
          <el-checkbox v-model="form.remember">记住账号</el-checkbox>
          <a href="#" class="bg-login__link" @click.prevent="onForgot">忘记密码？</a>
        </div>

        <el-button
          type="primary"
          class="bg-login__submit"
          :loading="loading"
          :disabled="authStore.isLocked"
          @click="handleLogin"
        >
          <span v-if="authStore.isLocked">锁定中 · {{ authStore.remainingLockTime }} 分钟后重试</span>
          <span v-else>登 录</span>
        </el-button>

        <div class="bg-login__hint">
          演示账号：<code>admin</code> / <code>demo</code>
        </div>
      </el-form>
    </div>

    <div class="bg-login__foot">
      © {{ new Date().getFullYear() }} DD Entertainment · Confidential · v2.0
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User as UserIcon, Lock as LockIcon, Key as KeyIcon } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const formRef = ref(null)
const loading = ref(false)
const selectedRole = ref('superadmin')

const form = reactive({
  username: authStore.rememberedUsername || 'admin',
  password: '',
  code: '',
  remember: !!authStore.rememberedUsername,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名至少 2 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码至少 4 位', trigger: 'blur' },
  ],
  code: [
    { pattern: /^$|^\d{6,8}$/, message: '验证码为 6-8 位数字', trigger: 'blur' },
  ],
}

// Prefix icons need to be raw (not reactive) to avoid warnings
const _icons = { UserIcon: markRaw(UserIcon), LockIcon: markRaw(LockIcon), KeyIcon: markRaw(KeyIcon) }

onMounted(() => {
  document.title = '登录 - 大大娱乐管理后台'
})

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch (_) { return }

  if (authStore.isLocked) {
    ElMessage.error(`登录已锁定，请 ${authStore.remainingLockTime} 分钟后重试`)
    return
  }

  loading.value = true
  try {
    const result = await authStore.login(
      form.username.trim(),
      form.password,
      selectedRole.value,
      { code: form.code.trim(), remember: form.remember },
    )

    if (result.success) {
      appStore.pushNotification({ type: 'success', title: '登录成功', message: `欢迎回来，${authStore.displayName}` })
      ElMessage.success('登录成功')
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
      const home = selectedRole.value === 'superadmin' ? '/super/dashboard' : '/agent/dashboard'
      router.push(redirect || home)
    } else if (result.locked) {
      ElMessage.error(`登录失败次数过多，账户已锁定 ${result.remainingMinutes} 分钟`)
    } else {
      ElMessage.error(`用户名、密码或验证码错误，还剩 ${result.attemptsLeft} 次机会`)
    }
  } catch (e) {
    ElMessage.error(e?.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

function onForgot() {
  ElMessage.info('请联系系统管理员重置密码')
}
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-soft: #e8c87a;
$gold-deep: #b8902c;
$ink-900: #05070d;
$ink-800: #0a0e17;
$ink-700: #111724;
$ink-600: #1a2033;
$line: rgba(212, 175, 55, 0.18);

.bg-login {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(212, 175, 55, 0.08), transparent 60%),
    radial-gradient(ellipse at 100% 100%, rgba(184, 144, 44, 0.07), transparent 55%),
    linear-gradient(180deg, $ink-800 0%, $ink-900 100%);
  color: #f4ead0;
  font-family: 'Manrope', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.bg-login__aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.55;
  pointer-events: none;
  &--a { width: 480px; height: 480px; background: rgba(212, 175, 55, 0.35); top: -140px; left: -100px; }
  &--b { width: 520px; height: 520px; background: rgba(111, 78, 20, 0.45); bottom: -180px; right: -120px; }
}
.bg-login__grid {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.22;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, #000 35%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, #000 35%, transparent 80%);
}

.bg-login__card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 36px 32px 28px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(26, 32, 51, 0.92) 0%, rgba(10, 14, 23, 0.92) 100%);
  border: 1px solid $line;
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 0 0 1px rgba(212, 175, 55, 0.08);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  z-index: 1;
}
.bg-login__card::before {
  content: '';
  position: absolute; inset: -1px;
  border-radius: 20px; padding: 1px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.55), rgba(212, 175, 55, 0) 40%, rgba(212, 175, 55, 0) 60%, rgba(212, 175, 55, 0.45));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}

.bg-login__header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 22px;
}
.bg-login__logo {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, $gold-soft, $gold 50%, $gold-deep);
  display: grid; place-items: center;
  color: $ink-900;
  font-weight: 900; letter-spacing: 0.04em;
  box-shadow: 0 10px 22px rgba(212, 175, 55, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}
.bg-login__logo-mark { font-size: 22px; }
.bg-login__brand {
  margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.06em;
  background: linear-gradient(135deg, #fff 0%, $gold-soft 50%, $gold 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.bg-login__subtitle {
  margin: 4px 0 0; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(232, 200, 122, 0.62);
}

.bg-login__role {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px;
}
.bg-login__role-btn {
  height: 42px; border-radius: 10px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.05em;
  border: 1px solid $line;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(244, 234, 208, 0.72);
  transition: all 0.2s ease;
  .el-icon { font-size: 15px; }
  &:hover { color: $gold-soft; border-color: rgba(212, 175, 55, 0.4); }
  &.is-active {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.06));
    border-color: $gold;
    color: $gold-soft;
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.25), 0 6px 18px rgba(212, 175, 55, 0.18);
  }
}

.bg-login__form :deep(.el-input__wrapper) {
  background: rgba(10, 14, 23, 0.7);
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.15);
  padding: 2px 12px;
  transition: box-shadow 0.2s ease;
  &:hover { box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.35); }
  &.is-focus { box-shadow: inset 0 0 0 1px $gold, 0 0 0 4px rgba(212, 175, 55, 0.12); }
}
.bg-login__form :deep(.el-input__inner) { color: #f4ead0; caret-color: $gold; }
.bg-login__form :deep(.el-input__inner)::placeholder { color: rgba(244, 234, 208, 0.35); }
.bg-login__form :deep(.el-input__prefix) { color: $gold-soft; }

.bg-login__row {
  display: flex; align-items: center; justify-content: space-between;
  margin: -4px 2px 14px; font-size: 12px;
}
.bg-login__row :deep(.el-checkbox__label) { color: rgba(244, 234, 208, 0.72); font-size: 12px; }
.bg-login__row :deep(.el-checkbox__inner) { background: rgba(10, 14, 23, 0.6); border-color: rgba(212, 175, 55, 0.35); }
.bg-login__row :deep(.el-checkbox__input.is-checked .el-checkbox__inner) { background: $gold; border-color: $gold; }
.bg-login__row :deep(.el-checkbox__input.is-checked + .el-checkbox__label) { color: $gold-soft; }

.bg-login__link {
  color: rgba(232, 200, 122, 0.75); text-decoration: none;
  &:hover { color: $gold-soft; }
}

.bg-login__submit {
  width: 100%; height: 46px; margin-top: 4px;
  border: none; border-radius: 10px;
  color: $ink-900; font-weight: 800; letter-spacing: 0.08em;
  background: linear-gradient(135deg, $gold-soft 0%, $gold 45%, $gold-deep 100%);
  box-shadow: 0 10px 28px rgba(212, 175, 55, 0.32), inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(212, 175, 55, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.4); }
  &:active { transform: translateY(0); }
  &.is-disabled { opacity: 0.55; cursor: not-allowed; }
}

.bg-login__hint {
  margin-top: 14px; text-align: center;
  font-size: 11px; letter-spacing: 0.04em; color: rgba(244, 234, 208, 0.45);
  code {
    padding: 1px 6px; border-radius: 4px;
    background: rgba(212, 175, 55, 0.1); color: $gold-soft;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
}

.bg-login__foot {
  position: absolute; bottom: 14px; left: 0; right: 0;
  text-align: center; font-size: 11px; letter-spacing: 0.1em;
  color: rgba(244, 234, 208, 0.3);
}
</style>
