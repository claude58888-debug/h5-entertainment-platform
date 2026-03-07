<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">人人娱乐</h1>
      <p class="login-subtitle">管理后台登录</p>

      <div class="role-selector">
        <el-button
          :type="selectedRole === 'superadmin' ? 'danger' : 'default'"
          class="role-btn"
          @click="selectedRole = 'superadmin'"
        >
          <el-icon><Setting /></el-icon>
          超级管理员
        </el-button>
        <el-button
          :type="selectedRole === 'agent' ? 'warning' : 'default'"
          class="role-btn"
          @click="selectedRole = 'agent'"
        >
          <el-icon><UserFilled /></el-icon>
          代理管理员
        </el-button>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div style="text-align: center; color: #555; font-size: 12px; margin-top: 16px;">
        演示账号: admin / 123456
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)
const selectedRole = ref('superadmin')

const form = reactive({ username: 'admin', password: '123456' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  setTimeout(() => {
    authStore.login(form.username, form.password, selectedRole.value)
    ElMessage.success('登录成功')
    router.push(selectedRole.value === 'superadmin' ? '/super/dashboard' : '/agent/dashboard')
    loading.value = false
  }, 500)
}
</script>
