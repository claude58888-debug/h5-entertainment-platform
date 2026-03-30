<template>
  <div>
    <div class="page-header">
      <h2 class="section-title">游戏管理</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>添加游戏</el-button>
        <el-button :disabled="!selectedGames.length" @click="batchEnable">批量启用</el-button>
        <el-button :disabled="!selectedGames.length" type="danger" plain @click="batchDisable">批量停用</el-button>
      </div>
    </div>

    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">游戏总数</div><div style="font-size: 24px; font-weight: 700; color: #409eff;">{{ gameStats.totalGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">上线游戏</div><div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ gameStats.onlineGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">维护中</div><div style="font-size: 24px; font-weight: 700; color: #e6a23c;">{{ gameStats.maintenanceGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">厂商总数</div><div style="font-size: 24px; font-weight: 700; color: #909399;">{{ gameStats.totalProviders }}</div></div></el-card>
    </div>

    <div class="table-card">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索游戏名称/ID" style="width: 200px;" clearable prefix-icon="Search" />
        <el-select v-model="providerFilter" placeholder="厂商" style="width: 120px;" clearable>
          <el-option v-for="p in providerList" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类" style="width: 120px;" clearable>
          <el-option label="电子" value="电子" /><el-option label="真人" value="真人" /><el-option label="捕鱼" value="捕鱼" />
          <el-option label="体育" value="体育" /><el-option label="彩票" value="彩票" /><el-option label="棋牌" value="棋牌" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" clearable>
          <el-option label="上线" value="online" /><el-option label="下线" value="offline" /><el-option label="维护" value="maintenance" />
        </el-select>
        <el-select v-model="sortMode" placeholder="排序方式" style="width: 140px;" clearable>
          <el-option label="按排序号" value="sort" /><el-option label="按热度" value="popularity" />
          <el-option label="按RTP" value="rtp" /><el-option label="按收入" value="revenue" />
        </el-select>
      </div>
      <div v-if="loading" class="skeleton-table"><el-skeleton :rows="8" animated /></div>
      <div v-else-if="!filteredGames.length" class="empty-state"><el-empty description="暂无游戏数据" /></div>

      <el-table v-else :data="paginatedGames" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="游戏" width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">{{ getCategoryIcon(row.category) }}</div>
              <div><div style="font-weight: 600; font-size: 13px;">{{ row.name }}</div><div style="font-size: 11px; color: #909399;">{{ row.gameCode || '-' }}</div></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="厂商" width="80" />
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column label="RTP" width="80"><template #default="{ row }">{{ row.rtp }}%</template></el-table-column>
        <el-table-column label="排序" width="110">
          <template #default="{ row }">
            <el-input-number v-model="row.sortOrder" :min="0" size="small" controls-position="right" style="width: 90px;" @change="saveSortOrder(row)" />
          </template>
        </el-table-column>
        <el-table-column label="标签" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.isHot" type="danger" size="small" style="margin-right:4px;">热门</el-tag>
            <el-tag v-if="row.isNew" type="success" size="small">新游</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => changeGameStatus(row, cmd)">
              <el-tag :type="row.status === 'online' ? 'success' : row.status === 'maintenance' ? 'warning' : 'danger'" size="small" style="cursor: pointer;">
                {{ row.status === 'online' ? '上线' : row.status === 'maintenance' ? '维护' : '下线' }}
                <el-icon style="margin-left: 2px;"><ArrowDown /></el-icon>
              </el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="online" :disabled="row.status === 'online'">上线</el-dropdown-item>
                  <el-dropdown-item command="offline" :disabled="row.status === 'offline'">下线</el-dropdown-item>
                  <el-dropdown-item command="maintenance" :disabled="row.status === 'maintenance'">维护</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.isHot ? 'danger' : 'default'" text @click="toggleTag(row, 'isHot')">{{ row.isHot ? '取消热门' : '热门' }}</el-button>
            <el-button size="small" type="danger" text @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span v-if="selectedGames.length" style="font-size: 13px; color: #409eff;">已选 {{ selectedGames.length }} 项</span><span v-else></span>
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="filteredGames.length" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑游戏' : '添加游戏'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="游戏名称" required><el-input v-model="form.name" placeholder="请输入游戏名称" /></el-form-item>
        <el-form-item label="游戏代码"><el-input v-model="form.gameCode" placeholder="例: pg_fortune-tiger" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="所属厂商" required><el-select v-model="form.provider" placeholder="选择厂商" style="width: 100%;"><el-option v-for="p in providerList" :key="p" :label="p" :value="p" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="游戏分类" required><el-select v-model="form.category" placeholder="选择分类" style="width: 100%;"><el-option label="电子" value="电子" /><el-option label="真人" value="真人" /><el-option label="捕鱼" value="捕鱼" /><el-option label="体育" value="体育" /><el-option label="彩票" value="彩票" /><el-option label="棋牌" value="棋牌" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="RTP"><el-input-number v-model="form.rtp" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序号"><el-input-number v-model="form.sortOrder" :min="0" style="width: 100%;" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="游戏缩略图">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="handleThumbnailChange">
            <div v-if="form.thumbnail" style="width: 120px; height: 120px; border-radius: 8px; overflow: hidden;"><img :src="form.thumbnail" style="width: 100%; height: 100%; object-fit: cover;" /></div>
            <div v-else style="width: 120px; height: 120px; border-radius: 8px; border: 1px dashed #dcdfe6; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #909399; cursor: pointer;">
              <el-icon :size="28"><Plus /></el-icon><span style="font-size: 12px; margin-top: 4px;">上传缩略图</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="热门"><el-switch v-model="form.isHot" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="新游"><el-switch v-model="form.isNew" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="推荐"><el-switch v-model="form.isRecommended" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="online">上线</el-radio><el-radio value="offline">下线</el-radio><el-radio value="maintenance">维护</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGame">{{ isEdit ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGames, createGame, updateGame, deleteGame, batchUpdateGames, updateGameSort, updateHotScore } from '@/api/games'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'

