<template>
  <div class="problem-set-container">
    <el-card>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="queryParams.title" placeholder="题单标题" clearable class="filter-input" @keyup.enter="handleSearch" />
          <el-select v-model="queryParams.status" placeholder="状态" clearable class="filter-select">
            <el-option label="隐藏" :value="0" />
            <el-option label="公开" :value="1" />
          </el-select>
          <el-input-number v-model="queryParams.creatorId" :controls="false" :min="1" placeholder="创建者 ID" class="creator-input" />
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增题单
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="题单标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="creatorId" label="创建者 ID" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '公开' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="题目数" width="100">
          <template #default="{ row }">{{ row.problemCount ?? row.problems?.length ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pager"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="860px" destroy-on-close @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="题单标题" prop="title">
          <el-input v-model="formData.title" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">隐藏</el-radio>
            <el-radio :value="1">公开</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" />
        </el-form-item>

        <div class="section-title">
          <span>题目关系</span>
          <el-button size="small" type="primary" @click="openProblemSearch">
            <el-icon><Plus /></el-icon>
            搜索并添加题目
          </el-button>
        </div>
        <el-table :data="formData.problems" border size="small">
          <el-table-column label="题目" min-width="240">
            <template #default="{ row }">
              <div class="problem-cell">
                <span class="problem-id">#{{ row.problemId }}</span>
                <span class="problem-title">{{ getProblemTitle(row.problemId) || '（未加载）' }}</span>
                <el-button size="small" text type="primary" @click="previewProblem(row.problemId)">
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.sortOrder" :min="1" style="width: 100%;" />
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="{ row }">
              <el-input v-model="row.note" maxlength="255" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" size="small" @click="removeProblemRow($index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ProblemSearchDialog
      v-model="problemSearchVisible"
      :exclude-ids="currentProblemIds"
      @confirm="onProblemsConfirmed"
    />

    <el-dialog v-model="previewDialogVisible" title="题目详情" width="760px" destroy-on-close>
      <div v-if="previewingProblem" class="problem-preview">
        <h3 class="preview-h">#{{ previewingProblem.id }} {{ previewingProblem.title }}</h3>
        <div class="preview-tags">
          <el-tag size="small" :type="getDifficultyTagType(previewingProblem.difficulty)">
            {{ getDifficultyLabel(previewingProblem.difficulty) }}
          </el-tag>
          <el-tag v-for="tag in (previewingProblem.tags || [])" :key="tag" size="small" type="info" effect="plain" style="margin-left:4px;">
            {{ tag }}
          </el-tag>
        </div>
        <el-divider />
        <div class="preview-section"><h4>题目描述</h4><div class="preview-text">{{ previewingProblem.description || '暂无描述' }}</div></div>
        <div v-if="previewingProblem.inputDescription" class="preview-section"><h4>输入描述</h4><div class="preview-text">{{ previewingProblem.inputDescription }}</div></div>
        <div v-if="previewingProblem.outputDescription" class="preview-section"><h4>输出描述</h4><div class="preview-text">{{ previewingProblem.outputDescription }}</div></div>
        <el-row :gutter="16">
          <el-col :span="12" v-if="previewingProblem.sampleInput">
            <div class="preview-section"><h4>输入样例</h4><pre class="sample-block">{{ previewingProblem.sampleInput }}</pre></div>
          </el-col>
          <el-col :span="12" v-if="previewingProblem.sampleOutput">
            <div class="preview-section"><h4>输出样例</h4><pre class="sample-block">{{ previewingProblem.sampleOutput }}</pre></div>
          </el-col>
        </el-row>
        <div v-if="previewingProblem.hint" class="preview-section"><h4>提示</h4><div class="preview-text">{{ previewingProblem.hint }}</div></div>
        <div class="preview-meta"><span>时间限制: {{ previewingProblem.timeLimit }}ms</span><span>内存限制: {{ previewingProblem.memoryLimit }}MB</span></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  addProblemSet,
  deleteProblemSet,
  getProblemSetById,
  getProblemSetPage,
  replaceProblemSetProblems,
  updateProblemSet
} from '@/api/problemSet'
import { getProblemById } from '@/api/problem'
import ProblemSearchDialog from '@/components/ProblemSearchDialog.vue'
import type {
  PageVO,
  ProblemSetProblemDTO,
  ProblemSetQueryDTO,
  ProblemSetSaveDTO,
  ProblemSetVO,
  ProblemVO
} from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增题单')
const tableData = ref<ProblemSetVO[]>([])
const total = ref(0)
const formRef = ref<FormInstance>()

const queryParams = reactive<ProblemSetQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  title: '',
  status: undefined,
  creatorId: undefined
})

const formData = reactive<ProblemSetSaveDTO>({
  title: '',
  description: '',
  status: 1,
  problems: []
})

