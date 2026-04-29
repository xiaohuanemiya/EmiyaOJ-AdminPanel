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
          <el-button size="small" type="primary" @click="addProblemRow">
            <el-icon><Plus /></el-icon>
            添加题目
          </el-button>
        </div>
        <el-table :data="formData.problems" border size="small">
          <el-table-column label="题目 ID" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.problemId" :min="1" :controls="false" style="width: 100%;" />
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
          <el-table-column label="操作" width="100">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  addProblemSet,
  deleteProblemSet,
  getProblemSetById,
  getProblemSetPage,
  replaceProblemSetProblems,
  updateProblemSet
} from '@/api/problemSet'
import type {
  PageVO,
  ProblemSetProblemDTO,
  ProblemSetQueryDTO,
  ProblemSetSaveDTO,
  ProblemSetVO
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
  dialogVisible.value = true
}

async function handleEdit(row: ProblemSetVO) {
  dialogTitle.value = '编辑题单'
  const res = await getProblemSetById(row.id)
  const detail = res.data
  Object.assign(formData, {
    id: detail.id,
    title: detail.title,
    description: detail.description || '',
    status: detail.status,
    problems: normalizeProblems(detail.problems || [])
  })
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确认删除该题单吗？', '提示', { type: 'warning' })
  await deleteProblemSet(id)
  ElMessage.success('删除成功')
  fetchData()
}

function addProblemRow() {
  const next = (formData.problems?.length || 0) + 1
  formData.problems?.push({
    problemId: 1,
    sortOrder: next,
    note: ''
  })
}

function removeProblemRow(index: number) {
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
</style>