const search = ref('')
const providerFilter = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const games = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const sortMode = ref('')
const selectedGames = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const defaultForm = { name: '', gameCode: '', provider: '', category: '', rtp: 96.5, sortOrder: 0, thumbnail: '', isHot: false, isNew: false, isRecommended: false, status: 'online' }
const form = ref({ ...defaultForm })

const categoryIcons = { '\u7535\u5b50': '\u{1F3B0}', '\u771f\u4eba': '\u{1F0CF}', '\u6355\u9c7c': '\u{1F41F}', '\u4f53\u80b2': '\u26BD', '\u5f69\u7968': '\u{1F3AF}', '\u68cb\u724c': '\u265F\uFE0F' }
function getCategoryIcon(cat) { return categoryIcons[cat] || '\u{1F3AE}' }

onMounted(async () => {
  try {
    loading.value = true
    const data = await getGames()
    games.value = (data || []).map(g => ({ ...g, status: g.status === 'active' ? 'online' : g.status === 'maintenance' ? 'maintenance' : g.status === 'online' ? 'online' : 'offline', sortOrder: g.sortOrder || g.hotScore || 0 }))
  } catch (e) { console.warn('API request failed', e) } finally { loading.value = false }
})

const providerList = ['PG', 'PP', 'CQ9', 'EVO', 'AG', 'JDB', 'JILI', 'FC', 'WM']

const gameStats = computed(() => {
  const all = games.value
  const providers = new Set(all.map(g => g.provider))
  return { totalGames: all.length, onlineGames: all.filter(g => g.status === 'online').length, maintenanceGames: all.filter(g => g.status === 'maintenance').length, totalProviders: providers.size }
})

const filteredGames = computed(() => {
  let result = games.value.filter(g => {
    if (search.value && !g.name.includes(search.value) && !String(g.id).includes(search.value)) return false
    if (providerFilter.value && g.provider !== providerFilter.value) return false
    if (categoryFilter.value && g.category !== categoryFilter.value) return false
    if (statusFilter.value && g.status !== statusFilter.value) return false
    return true
  })
  if (sortMode.value === 'sort') result = [...result].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  else if (sortMode.value === 'popularity') result = [...result].sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0))
  else if (sortMode.value === 'rtp') result = [...result].sort((a, b) => (b.rtp || 0) - (a.rtp || 0))
  else if (sortMode.value === 'revenue') result = [...result].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
  return result
})

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredGames.value.slice(start, start + pageSize.value)
})

