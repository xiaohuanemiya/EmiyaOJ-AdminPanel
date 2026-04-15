<template>
  <div class="role-container">
    <el-card>
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" v-permission="'ROLE.ADD'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
        <el-button type="danger" v-permission="'ROLE.DELETE'" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
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
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              v-permission="'ROLE.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'ROLE.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" v-permission="'ROLE.ASSIGN'" @click="handleAssignPermissions(row)">
              分配权限
            </el-button>
            <el-button type="danger" size="small" v-permission="'ROLE.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="formData.roleCode" placeholder="请输入角色编码" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
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

    <!-- 分配权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="600px" @close="resetPermissionDialog">
      <el-tree
        v-loading="permissionLoading"
        ref="treeRef"
        :data="permissionTree"
        :props="{ label: 'permissionName', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPermissions" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules, ElTree } from 'element-plus'
import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole,
  batchDeleteRoles,
  updateRoleStatus,
  assignPermissions,
  getRolePermissionIds
} from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import type { RoleVO, RoleSaveDTO, RoleQueryDTO, PermissionVO, PageVO } from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const permissionLoading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const treeRef = ref<InstanceType<typeof ElTree>>()
const tableData = ref<RoleVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const permissionTree = ref<PermissionVO[]>([])
const currentRoleId = ref<string>("")

const queryParams = reactive<RoleQueryDTO>({
  pageNum: 1,
  pageSize: 10
})

const formData = reactive<RoleSaveDTO>({
  roleCode: '',
  roleName: '',
  description: '',
  status: 1
})

const rules: FormRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { max: 50, message: '角色编码最多50个字符', trigger: 'blur' }
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称最多50个字符', trigger: 'blur' }
  ]
}

const dialogTitle = ref('新增角色')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRolePage(queryParams)
    const pageData = res.data as unknown as PageVO<RoleVO>
    tableData.value = pageData.list
    total.value = pageData.total
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  try {
    const res = await getPermissionTree()
    permissionTree.value = res.data as unknown as PermissionVO[]
  } catch (error) {
    console.error('获取权限树失败:', error)
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

const handleEdit = (row: RoleVO) => {
  dialogTitle.value = '编辑角色'
  Object.assign(formData, {
    id: row.id,
    roleCode: row.roleCode,
    roleName: row.roleName,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', { type: 'warning' })
    await deleteRole(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个角色吗？`, '提示', { type: 'warning' })
    await batchDeleteRoles(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

const handleStatusChange = async (row: RoleVO) => {
  try {
    await updateRoleStatus(row.id, row.status)
    ElMessage.success('状态修改成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          await updateRole(formData)
          ElMessage.success('修改成功')
        } else {
          await addRole(formData)
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

const handleAssignPermissions = async (row: RoleVO) => {
  currentRoleId.value = row.id
  permissionLoading.value = true
  
  try {
    // 1. 先获取权限树
    await fetchPermissionTree()
    
    // 2. 再获取该角色已有的权限
    const rolePermRes = await getRolePermissionIds(row.id)
    const rolePermissionIds = rolePermRes.data as unknown as string[]
    
    // 3. 显示对话框
    permissionDialogVisible.value = true
    
    // 4. 等待树组件渲染完成后，设置选中状态
    await new Promise(resolve => setTimeout(resolve, 200))
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(rolePermissionIds)
    }
  } catch (error) {
    ElMessage.error('加载权限失败')
    console.error('获取权限失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

const handleSubmitPermissions = async () => {
  if (!treeRef.value) return
  
  submitLoading.value = true
  try {
    const checkedKeys = treeRef.value.getCheckedKeys(false) as number[]
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys() as number[]
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    
    await assignPermissions(currentRoleId.value, allKeys)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('权限分配失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleSelectionChange = (selection: RoleVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    roleCode: '',
    roleName: '',
    description: '',
    status: 1
  })
}

const resetPermissionDialog = () => {
  permissionTree.value = []
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
  }
  currentRoleId.value = ""
  permissionLoading.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}
</style>
