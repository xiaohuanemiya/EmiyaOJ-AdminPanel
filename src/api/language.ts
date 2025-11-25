import request from '@/utils/request'
import type { 
  ResponseResult, 
  LanguageVO 
} from '@/types/api'

/**
 * 获取所有可用语言列表
 */
export function getLanguageList() {
  return request<ResponseResult<LanguageVO[]>>({
    url: '/language/list',
    method: 'get'
  })
}

/**
 * 根据ID获取语言详情
 */
export function getLanguageById(id: number) {
  return request<ResponseResult<LanguageVO>>({
    url: `/language/${id}`,
    method: 'get'
  })
}
