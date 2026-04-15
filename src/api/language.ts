import request from '@/utils/request'
import type { 
  ResponseResult, 
  LanguageVO 
} from '@/types/api'

/**
 * 根据ID获取语言详情 (GET /language/{id})
 */
export function getLanguageById(id: number) {
  return request<ResponseResult<LanguageVO>>({
    url: `/language/${id}`,
    method: 'get'
  })
}
