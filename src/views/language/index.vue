<template>
  <div class="language-container">
    <el-card>
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

      <el-table
        v-loading="loading"
        :data="tableData"
        style="margin-top: 20px; width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="语言名称" width="110" />
        <el-table-column prop="version" label="显示版本" width="120" />
        <el-table-column prop="languageVersion" label="模板版本" width="120" />
        <el-table-column prop="sourceFileExt" label="源文件扩展名" width="120" />
        <el-table-column label="文件名" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.compileFileName || '-' }} / {{ row.executableFileName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="是否编译" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isCompiled === 1 ? 'success' : 'info'" size="small">
              {{ row.isCompiled === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="compileCommand" label="编译命令" min-width="220" show-overflow-tooltip />
        <el-table-column prop="runCommand" label="运行命令" min-width="180" show-overflow-tooltip />
        <el-table-column label="资源倍数" width="130">
          <template #default="{ row }">
            {{ row.timeLimitMultiplier }}x / {{ row.memoryLimitMultiplier }}x
          </template>
        </el-table-column>
        <el-table-column label="编译限制" width="170">
          <template #default="{ row }">
            {{ row.compileTimeLimit }}ms / {{ row.compileMemoryLimit }}MB
          </template>
        </el-table-column>
        <el-table-column label="进程限制" width="120">
          <template #default="{ row }">
            {{ row.compileProcLimit }} / {{ row.runProcLimit }}
          </template>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="语言名称" prop="name">
              <el-input v-model="formData.name" placeholder="C++" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示版本" prop="version">
              <el-input v-model="formData.version" placeholder="C++20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板版本" prop="languageVersion">
              <el-input v-model="formData.languageVersion" placeholder="c++20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="源文件扩展名" prop="sourceFileExt">
              <el-input v-model="formData.sourceFileExt" placeholder="cpp" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编译文件名" prop="compileFileName">
              <el-input v-model="formData.compileFileName" placeholder="main" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可执行文件名" prop="executableFileName">
              <el-input v-model="formData.executableFileName" placeholder="main" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="编译产物" prop="compiledFileNames">
          <el-input v-model="formData.compiledFileNames" placeholder="main" />
        </el-form-item>
        <el-form-item label="环境变量" prop="envVars">
          <el-input
            v-model="formData.envVars"
            type="textarea"
            :rows="2"
            placeholder="PATH=/usr/bin:/bin"
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
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="编译命令" prop="compileCommand">
          <el-input
            v-model="formData.compileCommand"
            type="textarea"
            :rows="2"
            :disabled="formData.isCompiled === 0"
            placeholder="/usr/bin/g++ -std={LanguageVersion} -O2 -o {ExecutableFileName} {CompileFileName}.cpp"
          />
        </el-form-item>
        <el-form-item label="运行命令" prop="runCommand">
          <el-input
            v-model="formData.runCommand"
            type="textarea"
            :rows="2"
            placeholder="./{ExecutableFileName}"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间限制倍数" prop="timeLimitMultiplier">
              <el-input-number
                v-model="formData.timeLimitMultiplier"
                :min="0.01"
                :max="100"
                :step="0.1"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存限制倍数" prop="memoryLimitMultiplier">
              <el-input-number
                v-model="formData.memoryLimitMultiplier"
                :min="0.01"
                :max="100"
                :step="0.1"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编译时间限制" prop="compileTimeLimit">
              <el-input-number
                v-model="formData.compileTimeLimit"
                :min="1"
                :max="600000"
                :step="1000"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编译内存限制" prop="compileMemoryLimit">
              <el-input-number
                v-model="formData.compileMemoryLimit"
                :min="1"
                :max="65536"
                :step="64"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编译进程限制" prop="compileProcLimit">
              <el-input-number
                v-model="formData.compileProcLimit"
                :min="1"
                :max="1024"
                :step="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行进程限制" prop="runProcLimit">
              <el-input-number
                v-model="formData.runProcLimit"
                :min="1"
                :max="1024"
                :step="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
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

const defaultFormData = (): LanguageSaveDTO => ({
  id: undefined,
  name: '',
  version: '',
  languageVersion: '',
  compileFileName: 'main',
  sourceFileExt: '',
  executableFileName: 'main',
  compiledFileNames: '',
  compileCommand: '',
  runCommand: '',
  envVars: 'PATH=/usr/bin:/bin',
  isCompiled: 1,
  timeLimitMultiplier: 1.0,
  memoryLimitMultiplier: 1.0,
  compileTimeLimit: 10000,
  compileMemoryLimit: 512,
  compileProcLimit: 50,
  runProcLimit: 1,
  status: 1
})

const formData = reactive<LanguageSaveDTO>(defaultFormData())

const forbiddenCommandPattern = /[\n;|`]|&&|\|\||\$\(/
const fileNamePattern = /^[A-Za-z0-9_.-]+$/
const extPattern = /^[A-Za-z0-9]+$/

const validateCompileCommand = (_rule: unknown, value: string | null | undefined, callback: (error?: Error) => void) => {
  if (formData.isCompiled === 1 && !value?.trim()) {
    callback(new Error('请输入编译命令'))
    return
  }
  if (value && forbiddenCommandPattern.test(value)) {
    callback(new Error('命令不能包含换行、;、|、&&、||、反引号或 $('))
    return
  }
  callback()
}

const validateRunCommand = (_rule: unknown, value: string | undefined, callback: (error?: Error) => void) => {
  if (!value?.trim()) {
    callback(new Error('请输入运行命令'))
    return
  }
  if (forbiddenCommandPattern.test(value)) {
    callback(new Error('命令不能包含换行、;、|、&&、||、反引号或 $('))
    return
  }
  callback()
}

const validateFileName = (_rule: unknown, value: string | undefined, callback: (error?: Error) => void) => {
  if (value && !fileNamePattern.test(value)) {
    callback(new Error('文件名只能包含字母、数字、下划线、点和短横线'))
    return
  }
  callback()
}

const rules: FormRules<LanguageSaveDTO> = {
  name: [
    { required: true, message: '请输入语言名称', trigger: 'blur' },
    { max: 50, message: '语言名称最多50个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入显示版本', trigger: 'blur' }
  ],
  languageVersion: [
    { required: true, message: '请输入模板版本', trigger: 'blur' }
  ],
  compileFileName: [
    { validator: validateFileName, trigger: 'blur' }
  ],
  executableFileName: [
    { validator: validateFileName, trigger: 'blur' }
  ],
  sourceFileExt: [
    { required: true, message: '请输入源文件扩展名', trigger: 'blur' },
    { pattern: extPattern, message: '扩展名只能包含字母和数字', trigger: 'blur' }
  ],
  compileCommand: [
    { validator: validateCompileCommand, trigger: 'blur' }
  ],
  runCommand: [
    { validator: validateRunCommand, trigger: 'blur' }
  ],
  timeLimitMultiplier: [
    { required: true, message: '请输入时间限制倍数', trigger: 'blur' }
  ],
  memoryLimitMultiplier: [
    { required: true, message: '请输入内存限制倍数', trigger: 'blur' }
  ],
  compileTimeLimit: [
    { required: true, message: '请输入编译时间限制', trigger: 'blur' }
  ],
  compileMemoryLimit: [
    { required: true, message: '请输入编译内存限制', trigger: 'blur' }
  ],
  compileProcLimit: [
    { required: true, message: '请输入编译进程限制', trigger: 'blur' }
  ],
  runProcLimit: [
    { required: true, message: '请输入运行进程限制', trigger: 'blur' }
  ]
}

watch(
  () => formData.isCompiled,
  () => {
    formRef.value?.validateField('compileCommand')
  }
)

const normalizeOptionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const buildSubmitData = (): LanguageSaveDTO => ({
  ...formData,
  compiledFileNames: normalizeOptionalText(formData.compiledFileNames),
  compileCommand: formData.isCompiled === 1 ? normalizeOptionalText(formData.compileCommand) : null,
  envVars: normalizeOptionalText(formData.envVars),
  compileFileName: normalizeOptionalText(formData.compileFileName) || undefined,
  executableFileName: normalizeOptionalText(formData.executableFileName) || undefined
})

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

const handleAdd = () => {
  dialogTitle.value = '新增语言'
  dialogVisible.value = true
}

const handleEdit = (row: LanguageVO) => {
  dialogTitle.value = '编辑语言'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    version: row.version,
    languageVersion: row.languageVersion,
    compileFileName: row.compileFileName,
    sourceFileExt: row.sourceFileExt,
    executableFileName: row.executableFileName,
    compiledFileNames: row.compiledFileNames || '',
    compileCommand: row.compileCommand || '',
    runCommand: row.runCommand,
    envVars: row.envVars || '',
    isCompiled: row.isCompiled,
    timeLimitMultiplier: row.timeLimitMultiplier,
    memoryLimitMultiplier: row.memoryLimitMultiplier,
    compileTimeLimit: row.compileTimeLimit,
    compileMemoryLimit: row.compileMemoryLimit,
    compileProcLimit: row.compileProcLimit,
    runProcLimit: row.runProcLimit,
    status: row.status
  })
  dialogVisible.value = true
}

const handleEnable = async (row: LanguageVO) => {
  try {
    await enableLanguage(row.id)
    ElMessage.success('已启用')
    row.status = 1
  } catch (error) {
    console.error('启用失败:', error)
  }
}

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

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const submitData = buildSubmitData()
      if (submitData.id) {
        await updateLanguage(submitData)
        ElMessage.success('修改成功')
      } else {
        await addLanguage(submitData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, defaultFormData())
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
