<template>
  <div class="language-container">
    <el-card>
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" v-permission="'LANGUAGE.ADD'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增语言
        </el-button>
        <el-button @click="fetchData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="margin-top: 20px; width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="语言名称" width="100" />
        <el-table-column prop="version" label="版本" width="90" />
        <el-table-column prop="sourceFileExt" label="源文件扩展名" width="110" />
        <el-table-column label="是否编译" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isCompiled === 1 ? 'success' : 'info'" size="small">
              {{ row.isCompiled === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="compileCommand" label="编译命令" min-width="160" show-overflow-tooltip />
        <el-table-column prop="executeCommand" label="执行命令" min-width="130" show-overflow-tooltip />
        <el-table-column label="时间倍数" width="90">
          <template #default="{ row }">{{ row.timeLimitMultiplier }}x</template>
        </el-table-column>
        <el-table-column label="内存倍数" width="90">
          <template #default="{ row }">{{ row.memoryLimitMultiplier }}x</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'LANGUAGE.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              v-permission="'LANGUAGE.EDIT'"
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              v-permission="'LANGUAGE.EDIT'"
              @click="handleEnable(row)"
            >
              启用
            </el-button>
            <el-button type="danger" size="small" v-permission="'LANGUAGE.DELETE'" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="660px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="语言名称" prop="name">
              <el-input v-model="formData.name" placeholder="如 Java、C++" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="formData.version" placeholder="如 17、14" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源文件扩展名" prop="sourceFileExt">
              <el-input v-model="formData.sourceFileExt" placeholder="如 java、cpp" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产物扩展名" prop="executableExt">
              <el-input v-model="formData.executableExt" placeholder="如 class、exe" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="编译命令" prop="compileCommand">
          <el-input
            v-model="formData.compileCommand"
            placeholder="{src} 为源文件，{out} 为输出文件"
          />
        </el-form-item>
        <el-form-item label="执行命令" prop="executeCommand">
          <el-input
            v-model="formData.executeCommand"
            placeholder="{exe} 为可执行文件"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="是否需要编译" prop="isCompiled">
              <el-radio-group v-model="formData.isCompiled">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间限制倍数" prop="timeLimitMultiplier">
              <el-input-number
                v-model="formData.timeLimitMultiplier"
                :min="0.1"
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内存限制倍数" prop="memoryLimitMultiplier">
              <el-input-number
                v-model="formData.memoryLimitMultiplier"
                :min="0.1"
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getLanguageAdminList,
  addLanguage,
  updateLanguage,
  enableLanguage,
  disableLanguage,
  deleteLanguage
} from '@/api/language'
import type { LanguageVO, LanguageSaveDTO } from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增语言')
const formRef = ref<FormInstance>()
const tableData = ref<LanguageVO[]>([])

const formData = reactive<LanguageSaveDTO>({
  name: '',
  version: '',
  compileCommand: '',
  executeCommand: '',
  sourceFileExt: '',
  executableExt: '',
  isCompiled: 1,
  timeLimitMultiplier: 1.0,
  memoryLimitMultiplier: 1.0,
  status: 1
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入语言名称', trigger: 'blur' },
    { max: 50, message: '语言名称最多50个字符', trigger: 'blur' }
  ]
}

// 查询数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLanguageAdminList()
    tableData.value = (res.data || []) as unknown as LanguageVO[]
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增语言'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: LanguageVO) => {
  dialogTitle.value = '编辑语言'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    version: row.version,
    compileCommand: row.compileCommand,
    executeCommand: row.executeCommand,
    sourceFileExt: row.sourceFileExt,
    executableExt: row.executableExt,
    isCompiled: row.isCompiled,
    timeLimitMultiplier: row.timeLimitMultiplier,
    memoryLimitMultiplier: row.memoryLimitMultiplier,
    status: row.status
  })
  dialogVisible.value = true
}

// 启用
const handleEnable = async (row: LanguageVO) => {
  try {
    await enableLanguage(row.id)
    ElMessage.success('已启用')
    row.status = 1
  } catch (error) {
    console.error('启用失败:', error)
  }
}

// 禁用
const handleDisable = async (row: LanguageVO) => {
  try {
    await ElMessageBox.confirm(
      `确认禁用语言「${row.name}」？禁用后判题服务将无法使用该语言。`,
      '提示',
      { type: 'warning' }
    )
    await disableLanguage(row.id)
    ElMessage.success('已禁用')
    row.status = 0
  } catch (error) {
    if (error !== 'cancel') console.error('禁用失败:', error)
  }
}

// 删除
const handleDelete = async (row: LanguageVO) => {
  try {
    await ElMessageBox.confirm(
      `确认删除语言「${row.name}」？此操作为物理删除，不可恢复！建议先执行禁用。`,
      '危险操作',
      { type: 'error', confirmButtonText: '确认删除', confirmButtonClass: 'el-button--danger' }
    )
    await deleteLanguage(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') console.error('删除失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateLanguage(formData)
          ElMessage.success('修改成功')
        } else {
          await addLanguage(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    name: '',
    version: '',
    compileCommand: '',
    executeCommand: '',
    sourceFileExt: '',
    executableExt: '',
    isCompiled: 1,
    timeLimitMultiplier: 1.0,
    memoryLimitMultiplier: 1.0,
    status: 1
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.language-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}
</style>
