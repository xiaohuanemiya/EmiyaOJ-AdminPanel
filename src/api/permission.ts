import request from '@/utils/request'
import type { 
  ResponseResult, 
  PermissionQueryDTO,
  PermissionVO, 
  PermissionSaveDTO 
} from '@/types/api'

/**
 * 查询权限列表 (POST /permission/list)
 */
export function getPermissionList(data?: PermissionQueryDTO) {
  return request<ResponseResult<PermissionVO[]>>({
    url: '/permission/list',
    method: 'post',
    data: data || {}
  })
}

/**
 * 查询权限树 (POST /permission/tree)
 */
export function getPermissionTree(data?: PermissionQueryDTO) {
  return request<ResponseResult<PermissionVO[]>>({
    url: '/permission/tree',
    method: 'post',
    data: data || {}
  })
}

/**
 * 根据ID查询权限详情 (GET /permission/{id})
 */
export function getPermissionById(id: string) {
  return request<ResponseResult<PermissionVO>>({
    url: `/permission/${id}`,
    method: 'get'
  })
}

/**
 * 新增权限 (POST /permission)
 */
export function addPermission(data: PermissionSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/permission',
    method: 'post',
    data
  })
}

/**
 * 修改权限 (PUT /permission)
 */
export function updatePermission(data: PermissionSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/permission',
    method: 'put',
    data
  })
}

/**
 * 删除权限 (DELETE /permission/{id})
 */
export function deletePermission(id: string) {
  return request<ResponseResult<string>>({
    url: `/permission/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除权限 (DELETE /permission/batch)
 */
export function batchDeletePermissions(ids: number[]) {
  return request<ResponseResult<string>>({
    url: '/permission/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改权限状态 (PUT /permission/{id}/status)
 */
export function updatePermissionStatus(id: string, status: number) {
  return request<ResponseResult<string>>({
    url: `/permission/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 检查权限编码是否存在 (GET /permission/exists)
 */
export function checkPermissionCodeExists(permissionCode: string, excludeId?: number) {
  return request<ResponseResult<boolean>>({
    url: '/permission/exists',
    method: 'get',
    params: { permissionCode, excludeId }
  })
}
