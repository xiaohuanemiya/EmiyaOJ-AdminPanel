<template>
  <div class="contest-container">
    <el-card>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="queryParams.title" placeholder="竞赛标题" clearable class="filter-input" @keyup.enter="handleSearch" />
          <el-select v-model="queryParams.ruleType" placeholder="赛制" clearable class="filter-select">
            <el-option label="ACM/ICPC" :value="1" />
            <el-option label="IOI" :value="2" />
            <el-option label="Codeforces" :value="3" />
          </el-select>
          <el-select v-model="queryParams.status" placeholder="状态" clearable class="filter-select">
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
          <el-date-picker
            v-model="startRange"
            type="datetimerange"
            value-format="YYYY-MM-DDTHH:mm:ss"
            start-placeholder="开始时间起"
            end-placeholder="开始时间止"
            range-separator="至"
            class="range-picker"
          />
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
          新增竞赛
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="竞赛标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="赛制" width="120">
          <template #default="{ row }">{{ getRuleLabel(row.ruleType) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" show-overflow-tooltip />
        <el-table-column prop="endTime" label="结束时间" width="180" show-overflow-tooltip />
        <el-table-column label="封榜" width="90">
          <template #default="{ row }">{{ row.freezeBeforeMinutes ?? 0 }} 分钟</template>
        </el-table-column>
        <el-table-column label="题目数" width="90">
          <template #default="{ row }">{{ row.problemCount ?? row.problems?.length ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="330" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" @click="handleAdmins(row)">管理员</el-button>
            <el-button type="warning" size="small" @click="handleRegistrations(row)">报名</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="竞赛标题" prop="title">
          <el-input v-model="formData.title" maxlength="120" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="赛制" prop="ruleType">
              <el-select v-model="formData.ruleType" style="width: 100%;">
                <el-option label="ACM/ICPC" :value="1" />
                <el-option label="IOI" :value="2" />
                <el-option label="Codeforces" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%;">
                <el-option label="草稿" :value="0" />
                <el-option label="已发布" :value="1" />
                <el-option label="已取消" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="封榜分钟" prop="freezeBeforeMinutes">
              <el-input-number v-model="formData.freezeBeforeMinutes" :min="0" :max="10080" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="formData.startTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="formData.endTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邀请码" prop="inviteCode">
          <el-input v-model="formData.inviteCode" maxlength="10" placeholder="留空由服务端生成" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" />
        </el-form-item>

        <div class="section-title">
          <span>竞赛题目</span>
          <el-button size="small" type="primary" @click="openProblemSearch">
            <el-icon><Plus /></el-icon>
            搜索并添加题目
          </el-button>
        </div>
        <el-table :data="formData.problems" border size="small">
          <el-table-column label="题目" min-width="220">
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
          <el-table-column label="标签" width="120">
            <template #default="{ row }">
              <el-input v-model="row.label" maxlength="20" />
            </template>
          </el-table-column>
          <el-table-column label="排序" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.sortOrder" :min="1" style="width: 100%;" />
            </template>
          </el-table-column>
          <el-table-column label="分值" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.score" :min="0" style="width: 100%;" />
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

    <el-dialog v-model="adminDialogVisible" title="竞赛管理员" width="620px">
      <el-select v-model="selectedAdminIds" multiple filterable placeholder="选择拥有 CONTEST 权限的用户" style="width: 100%;">
        <el-option
          v-for="user in adminCandidates"
          :key="user.id"
          :label="`${user.nickname || user.username} (${user.username})`"
          :value="Number(user.id)"
        />
      </el-select>
      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adminSubmitLoading" @click="submitAdmins">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="registrationDialogVisible" title="报名列表" width="760px">
      <el-table v-loading="registrationLoading" :data="registrations" border>
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="nickname" label="昵称" min-width="140" />
        <el-table-column label="报名时间" min-width="180">
          <template #default="{ row }">{{ row.registerTime || row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="removeRegistration(row.userId)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
  addContest,
  deleteContest,
  deleteContestRegistration,
  getContestAdminCandidates,
  getContestById,
  getContestPage,
  getContestRegistrations,
  replaceContestAdmins,
  replaceContestProblems,
  updateContest
} from '@/api/contest'
import { getProblemById } from '@/api/problem'
import ProblemSearchDialog from '@/components/ProblemSearchDialog.vue'
import type {
  ContestProblemDTO,
  ContestQueryDTO,
  ContestRegistrationVO,
  ContestSaveDTO,
  ContestVO,
  PageVO,
  ProblemVO,
  UserVO
} from '@/types/api'

type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'

const loading = ref(false)
const submitLoading = ref(false)
const adminSubmitLoading = ref(false)
const registrationLoading = ref(false)
const dialogVisible = ref(false)
const adminDialogVisible = ref(false)
const registrationDialogVisible = ref(false)
const dialogTitle = ref('新增竞赛')
const tableData = ref<ContestVO[]>([])
const total = ref(0)
const formRef = ref<FormInstance>()
const startRange = ref<[string, string] | []>([])
const currentContestId = ref<number>()
const adminCandidates = ref<UserVO[]>([])
const selectedAdminIds = ref<number[]>([])
const registrations = ref<ContestRegistrationVO[]>([])
const problemSearchVisible = ref(false)
const previewDialogVisible = ref(false)
const previewingProblem = ref<ProblemVO | null>(null)
const problemInfoMap = ref<Map<number, ProblemVO>>(new Map())

const currentProblemIds = computed(() =>
  (formData.problems || []).map((p) => p.problemId).filter(Boolean)
)

const queryParams = reactive<ContestQueryDTO>({
  pageNum: 1,
  pageSize: 10,
  title: '',
  ruleType: undefined,
  status: undefined
})

