import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'HomeFilled' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'USER.LIST' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', permission: 'ROLE.LIST' }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/permission/index.vue'),
        meta: { title: '权限管理', icon: 'Lock', permission: 'PERMISSION.LIST' }
      },
      {
        path: 'problem',
        name: 'Problem',
        component: () => import('@/views/problem/index.vue'),
        meta: { title: '题目管理', icon: 'Document', permission: 'PROBLEM.LIST' }
      },
      {
        path: 'language',
        name: 'Language',
        component: () => import('@/views/language/index.vue'),
        meta: { title: '语言管理', icon: 'Setting', permission: 'LANGUAGE.LIST' }
      },
      {
        path: 'testcase',
        name: 'TestCase',
        component: () => import('@/views/testcase/index.vue'),
        meta: { title: '测试用例管理', icon: 'List', permission: 'TESTCASE.LIST' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || 'EmiyaOJ'} - 管理后台`
  
  // 如果是登录页，直接放行
  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
    return
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!userStore.isLoggedIn) {
      next('/login')
      return
    }
    
    // 如果有权限要求，检查权限
    if (to.meta.permission) {
      if (!userStore.hasPermission(to.meta.permission as string)) {
        // 无权限
        next('/403')
        return
      }
    }
  }
  
  next()
})

export default router
