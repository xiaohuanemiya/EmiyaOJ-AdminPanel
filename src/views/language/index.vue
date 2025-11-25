<template>
  <div class="language-container">
    <el-card>
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>编程语言配置</span>
          <el-button type="primary" @click="fetchData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="语言名称" width="120" />
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="sourceFileExt" label="源文件扩展名" width="120" />
        <el-table-column label="是否编译" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isCompiled === 1 ? 'success' : 'info'">
              {{ row.isCompiled === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="compileCommand" label="编译命令" min-width="200" show-overflow-tooltip />
        <el-table-column prop="executeCommand" label="执行命令" min-width="150" show-overflow-tooltip />
        <el-table-column label="时间倍数" width="100">
          <template #default="{ row }">
            {{ row.timeLimitMultiplier }}x
          </template>
        </el-table-column>
        <el-table-column label="内存倍数" width="100">
          <template #default="{ row }">
            {{ row.memoryLimitMultiplier }}x
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="语言详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentLanguage?.id }}</el-descriptions-item>
        <el-descriptions-item label="语言名称">{{ currentLanguage?.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentLanguage?.version }}</el-descriptions-item>
        <el-descriptions-item label="是否编译">
          <el-tag :type="currentLanguage?.isCompiled === 1 ? 'success' : 'info'">
            {{ currentLanguage?.isCompiled === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="源文件扩展名">{{ currentLanguage?.sourceFileExt }}</el-descriptions-item>
        <el-descriptions-item label="可执行文件扩展名">{{ currentLanguage?.executableExt || '无' }}</el-descriptions-item>
        <el-descriptions-item label="编译命令" :span="2">
          <el-text class="command-text">{{ currentLanguage?.compileCommand }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="执行命令" :span="2">
          <el-text class="command-text">{{ currentLanguage?.executeCommand }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="时间限制倍数">{{ currentLanguage?.timeLimitMultiplier }}x</el-descriptions-item>
        <el-descriptions-item label="内存限制倍数">{{ currentLanguage?.memoryLimitMultiplier }}x</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLanguage?.status === 1 ? 'success' : 'danger'">
            {{ currentLanguage?.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentLanguage?.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentLanguage?.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLanguageList } from '@/api/language'
import type { LanguageVO } from '@/types/api'

const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref<LanguageVO[]>([])
const currentLanguage = ref<LanguageVO | null>(null)

// 查询数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLanguageList()
    tableData.value = (res.data || []) as unknown as LanguageVO[]
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleView = (row: LanguageVO) => {
  currentLanguage.value = row
  dialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.language-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.command-text {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
