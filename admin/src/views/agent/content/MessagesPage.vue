<template>
  <div>
    <h2 class="section-title">站内信</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary" @click="sendDialog = true"><el-icon><Plus /></el-icon>发送消息</el-button>
      </div>
      <el-table :data="messages" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="target" label="接收对象" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.target }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="已读率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.readRate" :stroke-width="6" :color="row.readRate > 80 ? '#67c23a' : '#e6a23c'" />
          </template>
        </el-table-column>
        <el-table-column prop="sentAt" label="发送时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" text @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-divider />
    <h3 class="section-title">客服配置</h3>
    <div class="form-card">
      <el-form label-width="140px" style="max-width: 600px;">
        <el-form-item label="Telegram客服链接"><el-input v-model="csConfig.telegram" placeholder="https://t.me/your_support" /></el-form-item>
        <el-form-item label="显示位置">
          <el-checkbox-group v-model="csConfig.positions">
            <el-checkbox value="home">首页</el-checkbox>
            <el-checkbox value="game">游戏页</el-checkbox>
            <el-checkbox value="finance">财务页</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="APP下载链接"><el-input v-model="csConfig.appDownload" placeholder="APK下载链接" /></el-form-item>
        <el-form-item label="iOS描述文件"><el-input v-model="csConfig.iosProfile" placeholder="iOS描述文件链接" /></el-form-item>
        <el-form-item label="版本号"><el-input v-model="csConfig.version" placeholder="v1.0.0" /></el-form-item>
        <el-form-item><el-button type="primary" @click="ElMessage.success('配置已保存')">保存</el-button></el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const messages = ref([])

const sendDialog = ref(false)
const csConfig = reactive({
  telegram: '',
  positions: ['home', 'game', 'finance'],
  appDownload: '',
  iosProfile: '',
  version: ''
})

function remove(row) {
  ElMessageBox.confirm('确定删除此消息?', '确认', { type: 'warning' }).then(() => {
    messages.value = messages.value.filter(m => m.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>
