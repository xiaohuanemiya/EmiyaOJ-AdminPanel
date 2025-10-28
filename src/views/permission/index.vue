<template>
  <div class="permission-container">
    <el-card>
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" v-permission="'PERMISSION.ADD'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增权限
        </el-button>
        <el-button @click="expandAll">展开全部</el-button>
        <el-button @click="collapseAll">折叠全部</el-button>
      </div>

      <!-- 树形表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="false"
        ref="tableRef"
        style="margin-top: 20px;"
      >
        <el-table-column prop="permissionName" label="权限名称" width="200" />
        <el-table-column prop="permissionCode" label="权限编码" />
        <el-table-column label="权限类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.permissionType === 1" type="success">菜单</el-tag>
            <el-tag v-else-if="row.permissionType === 2" type="warning">按钮</el-tag>
            <el-tag v-else type="info">接口</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              v-permission="'.EDIT'"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-permission="'PERMISSION.EDIT'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" v-permission="'PERMISSION.DELETE'" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="上级权限" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="permissionTreeOptions"
            :props="{ label: 'permissionName', children: 'children' }"
            check-strictly
            placeholder="选择上级权限（不选则为顶级权限）"
            clearable
          />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="formData.permissionCode" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="formData.permissionName" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限类型" prop="permissionType">
          <el-radio-group v-model="formData.permissionType">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
            <el-radio :value="3">接口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="formData.permissionType === 1">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="formData.permissionType === 1">
          <el-input v-model="formData.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="formData.permissionType === 1">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  getPermissionTree,
  addPermission,
  updatePermission,
  deletePermission,
  updatePermissionStatus
} from '@/api/permission'
import type { PermissionVO, PermissionSaveDTO } from '@/types/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableRef = ref()
const tableData = ref<PermissionVO[]>([])
const permissionTreeOptions = ref<PermissionVO[]>([])

const formData = reactive<PermissionSaveDTO>({
  parentId: '-1',
  permissionCode: '',
  permissionName: '',
  permissionType: 1,
  path: '',
  component: '',
  icon: '',
  sortOrder: 0,
  status: 1
})

const rules: FormRules = {
  permissionCode: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { max: 100, message: '权限编码最多100个字符', trigger: 'blur' }
  ],
  permissionName: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { max: 50, message: '权限名称最多50个字符', trigger: 'blur' }
  ],
  permissionType: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ]
}

const dialogTitle = ref('新增权限')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPermissionTree()
    tableData.value = res.data as unknown as PermissionVO[]
    permissionTreeOptions.value = res.data as unknown as PermissionVO[]
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增权限'
  dialogVisible.value = true
}

const handleEdit = (row: PermissionVO) => {
  dialogTitle.value = '编辑权限'
  Object.assign(formData, {
    id: row.id,
    parentId: row.parentId || 0,
    permissionCode: row.permissionCode,
    permissionName: row.permissionName,
    permissionType: row.permissionType,
    path: row.path,
    component: row.component,
    icon: row.icon,
    sortOrder: row.sortOrder,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该权限吗？删除后其子权限也会被删除！', '提示', { type: 'warning' })
    await deletePermission(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleStatusChange = async (row: PermissionVO) => {
  try {
    await updatePermissionStatus(row.id, row.status)
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
          await updatePermission(formData)
          ElMessage.success('修改成功')
        } else {
          await addPermission(formData)
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

const expandAll = () => {
  // 展开所有节点
  const expand = (data: PermissionVO[]) => {
    data.forEach(item => {
      tableRef.value?.toggleRowExpansion(item, true)
      if (item.children && item.children.length) {
        expand(item.children)
      }
    })
  }
  expand(tableData.value)
}

const collapseAll = () => {
  // 折叠所有节点
  const collapse = (data: PermissionVO[]) => {
    data.forEach(item => {
      tableRef.value?.toggleRowExpansion(item, false)
      if (item.children && item.children.length) {
        collapse(item.children)
      }
    })
  }
  collapse(tableData.value)
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    parentId: 0,
    permissionCode: '',
    permissionName: '',
    permissionType: 1,
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    status: 1
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}
</style>
