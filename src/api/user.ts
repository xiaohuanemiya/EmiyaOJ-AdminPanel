import request from '@/utils/request'
import type { 
  ResponseResult, 
  PageVO, 
  UserVO, 
  UserSaveDTO,
  UserPageDTO
} from '@/types/api'

/**
 * 分页查询用户列表 (POST /user/page)
 */
export function getUserPage(data: UserPageDTO) {
  return request<ResponseResult<PageVO<UserVO>>>({
    url: '/user/page',
    method: 'post',
    data
  })
}

/**
 * 根据ID查询用户详情 (GET /user/{id})
 */
export function getUserById(id: string) {
  return request<ResponseResult<UserVO>>({
    url: `/user/${id}`,
    method: 'get'
  })
}

/**
 * 新增用户 (POST /user)
 */
export function addUser(data: UserSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 修改用户 (PUT /user)
 */
export function updateUser(data: UserSaveDTO) {
  return request<ResponseResult<string>>({
    url: '/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户 (DELETE /user/{id})
 */
export function deleteUser(id: string) {
  return request<ResponseResult<string>>({
    url: `/user/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户 (DELETE /user/batch)
 */
export function batchDeleteUsers(ids: string[]) {
  return request<ResponseResult<string>>({
    url: '/user/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 重置用户密码 (PUT /user/{id}/reset-password)
 */
export function resetPassword(id: string) {
  return request<ResponseResult<string>>({
    url: `/user/${id}/reset-password`,
    method: 'put'
  })
}

/**
 * 修改用户状态 (PUT /user/{id}/status)
 */
export function updateUserStatus(id: string, status: number) {
  return request<ResponseResult<string>>({
    url: `/user/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 为用户分配角色 (PUT /user/{id}/roles)
 */
export function assignRoles(id: string, roleIds: string[]) {
  return request<ResponseResult<string>>({
    url: `/user/${id}/roles`,
    method: 'put',
    data: roleIds
  })
}
