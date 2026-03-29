<template>
  <div>
    <h2 class="section-title">创建代理</h2>
    <div class="form-card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" label-position="right">
        <el-form-item label="品牌名称" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="例: example.com" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" placeholder="Telegram用户名" />
        </el-form-item>
        <el-form-item label="主题色">
          <el-color-picker v-model="form.themeColor" />
        </el-form-item>
        <el-form-item label="分成模式">
          <el-radio-group v-model="form.shareMode">
            <el-radio value="revenue">收入分成</el-radio>
            <el-radio value="turnover">流水分成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分成比例">
          <el-slider v-model="form.shareRate" :min="10" :max="60" :format-tooltip="v => v + '%'" show-input />
        </el-form-item>
        <el-form-item label="负盈利结转">
          <el-switch v-model="form.negativeCarry" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-divider>游戏权限</el-divider>
        <el-form-item label="授权厂商">
          <el-checkbox-group v-model="form.providers">
            <el-checkbox v-for="p in allProviders" :key="p" :value="p">{{ p }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-divider>支付通道</el-divider>
        <el-form-item label="支付方式">
          <el-checkbox-group v-model="form.channels">
            <el-checkbox value="USDT-TRC20">USDT-TRC20</el-checkbox>
            <el-checkbox value="USDT-ERC20">USDT-ERC20</el-checkbox>
            <el-checkbox value="银行转账">银行转账</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="结算周期">
          <el-select v-model="form.settlementCycle">
            <el-option label="每日结算" value="daily" />
            <el-option label="每周结算" value="weekly" />
            <el-option label="每月结算" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">创建代理</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createAgent } from '@/api/agents'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const allProviders = ['PG', 'PP', 'CQ9', 'EVO', 'AG', 'JDB', 'JILI', 'FC', 'WM']

const form = reactive({
  brand: '', domain: '', contact: '', themeColor: '#e6a23c',
  shareMode: 'revenue', shareRate: 40, negativeCarry: true,
  providers: ['PG', 'PP', 'CQ9', 'EVO', 'AG', 'JDB', 'JILI', 'FC'],
  channels: ['USDT-TRC20', 'USDT-ERC20'],
  settlementCycle: 'weekly'
})

const rules = {
  brand: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  domain: [{ required: true, message: '请输入域名', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }]
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    await createAgent(form)
    ElMessage.success('代理创建成功')
    router.push('/super/agents')
  } catch (e) {
    ElMessage.error('创建失败')
  }
}
</script>