const problemSearchVisible = ref(false)
const previewDialogVisible = ref(false)
const previewingProblem = ref<ProblemVO | null>(null)
const problemInfoMap = ref<Map<number, ProblemVO>>(new Map())

const currentProblemIds = computed(() =>
  (formData.problems || []).map((p) => p.problemId).filter(Boolean)
)

const rules: FormRules = {
  title: [{ required: true, message: '请输入题单标题', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function normalizeProblems(problems: ProblemSetProblemDTO[] = []) {
  return problems
    .filter((item) => item.problemId)
    .map((item, index) => ({
      problemId: Number(item.problemId),
      sortOrder: Number(item.sortOrder || index + 1),
      note: item.note || ''
    }))
}

async function fetchData() {
  loading.value = true
  try {
    const params: ProblemSetQueryDTO = { ...queryParams }
    const res = await getProblemSetPage(params)
    const pageData = res.data as PageVO<ProblemSetVO>
    tableData.value = pageData.list || pageData.records || []
    total.value = pageData.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  fetchData()
}

function handleReset() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.title = ''
  queryParams.status = undefined
  queryParams.creatorId = undefined
  fetchData()
}

function handleAdd() {
  dialogTitle.value = '新增题单'
  problemInfoMap.value = new Map()
  dialogVisible.value = true
}

async function handleEdit(row: ProblemSetVO) {
  dialogTitle.value = '编辑题单'
  const res = await getProblemSetById(row.id)
  const detail = res.data
  problemInfoMap.value = new Map()
  const problems = normalizeProblems(detail.problems || [])
  Object.assign(formData, {
    id: detail.id,
    title: detail.title,
    description: detail.description || '',
    status: detail.status,
    problems
  })
  dialogVisible.value = true
  // 批量加载题目标题
  problems.forEach((p) => {
    getProblemById(p.problemId).then((r) => {
      if (r.data) problemInfoMap.value.set(p.problemId, r.data)
    }).catch(() => {})
  })
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认删除该题单吗？', '提示', { type: 'warning' })
  await deleteProblemSet(id)
  ElMessage.success('删除成功')
  fetchData()
}

function openProblemSearch() {
  problemSearchVisible.value = true
}

function onProblemsConfirmed(problems: ProblemVO[]) {
  const nextOrder = (formData.problems?.length || 0) + 1
  problems.forEach((p, i) => {
    problemInfoMap.value.set(p.id, p)
    const exists = formData.problems?.find((item) => item.problemId === p.id)
    if (!exists) {
      formData.problems?.push({
        problemId: p.id,
        sortOrder: nextOrder + i,
        note: ''
      })
    }
  })
}

async function previewProblem(problemId: number) {
  previewingProblem.value = problemInfoMap.value.get(problemId) || null
  previewDialogVisible.value = true
  if (!previewingProblem.value) {
    try {
      const res = await getProblemById(problemId)
      const data = res.data
      previewingProblem.value = data
      problemInfoMap.value.set(problemId, data)
    } catch {
      previewDialogVisible.value = false
      ElMessage.error('获取题目详情失败')
    }
  }
}

function getProblemTitle(problemId: number): string {
  return problemInfoMap.value.get(problemId)?.title || ''
}

function getDifficultyLabel(d: number) {
  const map: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return map[d] || '未知'
}

function getDifficultyTagType(d: number): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return (map[d] || 'info') as 'success' | 'warning' | 'danger' | 'info'
}

function removeProblemRow(index: number) {
  const removed = formData.problems?.[index]
  if (removed) problemInfoMap.value.delete(removed.problemId)
  formData.problems?.splice(index, 1)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()

  submitLoading.value = true
  try {
    const problems = normalizeProblems(formData.problems)
    const payload: ProblemSetSaveDTO = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      status: formData.status
    }
    if (payload.id) {
      await updateProblemSet(payload)
      await replaceProblemSetProblems(payload.id, problems)
      ElMessage.success('修改成功')
    } else {
      await addProblemSet({ ...payload, problems })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
  problemInfoMap.value = new Map()
  Object.assign(formData, {
    id: undefined,
    title: '',
    description: '',
    status: 1,
    problems: []
  })
}

onMounted(fetchData)
</script>

<style scoped>
.problem-set-container {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 120px;
}

.creator-input {
  width: 150px;
}

.pager {
  margin-top: 20px;
  justify-content: flex-end;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 12px;
  font-weight: 600;
  color: #303133;
}

.problem-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.problem-id {
  font-weight: 600;
  color: #409eff;
  white-space: nowrap;
}

.problem-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  font-size: 13px;
}

.problem-preview {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-h {
  margin: 0 0 8px;
  font-size: 18px;
  color: #303133;
}

.preview-tags {
  margin-bottom: 4px;
}

.preview-section {
  margin-bottom: 12px;
}

.preview-section h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: #606266;
}

.preview-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.sample-block {
  margin: 0;
  padding: 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 140px;
  overflow-y: auto;
}

.preview-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
