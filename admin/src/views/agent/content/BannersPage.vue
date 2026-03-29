<template>
  <div>
    <h2 class="section-title">Banner管理</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary" @click="addDialog = true"><el-icon><Plus /></el-icon>添加Banner</el-button>
      </div>
      <el-table :data="bannerList" stripe style="margin-top: 16px;">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column label="预览" width="200">
          <template #default="{ row }">
            <div :style="{ width: '160px', height: '60px', borderRadius: '6px', background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <span style="color: white; font-weight: bold; font-size: 12px;">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="160" />
        <el-table-column prop="link" label="链接" width="180" show-overflow-tooltip />
        <el-table-column label="排序" width="120">
          <template #default="{ row }">
            <el-button size="small" text @click="moveUp(row)">↑</el-button>
            <el-button size="small" text @click="moveDown(row)">↓</el-button>
            <span style="color:#888;">{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="定时" width="180">
          <template #default="{ row }">{{ row.schedule || '长期展示' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>编辑</el-button>
            <el-button size="small" type="danger" text @click="removeBanner(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="addDialog" title="添加Banner" width="500px">
      <el-form label-width="90px">
        <el-form-item label="标题"><el-input v-model="newBanner.title" /></el-form-item>
        <el-form-item label="链接"><el-input v-model="newBanner.link" placeholder="https://" /></el-form-item>
        <el-form-item label="图片上传"><el-upload action="#" :auto-upload="false"><el-button type="primary">选择图片</el-button></el-upload></el-form-item>
        <el-form-item label="定时展示"><el-date-picker v-model="newBanner.schedule" type="daterange" range-separator="至" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="addBanner">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const bannerList = ref(banners.map((b, i) => ({ ...b, sort: i + 1 })))
const addDialog = ref(false)
const newBanner = reactive({ title: '', link: '', schedule: null })

function addBanner() {
  bannerList.value.push({ ...newBanner, id: Date.now(), sort: bannerList.value.length + 1, status: 'active', color: 'linear-gradient(135deg, #667eea, #764ba2)' })
  addDialog.value = false
  ElMessage.success('Banner已添加')
}
function removeBanner(row) {
  ElMessageBox.confirm('确定删除此Banner?', '确认', { type: 'warning' }).then(() => {
    bannerList.value = bannerList.value.filter(b => b.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
function moveUp(row) { if (row.sort > 1) { const prev = bannerList.value.find(b => b.sort === row.sort - 1); if (prev) { prev.sort++; row.sort-- } } }
function moveDown(row) { const next = bannerList.value.find(b => b.sort === row.sort + 1); if (next) { next.sort--; row.sort++ } }
</script>
