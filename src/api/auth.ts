import request from '@/utils/request'
import type { ResponseResult, UserLoginDTO, UserLoginVO } from '@/types/api'

/**
 * 用户登录 (POST /auth/login)
 */
export function login(data: UserLoginDTO) {
  return request<ResponseResult<UserLoginVO>>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录 (POST /auth/logout)
 */
export function logout() {
  return request<ResponseResult<string>>({
    url: '/auth/logout',
    method: 'post'
  })
}
