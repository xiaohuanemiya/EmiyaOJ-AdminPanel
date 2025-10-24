import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { isTokenExpired } from './jwt'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      // 检查token是否过期
      if (isTokenExpired(token)) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
        localStorage.removeItem('menuTree')
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return Promise.reject(new Error('Token已过期'))
      }
      
      if (config.headers) {
        config.headers.Authorization = token
      }
    }
    return config
  },
  (error: any) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果状态码不是 200，判断为错误
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 401: 未授权，跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    
    return res
  },
  (error: any) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.msg || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service
