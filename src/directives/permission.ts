import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限指令
 * 用法: v-permission="'USER.ADD'"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && !userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 多权限指令（满足其中一个即可）
 * 用法: v-permission-any="['USER.ADD', 'USER.EDIT']"
 */
export const permissionAny: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (Array.isArray(value) && value.length > 0) {
      const hasPermission = value.some(permission => userStore.hasPermission(permission))
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

/**
 * 多权限指令（必须全部满足）
 * 用法: v-permission-all="['USER.ADD', 'USER.EDIT']"
 */
export const permissionAll: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (Array.isArray(value) && value.length > 0) {
      const hasAllPermission = value.every(permission => userStore.hasPermission(permission))
      if (!hasAllPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}
