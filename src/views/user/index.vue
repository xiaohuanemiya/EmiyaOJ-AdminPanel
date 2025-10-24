<template>
  <div class="user-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-button type="primary" v-permission="'USER.ADD'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button type="danger" v-permission="'USER.DELETE'" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="margin-top: 20px;"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              v-permission="'USER.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'USER.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" v-permission="'USER.EDIT'" @click="handleAssignRoles(row)">
              分配角色
            </el-button>
            <el-button type="danger" size="small" v-permission="'USER.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="密码" :prop="formData.id ? '' : 'password'">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
          <span v-if="formData.id" style="font-size: 12px; color: #909399;">不修改密码请留空</span>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
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

    <!-- 分配角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-checkbox-group v-model="selectedRoleIds">
        <el-checkbox v-for="role in allRoles" :key="role.id" :value="role.id">
          {{ role.roleName }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRoles" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getUserPage,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  assignRoles
} from '@/api/user'
import { getAllRoles, getRolesByUserId } from '@/api/role'
import type { UserVO, UserSaveDTO, PageDTO, PageVO, RoleVO } from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const roleDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<UserVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const allRoles = ref<RoleVO[]>([])
const selectedRoleIds = ref<number[]>([])
const currentUserId = ref<string>("")

const queryParams = reactive<PageDTO>({
  pageNo: 1,
  pageSize: 10
})

const formData = reactive<UserSaveDTO>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const dialogTitle = ref('新增用户')

// 查询数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage(queryParams)
    const pageData = res.data as unknown as PageVO<UserVO>
    tableData.value = pageData.list
    total.value = pageData.total
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取所有角色
const fetchAllRoles = async () => {
  try {
    const res = await getAllRoles()
    allRoles.value = (res.data || []) as unknown as RoleVO[]
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: UserVO) => {
  dialogTitle.value = '编辑用户'
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    status: row.status,
    password: ''
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？', '提示', { type: 'warning' })
    await deleteUser(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个用户吗？`, '提示', { type: 'warning' })
    await batchDeleteUsers(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 修改状态
const handleStatusChange = async (row: UserVO) => {
  try {
    await updateUserStatus(row.id, row.status)
    ElMessage.success('状态修改成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
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
          await updateUser(formData)
          ElMessage.success('修改成功')
        } else {
          await addUser(formData)
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

// 分配角色
const handleAssignRoles = async (row: UserVO) => {
  currentUserId.value = row.id
  try {
    const res = await getRolesByUserId(row.id)
    const roles = (res.data || []) as unknown as RoleVO[]
    selectedRoleIds.value = roles.map((role: RoleVO) => role.id)
  } catch (error) {
    console.error('获取用户角色失败:', error)
  }
  roleDialogVisible.value = true
}

// 提交角色分配
const handleSubmitRoles = async () => {
  submitLoading.value = true
  try {
    await assignRoles(currentUserId.value, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.error('角色分配失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: UserVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    status: 1
  })
}

onMounted(() => {
  fetchData()
  fetchAllRoles()
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}
</style>
