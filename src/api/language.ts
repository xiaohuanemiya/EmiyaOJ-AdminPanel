import request from '@/utils/request'
import type { 
  ResponseResult, 
  LanguageVO,
  LanguageSaveDTO
} from '@/types/api'

/**
 * 查询启用的编程语言列表（前台） (GET /language/list)
 */
export function getLanguageList() {
  return request<ResponseResult<LanguageVO[]>>({
    url: '/language/list',
    method: 'get'
  })
}

/**
 * 管理端查询全部编程语言（含禁用） (GET /language/admin/list)
 */
export function getLanguageAdminList() {
  return request<ResponseResult<LanguageVO[]>>({
    url: '/language/admin/list',
    method: 'get'
  })
}

/**
 * 根据ID查询语言详情（供Feign调用，仅启用） (GET /language/{id})
 */
export function getLanguageById(id: number) {
  return request<ResponseResult<LanguageVO>>({
    url: `/language/${id}`,
    method: 'get'
  })
}

/**
 * 管理端根据ID查询语言详情（不过滤状态） (GET /language/admin/{id})
 */
export function getLanguageAdminById(id: number) {
  return request<ResponseResult<LanguageVO>>({
    url: `/language/admin/${id}`,
    method: 'get'
  })
}

/**
 * 新增编程语言 (POST /language)
 */
export function addLanguage(data: LanguageSaveDTO) {
  return request<ResponseResult<LanguageVO>>({
    url: '/language',
    method: 'post',
    data
  })
}

/**
 * 更新编程语言信息 (PUT /language)
 */
export function updateLanguage(data: LanguageSaveDTO) {
  return request<ResponseResult<boolean>>({
    url: '/language',
    method: 'put',
    data
  })
}

/**
 * 启用编程语言 (PUT /language/{id}/enable)
 */
export function enableLanguage(id: number) {
  return request<ResponseResult<boolean>>({
    url: `/language/${id}/enable`,
    method: 'put'
  })
}

/**
 * 禁用编程语言 (PUT /language/{id}/disable)
 */
export function disableLanguage(id: number) {
  return request<ResponseResult<boolean>>({
    url: `/language/${id}/disable`,
    method: 'put'
  })
}

/**
 * 删除编程语言（物理删除，谨慎操作） (DELETE /language/{id})
 */
export function deleteLanguage(id: number) {
  return request<ResponseResult<boolean>>({
    url: `/language/${id}`,
    method: 'delete'
  })
}
