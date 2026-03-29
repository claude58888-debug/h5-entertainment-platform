<template>
  <div>
    <h2 class="section-title">管理员账户</h2>
    <div class="table-card">
      <div class="page-header" style="margin-bottom: 0;">
        <div></div>
        <el-button type="primary" @click="addDialog = true"><el-icon><Plus /></el-icon>新增管理员</el-button>
      </div>
      <el-table :data="admins" stripe style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === '超级管理员' ? 'danger' : row.role === '财务管理员' ? 'warning' : 'info'" size="small">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column prop="loginIp" label="登录IP" width="140" />
        <el-table-column prop="created" label="创建时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text>编辑</el-button>
            <el-button size="small" type="warning" text @click="resetPwd(row)">重置密码</el-button>
            <el-button v-if="row.role !== '超级管理员'" size="small" type="danger" text @click="toggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="addDialog" title="新增管理员" width="450px">
      <el-form label-width="90px">
        <el-form-item label="用户名"><el-input v-model="newAdmin.username" /></el-form-item>
        <el-form-item label="真实姓名"><el-input v-model="newAdmin.realName" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="newAdmin.password" type="password" show-password /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newAdmin.role" style="width: 100%;">
            <el-option label="运营管理员" value="运营管理员" />
            <el-option label="财务管理员" value="财务管理员" />
            <el-option label="客服管理员" value="客服管理员" />
            <el-option label="风控管理员" value="风控管理员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="addAdmin">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAdmins, createAdmin as apiCreateAdmin, toggleAdmin, deleteAdmin } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

const admins = ref([])

onMounted(async () => {
  try {
    const data = await getAdmins()
    admins.value = data || []
  } catch (e) { console.warn('API request failed', e) }
})
const addDialog = ref(false)
const newAdmin = reactive({ username: '', realName: '', password: '', role: '运营管理员' })

async function addAdmin() {
  try {
    const result = await apiCreateAdmin(newAdmin)
    admins.value.push({ id: result?.id || admins.value.length + 1, ...newAdmin, status: 'active', lastLogin: '-', loginIp: '-', created: new Date().toISOString().slice(0, 10) })
    addDialog.value = false
    ElMessage.success('管理员已创建')
  } catch (e) {
    ElMessage.error('创建失败')
  }
}

function resetPwd(row) {
  ElMessageBox.confirm(`确定重置 ${row.username} 的密码?`, '重置密码', { type: 'warning' }).then(() => {
    ElMessage.success('密码已重置为默认密码')
  }).catch(() => {})
}

function toggleStatus(row) {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定${action} ${row.username}?`, '确认').then(async () => {
    try {
      await toggleAdmin(row.id)
      row.status = row.status === 'active' ? 'disabled' : 'active'
      ElMessage.success(`已${action}`)
    } catch (e) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}
</script>
