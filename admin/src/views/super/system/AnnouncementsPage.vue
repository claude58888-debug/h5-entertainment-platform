<template>
  <div>
    <h2 class="section-title">公告管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary" @click="addDialog = true"><el-icon><Plus /></el-icon>发布公告</el-button>
      </div>
      <el-table :data="list" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="target" label="推送对象" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.target }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag :type="row.type === '紧急' ? 'danger' : 'info'" size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">{{ row.status === 'published' ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>编辑</el-button>
            <el-button v-if="row.status === 'draft'" size="small" type="success" text @click="row.status = 'published'; ElMessage.success('已发布')">发布</el-button>
            <el-button size="small" type="danger" text @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="addDialog" title="发布公告" width="600px">
      <el-form label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="推送对象">
          <el-select v-model="form.target" style="width: 100%;">
            <el-option label="全部代理" value="全部代理" />
            <el-option label="金沙娱乐" value="金沙娱乐" />
            <el-option label="皇冠体育" value="皇冠体育" />
            <el-option label="新濠天地" value="新濠天地" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="普通">普通</el-radio>
            <el-radio value="紧急">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="publish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])

onMounted(async () => {
  try {
    const data = await getAnnouncements()
    list.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})
const addDialog = ref(false)
const form = reactive({ title: '', content: '', target: '全部代理', type: '普通' })

async function publish() {
  try {
    const result = await createAnnouncement(form)
    list.value.unshift({ id: result?.id || list.value.length + 1, ...form, status: 'published', publishedAt: new Date().toLocaleString('zh-CN') })
    addDialog.value = false
    ElMessage.success('公告已发布')
  } catch (e) {
    ElMessage.error('发布失败')
  }
}
function remove(row) {
  ElMessageBox.confirm('确定删除此公告?', '确认删除', { type: 'warning' }).then(async () => {
    try {
      await deleteAnnouncement(row.id)
      list.value = list.value.filter(a => a.id !== row.id)
      ElMessage.success('已删除')
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}
</script>
