<template>
  <div class="game-management">
    <div class="page-header">
      <h2 class="section-title">游戏管理</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>添加游戏</el-button>
        <el-button :disabled="!selectedGames.length" @click="batchSetHot">批量设热门</el-button>
        <el-button :disabled="!selectedGames.length" @click="batchSetNew">批量设新游</el-button>
        <el-button :disabled="!selectedGames.length" type="danger" plain @click="batchDisable">批量下架</el-button>
      </div>
    </div>

    <!-- Stats -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">游戏总数</div><div style="font-size: 24px; font-weight: 700; color: #409eff;">{{ gameStats.totalGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">上线游戏</div><div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ gameStats.onlineGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">维护中</div><div style="font-size: 24px; font-weight: 700; color: #e6a23c;">{{ gameStats.maintenanceGames }}</div></div></el-card>
      <el-card shadow="hover" style="flex: 1;"><div style="text-align: center;"><div style="font-size: 14px; color: #909399; margin-bottom: 8px;">分类总数</div><div style="font-size: 24px; font-weight: 700; color: #909399;">{{ categories.length }}</div></div></el-card>
    </div>

    <div class="game-layout">
      <!-- Left: Category Tree -->
      <div class="category-sidebar">
        <div class="sidebar-header">
          <span>游戏分类</span>
          <el-button text size="small" type="primary" @click="openCategoryDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
        <div
          class="cat-item"
          :class="{ active: !activeCategoryId }"
          @click="activeCategoryId = null"
        >
          <span>🎮 全部游戏</span>
          <el-tag size="small" type="info">{{ gameStats.totalGames }}</el-tag>
        </div>
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-item"
          :class="{ active: activeCategoryId === cat.id }"
          @click="activeCategoryId = cat.id"
        >
          <div class="cat-item-left">
            <span>{{ cat.icon }} {{ cat.name_zh }}</span>
            <el-switch v-model="cat.is_enabled" size="small" @change="toggleCategory(cat)" @click.stop />
          </div>
          <el-tag size="small" type="info">{{ cat.game_count || 0 }}</el-tag>
        </div>
      </div>

      <!-- Right: Game Table -->
      <div class="game-content">
        <div class="filter-bar">
          <el-input v-model="search" placeholder="搜索游戏名称/ID" style="width: 200px;" clearable prefix-icon="Search" />
          <el-select v-model="sourceFilter" placeholder="来源" style="width: 120px;" clearable>
            <el-option label="本地" value="local" />
            <el-option label="聚合" value="sk7755" />
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
          <el-table-column label="分类" width="100">
            <template #default="{ row }">
              {{ getCategoryName(row.category_id) || row.category || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="来源" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="row.source === 'sk7755' ? 'warning' : 'info'">{{ row.source === 'sk7755' ? 'SK' : '本地' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="RTP" width="80"><template #default="{ row }">{{ row.rtp ? row.rtp + '%' : '-' }}</template></el-table-column>
          <el-table-column label="排序" width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.sortOrder" :min="0" size="small" controls-position="right" style="width: 90px;" @change="saveSortOrder(row)" />
            </template>
          </el-table-column>
          <el-table-column label="标签" width="140">
            <template #default="{ row }">
              <el-tag v-if="row.isHot" type="danger" size="small" style="margin-right: 4px;">热门</el-tag>
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
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑游戏' : '添加游戏'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="游戏名称" required><el-input v-model="form.name" placeholder="请输入游戏名称" /></el-form-item>
        <el-form-item label="游戏代码"><el-input v-model="form.gameCode" placeholder="例: pg_fortune-tiger" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="游戏分类" required>
              <el-select v-model="form.category_id" placeholder="选择分类" style="width: 100%;">
                <el-option v-for="c in categories" :key="c.id" :label="c.icon + ' ' + c.name_zh" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="RTP"><el-input-number v-model="form.rtp" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="热门"><el-switch v-model="form.isHot" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="新游"><el-switch v-model="form.isNew" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="可见"><el-switch v-model="form.isVisible" /></el-form-item></el-col>
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

    <!-- Category CRUD Dialog -->
    <el-dialog v-model="catDialogVisible" title="管理分类" width="500px">
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="代码" required><el-input v-model="catForm.code" placeholder="例: slot" /></el-form-item>
        <el-form-item label="中文名" required><el-input v-model="catForm.name_zh" placeholder="例: 老虎机" /></el-form-item>
        <el-form-item label="英文名" required><el-input v-model="catForm.name_en" placeholder="例: Slots" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="catForm.icon" placeholder="例: 🎰" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="catForm.sort_order" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGames, createGame, updateGame, deleteGame, batchUpdateGames, updateGameSort, updateHotScore } from '@/api/games'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import api from '@/api/index'

const search = ref('')
const sourceFilter = ref('')
const statusFilter = ref('')
const games = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const sortMode = ref('')
const selectedGames = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const categories = ref([])
const activeCategoryId = ref(null)
const catDialogVisible = ref(false)

const defaultForm = { name: '', gameCode: '', category_id: null, rtp: 96.5, sortOrder: 0, isHot: false, isNew: false, isVisible: true, status: 'online' }
const form = ref({ ...defaultForm })
const catForm = ref({ code: '', name_zh: '', name_en: '', icon: '', sort_order: 0 })

const categoryIcons = { '电子': '🎰', '真人': '🎲', '捕鱼': '🐟', '体育': '⚽', '彩票': '🎱', '棋牌': '♟️' }
function getCategoryIcon(cat) { return categoryIcons[cat] || '🎮' }

function getCategoryName(catId) {
  if (!catId) return ''
  const cat = categories.value.find(c => c.id === catId)
  return cat ? cat.name_zh : ''
}

async function fetchCategories() {
  try {
    const res = await api.get('/api/admin/categories')
    categories.value = (res || []).map(c => ({ ...c, is_enabled: !!c.is_enabled }))
  } catch (e) { console.warn('Categories fetch failed', e) }
}

onMounted(async () => {
  await fetchCategories()
  try {
    loading.value = true
    const data = await getGames()
    games.value = (data || []).map(g => ({ ...g, status: g.status === 'active' ? 'online' : g.status === 'maintenance' ? 'maintenance' : g.status === 'online' ? 'online' : 'offline', sortOrder: g.sortOrder || g.hotScore || 0, source: 'local' }))
  } catch (e) { console.warn('API request failed', e) } finally { loading.value = false }
})

const gameStats = computed(() => {
  const all = games.value
  return {
    totalGames: all.length,
    onlineGames: all.filter(g => g.status === 'online').length,
    maintenanceGames: all.filter(g => g.status === 'maintenance').length,
  }
})

const filteredGames = computed(() => {
  let result = games.value.filter(g => {
    if (search.value && !g.name.includes(search.value) && !String(g.id).includes(search.value)) return false
    if (activeCategoryId.value && g.category_id !== activeCategoryId.value) return false
    if (sourceFilter.value && g.source !== sourceFilter.value) return false
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

function openCategoryDialog() {
  catForm.value = { code: '', name_zh: '', name_en: '', icon: '', sort_order: 0 }
  catDialogVisible.value = true
}

async function saveCategory() {
  if (!catForm.value.code || !catForm.value.name_zh || !catForm.value.name_en) { ElMessage.warning('请填写必填字段'); return }
  try {
    await api.post('/api/admin/categories', catForm.value)
    ElMessage.success('分类已创建')
    catDialogVisible.value = false
    await fetchCategories()
  } catch (e) { ElMessage.error('操作失败') }
}

async function toggleCategory(cat) {
  try {
    await api.put(`/api/admin/categories/${cat.id}`, { is_enabled: cat.is_enabled })
  } catch (e) { ElMessage.error('操作失败') }
}

async function saveGame() {
  if (!form.value.name) { ElMessage.warning('请填写必填字段'); return }
  try {
    if (isEdit.value) {
      await updateGame(form.value.id, form.value)
      const idx = games.value.findIndex(g => g.id === form.value.id)
      if (idx !== -1) games.value[idx] = { ...form.value }
      ElMessage.success('游戏已更新')
    } else {
      const newGame = await createGame(form.value)
      games.value.unshift({ ...form.value, id: newGame?.id || Date.now() })
      ElMessage.success('游戏已添加')
    }
    dialogVisible.value = false
  } catch (e) { ElMessage.error('操作失败') }
}

function handleDelete(row) {
  ElMessageBox.confirm('确定删除游戏「' + row.name + '」吗？此操作不可恢复。', '确认删除', { type: 'warning' }).then(async () => {
    try { await deleteGame(row.id); games.value = games.value.filter(g => g.id !== row.id); ElMessage.success('已删除') } catch (e) { ElMessage.error('删除失败') }
  }).catch(() => {})
}

async function changeGameStatus(row, status) {
  try {
    await updateGame(row.id, { status })
    row.status = status
    ElMessage.success('状态已更新')
  } catch (e) { ElMessage.error('更新失败') }
}

async function toggleTag(row, tag) {
  row[tag] = !row[tag]
  try { await updateGame(row.id, { [tag]: row[tag] }) } catch (e) { ElMessage.error('更新失败') }
}

async function saveSortOrder(row) {
  try { await updateGameSort(row.id, row.sortOrder) } catch (e) { console.warn(e) }
}

async function batchSetHot() {
  for (const g of selectedGames.value) { g.isHot = true }
  try {
    await api.post('/api/admin/games/batch-update', { game_ids: selectedGames.value.map(g => g.id), updates: { is_hot: true } })
    ElMessage.success('批量设置热门成功')
  } catch (e) { ElMessage.error('操作失败') }
}

async function batchSetNew() {
  for (const g of selectedGames.value) { g.isNew = true }
  try {
    await api.post('/api/admin/games/batch-update', { game_ids: selectedGames.value.map(g => g.id), updates: { is_new: true } })
    ElMessage.success('批量设置新游成功')
  } catch (e) { ElMessage.error('操作失败') }
}

async function batchDisable() {
  for (const g of selectedGames.value) { g.status = 'offline' }
  try {
    for (const g of selectedGames.value) { await updateGame(g.id, { status: 'offline' }) }
    ElMessage.success('批量下架成功')
  } catch (e) { ElMessage.error('操作失败') }
}
</script>

<style scoped>
.game-management { padding: 0; }
.game-layout { display: flex; gap: 16px; }
.category-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--el-bg-color-overlay, #fff);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding: 12px;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 4px;
  transition: all 0.2s;
}
.cat-item:hover { background: var(--el-fill-color-light, #f5f7fa); }
.cat-item.active { background: var(--el-color-primary-light-9, #ecf5ff); color: var(--el-color-primary, #409eff); font-weight: 600; }
.cat-item-left { display: flex; align-items: center; gap: 8px; }
.game-content { flex: 1; min-width: 0; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.table-card { background: var(--el-bg-color-overlay, #fff); border-radius: 8px; padding: 16px; }
</style>