const formData = reactive<ContestSaveDTO>({
  title: '',
  description: '',
  ruleType: 1,
  startTime: '',
  endTime: '',
  freezeBeforeMinutes: 0,
  inviteCode: '',
  status: 0,
  problems: []
})

const invitePattern = /^[A-Za-z0-9!@#$%&*_\-+=?]{10}$/
const rules: FormRules = {
  title: [{ required: true, message: '请输入竞赛标题', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择赛制', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  inviteCode: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || invitePattern.test(value)) callback()
        else callback(new Error('邀请码必须为 10 位，可包含字母、数字和 !@#$%&*_-+=?'))
      },
      trigger: 'blur'
    }
  ]
}

function getRuleLabel(ruleType: number) {
  const map: Record<number, string> = { 1: 'ACM/ICPC', 2: 'IOI', 3: 'Codeforces' }
  return map[ruleType] || '未知'
}

function getStatusLabel(status: number) {
  const map: Record<number, string> = { 0: '草稿', 1: '已发布', 2: '已取消' }
  return map[status] || '未知'
}

function getStatusType(status: number): TagType {
  const map: Record<number, TagType> = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

function normalizeProblems(problems: ContestProblemDTO[] = []) {
  return problems
    .filter((item) => item.problemId)
    .map((item, index) => ({
      problemId: Number(item.problemId),
      label: item.label || String.fromCharCode(65 + index),
      sortOrder: Number(item.sortOrder || index + 1),
      score: Number(item.score || 0)
    }))
}

async function fetchData() {
  loading.value = true
  try {
    const params: ContestQueryDTO = { ...queryParams }
    if (startRange.value.length === 2) {
      params.startFrom = startRange.value[0]
      params.startTo = startRange.value[1]
    }
    const res = await getContestPage(params)
    const pageData = res.data as PageVO<ContestVO>
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
  queryParams.ruleType = undefined
  queryParams.status = undefined
  startRange.value = []
  fetchData()
}

function handleAdd() {
  dialogTitle.value = '新增竞赛'
  problemInfoMap.value = new Map()
  dialogVisible.value = true
}

async function handleEdit(row: ContestVO) {
  dialogTitle.value = '编辑竞赛'
  const res = await getContestById(row.id)
  const detail = res.data
  problemInfoMap.value = new Map()
  const problems = normalizeProblems(detail.problems || [])
  Object.assign(formData, {
    id: detail.id,
    title: detail.title,
    description: detail.description || '',
    ruleType: detail.ruleType,
    startTime: detail.startTime,
    endTime: detail.endTime,
    freezeBeforeMinutes: detail.freezeBeforeMinutes || 0,
    inviteCode: detail.inviteCode || '',
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
  await ElMessageBox.confirm('确认删除该竞赛吗？', '提示', { type: 'warning' })
  await deleteContest(id)
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
        label: String.fromCharCode(64 + nextOrder + i),
        sortOrder: nextOrder + i,
        score: 100
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
  if (new Date(formData.startTime).getTime() >= new Date(formData.endTime).getTime()) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  submitLoading.value = true
  try {
    const problems = normalizeProblems(formData.problems)
    const payload: ContestSaveDTO = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      ruleType: formData.ruleType,
      startTime: formData.startTime,
      endTime: formData.endTime,
      freezeBeforeMinutes: formData.freezeBeforeMinutes || 0,
      inviteCode: formData.inviteCode || undefined,
      status: formData.status
    }
    if (payload.id) {
      await updateContest(payload)
      await replaceContestProblems(payload.id, problems)
      ElMessage.success('修改成功')
    } else {
      await addContest({ ...payload, problems })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleAdmins(row: ContestVO) {
  currentContestId.value = row.id
  const [candidatesRes, detailRes] = await Promise.all([getContestAdminCandidates(), getContestById(row.id)])
  adminCandidates.value = candidatesRes.data || []
  const detail = detailRes.data as ContestVO & { adminIds?: number[]; admins?: UserVO[] }
  selectedAdminIds.value = detail.adminIds || detail.admins?.map((user) => Number(user.id)) || []
  adminDialogVisible.value = true
}

async function submitAdmins() {
  if (!currentContestId.value) return
  adminSubmitLoading.value = true
  try {
    await replaceContestAdmins(currentContestId.value, selectedAdminIds.value)
    ElMessage.success('管理员已保存')
    adminDialogVisible.value = false
  } finally {
    adminSubmitLoading.value = false
  }
}

async function handleRegistrations(row: ContestVO) {
  currentContestId.value = row.id
  registrationDialogVisible.value = true
  registrationLoading.value = true
  try {
    const res = await getContestRegistrations(row.id)
    registrations.value = res.data || []
  } finally {
    registrationLoading.value = false
  }
}

async function removeRegistration(userId: number) {
  if (!currentContestId.value) return
  await ElMessageBox.confirm('确认移除该报名用户吗？', '提示', { type: 'warning' })
  await deleteContestRegistration(currentContestId.value, userId)
  registrations.value = registrations.value.filter((item) => item.userId !== userId)
  ElMessage.success('移除成功')
}

function resetForm() {
  formRef.value?.resetFields()
  problemInfoMap.value = new Map()
  Object.assign(formData, {
    id: undefined,
    title: '',
    description: '',
    ruleType: 1,
    startTime: '',
    endTime: '',
    freezeBeforeMinutes: 0,
    inviteCode: '',
    status: 0,
    problems: []
  })
}

onMounted(fetchData)
</script>

<style scoped>
.contest-container {
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
  width: 200px;
}

.filter-select {
  width: 130px;
}

.range-picker {
  width: 380px;
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

/* 题目预览对话框样式 */
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
