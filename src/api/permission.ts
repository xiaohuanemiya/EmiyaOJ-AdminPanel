import request from '@/utils/request'
import type { 
  ResponseResult, 
  PermissionQueryDTO,
  PermissionVO, 
  PermissionSaveDTO 
} from '@/types/api'

/**
 * 查询权限列表
 */
export function getPermissionList(params?: PermissionQueryDTO) {
  return request<ResponseResult<PermissionVO[]>>({
    url: '/permission/list',
    method: 'get',
    params
  })
}

/**
 * 查询权限树
 */
export function getPermissionTree(params?: PermissionQueryDTO) {
  return request<ResponseResult<PermissionVO[]>>({
    url: '/permission/tree',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询权限
 */
export function getPermissionById(id: number) {
  return request<ResponseResult<PermissionVO>>({
    url: `/permission/${id}`,
    method: 'get'
  })
}

/**
 * 新增权限
 */
export function addPermission(data: PermissionSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/permission',
    method: 'post',
    data
  })
}

/**
 * 修改权限
 */
export function updatePermission(data: PermissionSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/permission',
    method: 'put',
    data
  })
}

/**
 * 删除权限
 */
export function deletePermission(id: number) {
  return request<ResponseResult<void>>({
    url: `/permission/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除权限
 */
export function batchDeletePermissions(ids: number[]) {
  return request<ResponseResult<void>>({
    url: '/permission/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改权限状态
 */
export function updatePermissionStatus(id: string, status: number) {
  return request<ResponseResult<void>>({
    url: `/permission/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 检查权限编码是否存在
 */
export function checkPermissionCodeExists(permissionCode: string, excludeId?: number) {
  return request<ResponseResult<boolean>>({
    url: '/permission/exists',
    method: 'get',
    params: { permissionCode, excludeId }
  })
}

/**
 * 根据角色ID查询权限列表
 */
export function getPermissionsByRoleId(roleId: number) {
  return request<ResponseResult<PermissionVO[]>>({
    url: `/permission/role/${roleId}`,
    method: 'get'
  })
}

/**
 * 根据用户ID查询权限列表
 */
export function getPermissionsByUserId(userId: number) {
  return request<ResponseResult<PermissionVO[]>>({
    url: `/permission/user/${userId}`,
    method: 'get'
  })
}
