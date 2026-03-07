<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">创建活动</h2>
      <el-button @click="$router.back()">返回列表</el-button>
    </div>
    <div class="form-card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px" style="max-width: 700px;">
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="首充奖金" value="首充奖金" />
            <el-option label="每日返水" value="每日返水" />
            <el-option label="每周返现" value="每周返现" />
            <el-option label="电子返水" value="电子返水" />
            <el-option label="真人返水" value="真人返水" />
            <el-option label="捕鱼返水" value="捕鱼返水" />
            <el-option label="签到奖励" value="签到奖励" />
            <el-option label="邀请好友" value="邀请好友" />
            <el-option label="幸运转盘" value="幸运转盘" />
            <el-option label="红包雨" value="红包雨" />
            <el-option label="新人礼包" value="新人礼包" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动时间" prop="period">
          <el-date-picker v-model="form.period" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" style="width: 100%;" />
        </el-form-item>
        <el-divider>奖励配置</el-divider>
        <el-form-item label="最低充值">
          <el-input-number v-model="form.minDeposit" :min="0" :step="100" />
          <span style="margin-left: 8px; color: #888;">元</span>
        </el-form-item>
        <el-form-item label="奖金比例">
          <el-slider v-model="form.bonusRate" :min="1" :max="100" :format-tooltip="v => v + '%'" show-input />
        </el-form-item>
        <el-form-item label="打码倍数">
          <el-input-number v-model="form.wagerMultiplier" :min="1" :max="50" />
          <span style="margin-left: 8px; color: #888;">倍</span>
        </el-form-item>
        <el-form-item label="最高奖金">
          <el-input-number v-model="form.maxBonus" :min="0" :step="100" />
          <span style="margin-left: 8px; color: #888;">元</span>
        </el-form-item>
        <el-form-item label="每人限领次数">
          <el-input-number v-model="form.perUserLimit" :min="1" :max="999" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">创建活动</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const form = reactive({
  type: '首充奖金', name: '', period: null,
  minDeposit: 100, bonusRate: 20, wagerMultiplier: 5, maxBonus: 5000, perUserLimit: 1
})
const rules = {
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  period: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
}

async function handleSubmit() {
  await formRef.value?.validate()
  ElMessage.success('活动创建成功')
  router.push('/agent/promotions')
}
</script>
