import request from '@/utils/request'
import type { 
  ResponseResult, 
  Page,
  RoleQueryDTO,
  RoleVO, 
  RoleSaveDTO 
} from '@/types/api'

/**
 * 分页查询角色列表
 */
export function getRolePage(params: RoleQueryDTO) {
  return request<ResponseResult<Page<RoleVO>>>({
    url: '/role/page',
    method: 'get',
    params
  })
}

/**
 * 查询所有角色列表
 */
export function getAllRoles() {
  return request<ResponseResult<RoleVO[]>>({
    url: '/role/list',
    method: 'get'
  })
}

/**
 * 根据ID查询角色
 */
export function getRoleById(id: number) {
  return request<ResponseResult<RoleVO>>({
    url: `/role/${id}`,
    method: 'get'
  })
}

/**
 * 新增角色
 */
export function addRole(data: RoleSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/role',
    method: 'post',
    data
  })
}

/**
 * 修改角色
 */
export function updateRole(data: RoleSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/role',
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return request<ResponseResult<void>>({
    url: `/role/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除角色
 */
export function batchDeleteRoles(ids: string[]) {
  return request<ResponseResult<void>>({
    url: '/role/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改角色状态
 */
export function updateRoleStatus(id: string, status: number) {
  return request<ResponseResult<void>>({
    url: `/role/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 为角色分配权限
 */
export function assignPermissions(id: string, permissionIds: number[]) {
  return request<ResponseResult<void>>({
    url: `/role/${id}/permissions`,
    method: 'put',
    data: permissionIds
  })
}

/**
 * 获取角色权限列表
 */
export function getRolePermissionIds(id: string) {
  return request<ResponseResult<string[]>>({
    url: `/role/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 检查角色编码是否存在
 */
export function checkRoleCodeExists(roleCode: string, excludeId?: number) {
  return request<ResponseResult<boolean>>({
    url: '/role/exists',
    method: 'get',
    params: { roleCode, excludeId }
  })
}

/**
 * 根据用户ID查询角色列表
 */
export function getRolesByUserId(userId: string) {
  return request<ResponseResult<RoleVO[]>>({
    url: `/role/user/${userId}`,
    method: 'get'
  })
}
