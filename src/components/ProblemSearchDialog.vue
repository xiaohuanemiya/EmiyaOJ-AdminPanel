<template>
  <el-dialog v-model="visible" title="搜索题目" width="960px" destroy-on-close @close="handleClose">
    <div class="search-bar">
      <el-input
        v-model="searchTitle"
        placeholder="输入题目标题搜索"
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="searchDifficulty" placeholder="难度" clearable class="difficulty-select">
        <el-option label="简单" :value="1" />
        <el-option label="中等" :value="2" />
        <el-option label="困难" :value="3" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <div class="content-wrap">
      <div class="table-section">
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          height="380"
          highlight-current-row
          @row-click="handleRowClick"
        >
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="title" label="题目标题" min-width="180" show-overflow-tooltip />
          <el-table-column label="难度" width="80">
            <template #default="{ row }">{{ getDifficultyLabel(row.difficulty) }}</template>
          </el-table-column>
          <el-table-column label="选择" width="60">
            <template #default="{ row }">
              <el-checkbox
                :model-value="isSelected(row.id)"
                :disabled="isDisabled(row.id)"
                @change="(val: boolean) => toggleSelect(row, val)"
                @click.stop
              />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          small
          class="inner-pager"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>

      <div class="preview-section">
        <div v-if="selectedProblem" class="preview-content">
          <h3 class="preview-title">#{{ selectedProblem.id }} {{ selectedProblem.title }}</h3>
          <el-tag size="small" :type="getDifficultyTagType(selectedProblem.difficulty)">
            {{ getDifficultyLabel(selectedProblem.difficulty) }}
          </el-tag>
          <el-tag
            v-for="tag in selectedProblem.tags"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
            style="margin-left: 4px;"
          >
            {{ tag }}
          </el-tag>

          <el-divider />

          <div class="preview-section-item">
            <h4>题目描述</h4>
            <div class="preview-text">{{ selectedProblem.description || '暂无描述' }}</div>
          </div>

          <div v-if="selectedProblem.inputDescription" class="preview-section-item">
            <h4>输入描述</h4>
            <div class="preview-text">{{ selectedProblem.inputDescription }}</div>
          </div>

          <div v-if="selectedProblem.outputDescription" class="preview-section-item">
            <h4>输出描述</h4>
            <div class="preview-text">{{ selectedProblem.outputDescription }}</div>
          </div>

          <div class="preview-row">
            <div v-if="selectedProblem.sampleInput" class="preview-section-item flex-1">
              <h4>输入样例</h4>
              <pre class="sample-block">{{ selectedProblem.sampleInput }}</pre>
            </div>
            <div v-if="selectedProblem.sampleOutput" class="preview-section-item flex-1">
              <h4>输出样例</h4>
              <pre class="sample-block">{{ selectedProblem.sampleOutput }}</pre>
            </div>
          </div>

          <div v-if="selectedProblem.hint" class="preview-section-item">
            <h4>提示</h4>
            <div class="preview-text">{{ selectedProblem.hint }}</div>
          </div>

          <div class="preview-meta">
            <span>时间限制: {{ selectedProblem.timeLimit }}ms</span>
            <span>内存限制: {{ selectedProblem.memoryLimit }}MB</span>
            <span v-if="selectedProblem.stackLimit">栈限制: {{ selectedProblem.stackLimit }}MB</span>
          </div>
        </div>
        <el-empty v-else description="点击左侧题目行预览详情" :image-size="80" />
      </div>
    </div>

    <div v-if="selectedIds.length" class="selected-bar">
      <span class="selected-label">已选择 {{ selectedIds.length }} 题：</span>
      <el-tag
        v-for="id in selectedIds"
        :key="id"
        closable
        size="small"
        type="primary"
        style="margin-right: 6px;"
        @close="removeSelect(id)"
      >
        #{{ id }}
      </el-tag>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedIds.length" @click="handleConfirm">
        添加选中题目 ({{ selectedIds.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getProblemPage } from '@/api/problem'
import type { PageVO, ProblemVO } from '@/types/api'

const props = defineProps<{
  modelValue: boolean
  excludeIds?: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [problems: ProblemVO[]]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const searchTitle = ref('')
const searchDifficulty = ref<number | undefined>(undefined)
const tableData = ref<ProblemVO[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const selectedIds = ref<number[]>([])
const selectedProblemsMap = ref<Map<number, ProblemVO>>(new Map())
const selectedProblem = ref<ProblemVO | null>(null)

const excludeSet = computed(() => new Set(props.excludeIds || []))

function isSelected(id: number) {
  return selectedIds.value.includes(id)
}

function isDisabled(id: number) {
  return excludeSet.value.has(id)
}

function getDifficultyLabel(d: number) {
  const map: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return map[d] || '未知'
}

function getDifficultyTagType(d: number): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return (map[d] || 'info') as 'success' | 'warning' | 'danger' | 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getProblemPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      title: searchTitle.value || undefined,
      difficulty: searchDifficulty.value
    })
    const pageData = res.data as PageVO<ProblemVO>
    tableData.value = pageData.list || pageData.records || []
    total.value = pageData.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchData()
}

function handleRowClick(row: ProblemVO) {
  selectedProblem.value = row
}

function toggleSelect(row: ProblemVO, val: boolean) {
  if (val) {
    if (!selectedIds.value.includes(row.id)) {
      selectedIds.value.push(row.id)
      selectedProblemsMap.value.set(row.id, row)
    }
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
    selectedProblemsMap.value.delete(row.id)
  }
}

function removeSelect(id: number) {
  selectedIds.value = selectedIds.value.filter((i) => i !== id)
  selectedProblemsMap.value.delete(id)
}

function handleConfirm() {
  const problems = selectedIds.value
    .map((id) => selectedProblemsMap.value.get(id))
    .filter(Boolean) as ProblemVO[]
  emit('confirm', problems)
  handleClose()
}

function handleClose() {
  selectedIds.value = []
  selectedProblemsMap.value = new Map()
  selectedProblem.value = null
  searchTitle.value = ''
  searchDifficulty.value = undefined
  tableData.value = []
  total.value = 0
  pageNum.value = 1
}

watch(visible, (val) => {
  if (val) fetchData()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
}

.difficulty-select {
  width: 120px;
}

.content-wrap {
  display: flex;
  gap: 16px;
  height: 440px;
}

.table-section {
  flex: 1.2;
  display: flex;
  flex-direction: column;
}

.table-section :deep(.el-table) {
  flex: 1;
}

.inner-pager {
  margin-top: 10px;
  justify-content: flex-end;
}

.preview-section {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  overflow-y: auto;
  background: #fafafa;
}

.preview-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.preview-section-item {
  margin-bottom: 12px;
}

.preview-section-item h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: #606266;
}

.preview-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.sample-block {
  margin: 0;
  padding: 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
}

.preview-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.selected-bar {
  margin-top: 12px;
  padding: 10px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.selected-label {
  font-size: 13px;
  color: #67c23a;
  margin-right: 8px;
}
</style>
