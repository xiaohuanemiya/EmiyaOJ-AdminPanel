import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { UserLoginDTO, UserLoginVO, PermissionVO } from '@/types/api'
import { parseJwtToken, isTokenExpired } from '@/utils/jwt'
import router from '@/router'

interface UserState {
  userInfo: UserLoginVO | null
  token: string
  permissions: string[]
  menuTree: PermissionVO[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    permissions: [],
    menuTree: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '',
    userId: (state) => state.userInfo?.id || 0
  },

  actions: {
    // 登录
    async login(loginForm: UserLoginDTO) {
      try {
        const res = await loginApi(loginForm)
        const loginData = res.data as unknown as UserLoginVO
        const { token } = loginData
        
        this.token = token
        this.userInfo = loginData
        
        // 保存到 localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(loginData))
        
        // 从 JWT 解析权限信息和用户信息
        const jwtData = parseJwtToken(token)
        if (jwtData) {
          // 直接从JWT载荷获取权限列表
          this.permissions = jwtData.permissions || []
          localStorage.setItem('permissions', JSON.stringify(this.permissions))
          
          // 用JWT中的用户信息补充/覆盖userInfo
          this.userInfo = {
            ...loginData,
            id: String(jwtData.userId),
            username: jwtData.username
          }
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          
          console.log('从JWT解析的权限:', this.permissions)
          console.log('用户信息:', { userId: jwtData.userId, username: jwtData.username })
        }
        // 弃用
        // 获取菜单权限树（如果后端提供
        // await this.fetchMenuTree()
        
        return res
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.clearUserInfo()
        router.push('/login')
      }
    },

    // 检查是否有权限
    hasPermission(permission: string): boolean {
      return this.permissions.includes(permission)
    },

    // 清除用户信息
    clearUserInfo() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      this.menuTree = []
      
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')
      localStorage.removeItem('menuTree')
    },

    // 从 localStorage 恢复用户信息
    restoreUserInfo() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      const permissions = localStorage.getItem('permissions')
      const menuTree = localStorage.getItem('menuTree')

      if (token) {
        // 检查token是否过期
        if (isTokenExpired(token)) {
          console.warn('Token已过期，清除用户信息')
          this.clearUserInfo()
          return
        }
        
        this.token = token
        
        // 如果没有缓存的权限信息，尝试从JWT解析
        if (!permissions) {
          const jwtData = parseJwtToken(token)
          if (jwtData) {
            this.permissions = jwtData.permissions || []
            localStorage.setItem('permissions', JSON.stringify(this.permissions))
            
            // 同时恢复用户信息
            if (!userInfo) {
              this.userInfo = {
                id: String(jwtData.userId),
                username: jwtData.username,
                nickname: jwtData.username,
                token: token
              }
              localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
            }
          }
        }
      }
      
      if (userInfo) this.userInfo = JSON.parse(userInfo)
      if (permissions) this.permissions = JSON.parse(permissions)
      if (menuTree) this.menuTree = JSON.parse(menuTree)
    }
  }
})
