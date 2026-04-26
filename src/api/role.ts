import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO,
  RoleQueryDTO,
  RoleVO, 
  RoleSaveDTO 
} from '@/types/api'

/**
 * 分页查询角色列表 (POST /role/page)
 */
export function getRolePage(data: RoleQueryDTO) {
  return request<ResponseResult<PageVO<RoleVO>>>({
    url: '/role/page',
    method: 'post',
    data
  })
}

/**
 * 查询所有角色列表 (GET /role/list)
 */
export function getAllRoles() {
  return request<ResponseResult<RoleVO[]>>({
    url: '/role/list',
    method: 'get'
  })
}

/**
 * 根据ID查询角色详情 (GET /role/{id})
 */
export function getRoleById(id: string) {
  return request<ResponseResult<RoleVO>>({
    url: `/role/${id}`,
    method: 'get'
  })
}

/**
 * 新增角色 (POST /role)
 */
export function addRole(data: RoleSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/role',
    method: 'post',
    data
  })
}

/**
 * 修改角色 (PUT /role)
 */
export function updateRole(data: RoleSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/role',
    method: 'put',
    data
  })
}

/**
 * 删除角色 (DELETE /role/{id})
 */
export function deleteRole(id: string) {
  return request<ResponseResult<string>>({
    url: `/role/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除角色 (DELETE /role/batch)
 */
export function batchDeleteRoles(ids: string[]) {
  return request<ResponseResult<string>>({
    url: '/role/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改角色状态 (PUT /role/{id}/status)
 */
export function updateRoleStatus(id: string, status: number) {
  return request<ResponseResult<string>>({
    url: `/role/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 为角色分配权限 (PUT /role/{id}/permissions)
 */
export function assignPermissions(id: string, permissionIds: number[]) {
  return request<ResponseResult<string>>({
    url: `/role/${id}/permissions`,
    method: 'put',
    data: permissionIds
  })
}

/**
 * 获取角色已分配的权限ID列表 (GET /role/{id}/permissions)
 */
export function getRolePermissionIds(id: string) {
  return request<ResponseResult<string[]>>({
    url: `/role/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 检查角色编码是否存在 (GET /role/exists)
 */
export function checkRoleCodeExists(roleCode: string, excludeId?: number) {
  return request<ResponseResult<boolean>>({
    url: '/role/exists',
    method: 'get',
    params: { roleCode, excludeId }
  })
}

/**
 * 根据用户ID查询角色列表 (GET /role/user/{userId})
 */
export function getRolesByUserId(userId: string) {
  return request<ResponseResult<RoleVO[]>>({
    url: `/role/user/${userId}`,
    method: 'get'
  })
}
