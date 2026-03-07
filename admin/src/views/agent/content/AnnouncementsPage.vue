<template>
  <div>
    <h2 class="section-title">公告管理</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="跑马灯公告" name="marquee">
        <div class="form-card">
          <el-form label-width="120px" style="max-width: 600px;">
            <el-form-item label="公告文字"><el-input v-model="marquee.text" type="textarea" :rows="3" placeholder="请输入跑马灯文字" /></el-form-item>
            <el-form-item label="显示时长"><el-input-number v-model="marquee.duration" :min="5" :max="60" /><span style="margin-left:8px;color:#888;">秒</span></el-form-item>
            <el-form-item label="状态"><el-switch v-model="marquee.enabled" active-text="开启" inactive-text="关闭" /></el-form-item>
            <el-form-item><el-button type="primary" @click="ElMessage.success('跑马灯已更新')">保存</el-button></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="弹窗公告" name="popup">
        <div class="table-card">
          <div class="page-header" style="margin-bottom:0;"><div></div><el-button type="primary" @click="popupDialog = true"><el-icon><Plus /></el-icon>添加弹窗</el-button></div>
          <el-table :data="popups" stripe style="margin-top:16px;">
            <el-table-column prop="title" label="标题" width="200" />
            <el-table-column prop="trigger" label="触发时机" width="120" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column label="状态" width="80"><template #default="{ row }"><el-switch v-model="row.enabled" size="small" /></template></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="primary" text>编辑</el-button>
                <el-button size="small" type="danger" text @click="popups = popups.filter(p => p.id !== row.id); ElMessage.success('已删除')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="popupDialog" title="添加弹窗公告" width="500px">
      <el-form label-width="90px">
        <el-form-item label="标题"><el-input v-model="newPopup.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="newPopup.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="触发时机">
          <el-select v-model="newPopup.trigger" style="width:100%;">
            <el-option label="登录后" value="登录后" /><el-option label="首页加载" value="首页加载" /><el-option label="每日首次" value="每日首次" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="popupDialog = false">取消</el-button>
        <el-button type="primary" @click="addPopup">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('marquee')
const marquee = reactive({ text: '欢迎来到金沙娱乐！首充送100%奖金，最高可领8888元！', duration: 15, enabled: true })
const popups = ref([
  { id: 1, title: '春节活动通知', content: '春节期间充值满1000送388红包！活动时间：2月10日-2月17日', trigger: '登录后', enabled: true },
  { id: 2, title: '系统维护通知', content: '系统将于凌晨3:00-5:00进行维护升级，届时暂停服务', trigger: '首页加载', enabled: false }
])
const popupDialog = ref(false)
const newPopup = reactive({ title: '', content: '', trigger: '登录后' })

function addPopup() {
  popups.value.push({ ...newPopup, id: Date.now(), enabled: true })
  popupDialog.value = false
  ElMessage.success('弹窗公告已添加')
}
</script>
