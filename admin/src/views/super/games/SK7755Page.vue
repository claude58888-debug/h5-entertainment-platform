<template>
  <div>
    <h2 class="section-title">聚合平台管理</h2>

    <div class="action-bar">
      <el-button type="primary" :loading="syncing" @click="handleSync">
        <el-icon><Refresh /></el-icon> 手动同步游戏
      </el-button>
      <span v-if="lastSyncInfo" class="sync-info">{{ lastSyncInfo }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="skeleton-table">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- Platforms Table -->
    <div v-else class="table-card">
      <el-table :data="platforms" stripe row-key="code">
        <el-table-column prop="code" label="平台代码" width="150" />
        <el-table-column prop="name" label="平台名称" width="140" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTagMap[row.type] || 'info'">{{ typeNameMap[row.type] || row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="H5分类" width="100">
          <template #default="{ row }">{{ categoryNameMap[row.category] || row.category }}</template>
        </el-table-column>
        <el-table-column prop="game_count" label="游戏数" width="80" />
        <el-table-column prop="last_sync" label="最后同步" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="!!row.enabled"
              @change="(val) => handleTogglePlatform(row, val)"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="viewGames(row)">
              查看游戏
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Platform Games Dialog -->
    <el-dialog v-model="gamesDialog" :title="currentPlatform?.name + ' — 游戏列表'" width="700px" top="5vh">
      <div v-if="gamesLoading" style="text-align: center; padding: 20px;">
        <el-skeleton :rows="5" animated />
      </div>
      <template v-else>
        <div style="margin-bottom: 12px; color: #a0a0b0;">
          共 {{ platformGames.length }} 款游戏
        </div>
        <el-table :data="platformGames" stripe max-height="400px" size="small">
          <el-table-column prop="game_code" label="游戏代码" width="160" />
          <el-table-column prop="game_name" label="游戏名称" min-width="200" />
          <el-table-column prop="game_type" label="类型" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status === 'active'"
                @change="(val) => handleToggleGame(row, val)"
                size="small"
              />
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSK7755Platforms, toggleSK7755Platform, getSK7755PlatformGames, toggleSK7755Game, syncSK7755Games } from '@/api/games'

const loading = ref(true)
const syncing = ref(false)
const platforms = ref([])
const lastSyncInfo = ref('')

const gamesDialog = ref(false)
const gamesLoading = ref(false)
const currentPlatform = ref(null)
const platformGames = ref([])

const typeTagMap = { SLOT: 'primary', LIVE: 'success', SPORT: 'warning', FH: '', LOTTERY: 'danger' }
const typeNameMap = { SLOT: '电子', LIVE: '真人', SPORT: '体育', FH: '捕鱼', LOTTERY: '彩票' }
const categoryNameMap = { slots: '电子', live: '真人', sports: '体育', fishing: '捕鱼', lottery: '彩票' }

async function fetchPlatforms() {
  loading.value = true
  try {
    platforms.value = await getSK7755Platforms()
  } catch (err) {
    ElMessage.error('加载平台列表失败')
  }
  loading.value = false
}

async function handleTogglePlatform(row, enabled) {
  try {
    await toggleSK7755Platform(row.code, enabled)
    row.enabled = enabled ? 1 : 0
    ElMessage.success(`${row.name} 已${enabled ? '启用' : '禁用'}`)
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

async function viewGames(row) {
  currentPlatform.value = row
  gamesDialog.value = true
  gamesLoading.value = true
  try {
    platformGames.value = await getSK7755PlatformGames(row.code)
  } catch (err) {
    ElMessage.error('加载游戏列表失败')
    platformGames.value = []
  }
  gamesLoading.value = false
}

async function handleToggleGame(row, enabled) {
  try {
    const newStatus = enabled ? 'active' : 'disabled'
    await toggleSK7755Game(row.platform, row.game_code, newStatus)
    row.status = newStatus
    ElMessage.success(`${row.game_name} 已${enabled ? '启用' : '禁用'}`)
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

async function handleSync() {
  syncing.value = true
  try {
    const res = await syncSK7755Games()
    ElMessage.success(`同步完成，共 ${res.gameCount} 款游戏`)
    lastSyncInfo.value = `最近同步: ${new Date().toLocaleString()} (${res.gameCount} 游戏)`
    await fetchPlatforms()
  } catch (err) {
    ElMessage.error('同步失败: ' + (err.error || err.message || ''))
  }
  syncing.value = false
}

onMounted(fetchPlatforms)
</script>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.sync-info {
  font-size: 13px;
  color: #a0a0b0;
}
</style>
