import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageDTO, 
  PageVO, 
  UserVO, 
  UserSaveDTO 
} from '@/types/api'

/**
 * 分页查询用户列表
 */
export function getUserPage(data: PageDTO) {
  return request<ResponseResult<PageVO<UserVO>>>({
    url: '/user/page',
    method: 'post',
    data
  })
}

/**
 * 根据ID查询用户
 */
export function getUserById(id: number) {
  return request<ResponseResult<UserVO>>({
    url: `/user/${id}`,
    method: 'get'
  })
}

/**
 * 新增用户
 */
export function addUser(data: UserSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 修改用户
 */
export function updateUser(data: UserSaveDTO) {
  return request<ResponseResult<void>>({
    url: '/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return request<ResponseResult<void>>({
    url: `/user/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 */
export function batchDeleteUsers(ids: string[]) {
  return request<ResponseResult<void>>({
    url: '/user/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 重置用户密码
 */
export function resetPassword(id: number, newPassword: string) {
  return request<ResponseResult<void>>({
    url: `/user/${id}/reset-password`,
    method: 'put',
    params: { newPassword }
  })
}

/**
 * 修改用户状态
 */
export function updateUserStatus(id: string, status: number) {
  return request<ResponseResult<void>>({
    url: `/user/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 为用户分配角色
 */
export function assignRoles(id: string, roleIds: number[]) {
  return request<ResponseResult<void>>({
    url: `/user/${id}/roles`,
    method: 'put',
    data: roleIds
  })
}

/**
 * 获取用户权限列表
 */
export function getUserPermissions(id: number) {
  return request<ResponseResult<string[]>>({
    url: `/user/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 检查用户是否拥有指定权限
 */
export function hasPermission(id: number, permissionCode: string) {
  return request<ResponseResult<boolean>>({
    url: `/user/${id}/has-permission`,
    method: 'get',
    params: { permissionCode }
  })
}

/**
 * 检查用户是否拥有指定角色
 */
export function hasRole(id: number, roleCode: string) {
  return request<ResponseResult<boolean>>({
    url: `/user/${id}/has-role`,
    method: 'get',
    params: { roleCode }
  })
}