function handleSelectionChange(val) { selectedGames.value = val }
function openCreateDialog() { isEdit.value = false; form.value = { ...defaultForm }; dialogVisible.value = true }
function handleEdit(row) { isEdit.value = true; form.value = { ...row }; dialogVisible.value = true }
function handleThumbnailChange(file) { if (file.raw) form.value.thumbnail = URL.createObjectURL(file.raw) }

async function saveGame() {
  if (!form.value.name || !form.value.provider || !form.value.category) { ElMessage.warning('\u8bf7\u586b\u5199\u5fc5\u586b\u5b57\u6bb5'); return }
  try {
    if (isEdit.value) {
      await updateGame(form.value.id, form.value)
      const idx = games.value.findIndex(g => g.id === form.value.id)
      if (idx !== -1) games.value[idx] = { ...form.value }
      ElMessage.success('\u6e38\u620f\u5df2\u66f4\u65b0')
    } else {
      const newGame = await createGame(form.value)
      games.value.unshift({ ...form.value, id: newGame?.id || Date.now() })
      ElMessage.success('\u6e38\u620f\u5df2\u6dfb\u52a0')
    }
    dialogVisible.value = false
  } catch (e) { ElMessage.error('\u64cd\u4f5c\u5931\u8d25') }
}

function handleDelete(row) {
  ElMessageBox.confirm('\u786e\u5b9a\u5220\u9664\u6e38\u620f\u300c' + row.name + '\u300d\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d\u3002', '\u786e\u8ba4\u5220\u9664', { type: 'warning' }).then(async () => {
    try { await deleteGame(row.id); games.value = games.value.filter(g => g.id !== row.id); ElMessage.success('\u5df2\u5220\u9664') } catch (e) { ElMessage.error('\u5220\u9664\u5931\u8d25') }
  }).catch(() => {})
}

async function changeGameStatus(row, status) {
  try {
    await updateGame(row.id, { status })
    row.status = status
    const labels = { online: '\u4e0a\u7ebf', offline: '\u4e0b\u7ebf', maintenance: '\u7ef4\u62a4' }
    ElMessage.success('\u6e38\u620f\u5df2\u8bbe\u4e3a' + labels[status])
  } catch (e) { ElMessage.error('\u72b6\u6001\u66f4\u65b0\u5931\u8d25') }
}

function toggleTag(row, tag) {
  row[tag] = !row[tag]
  if (tag === 'isHot') updateHotScore(row.id, row.isHot ? 100 : 0).catch(() => {})
}

async function saveSortOrder(row) {
  try { await updateGameSort(row.id, row.sortOrder); ElMessage.success('\u6392\u5e8f\u5df2\u66f4\u65b0') } catch (e) { ElMessage.error('\u66f4\u65b0\u5931\u8d25') }
}

async function batchEnable() {
  ElMessageBox.confirm('\u786e\u5b9a\u6279\u91cf\u4e0a\u7ebf ' + selectedGames.value.length + ' \u4e2a\u6e38\u620f\uff1f', '\u6279\u91cf\u64cd\u4f5c', { type: 'info' }).then(async () => {
    try {
      const ids = selectedGames.value.map(g => g.id)
      await batchUpdateGames(ids, { status: 'online' })
      selectedGames.value.forEach(g => { g.status = 'online' })
      ElMessage.success('\u5df2\u4e0a\u7ebf ' + ids.length + ' \u4e2a\u6e38\u620f')
    } catch (e) { ElMessage.error('\u6279\u91cf\u64cd\u4f5c\u5931\u8d25') }
  }).catch(() => {})
}

async function batchDisable() {
  ElMessageBox.confirm('\u786e\u5b9a\u6279\u91cf\u4e0b\u7ebf ' + selectedGames.value.length + ' \u4e2a\u6e38\u620f\uff1f', '\u6279\u91cf\u64cd\u4f5c', { type: 'warning' }).then(async () => {
    try {
      const ids = selectedGames.value.map(g => g.id)
      await batchUpdateGames(ids, { status: 'offline' })
      selectedGames.value.forEach(g => { g.status = 'offline' })
      ElMessage.success('\u5df2\u4e0b\u7ebf ' + ids.length + ' \u4e2a\u6e38\u620f')
    } catch (e) { ElMessage.error('\u6279\u91cf\u64cd\u4f5c\u5931\u8d25') }
  }).catch(() => {})
}
</script>
