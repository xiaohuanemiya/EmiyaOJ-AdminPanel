<template>
  <div class="layout-container">
    <!-- 顶部导航 -->
    <div class="layout-header">
      <div class="header-left">
        <el-icon class="toggle-icon" @click="toggleSidebar">
          <Fold v-if="!appStore.sidebarCollapse" />
          <Expand v-else />
        </el-icon>
        <h1 class="header-title">EmiyaOJ 管理后台</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" icon="UserFilled" />
            <span class="username">{{ userStore.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="layout-body">
      <!-- 侧边栏 -->
      <div class="layout-sidebar" :class="{ collapse: appStore.sidebarCollapse }">
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapse"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          <el-menu-item index="/user" v-permission="'USER.LIST'">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/role" v-permission="'ROLE.LIST'">
            <el-icon><UserFilled /></el-icon>
            <template #title>角色管理</template>
          </el-menu-item>
          <el-menu-item index="/permission" v-permission="'PERMISSION.LIST'">
            <el-icon><Lock /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
          <el-menu-item index="/problem" v-permission="'PROBLEM.LIST'">
            <el-icon><Document /></el-icon>
            <template #title>题目管理</template>
          </el-menu-item>
          <el-menu-item index="/language" v-permission="'LANGUAGE.LIST'">
            <el-icon><Setting /></el-icon>
            <template #title>语言管理</template>
          </el-menu-item>
          <el-menu-item index="/blog" v-permission="'BLOG.LIST'">
            <el-icon><EditPen /></el-icon>
            <template #title>博客管理</template>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区 -->
      <div class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录吗？', '提示', {
        type: 'warning'
      })
      await userStore.logout()
    } catch (error) {
      // 用户取消
    }
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.toggle-icon:hover {
  color: #409eff;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  overflow-x: hidden;
}

.layout-sidebar.collapse {
  width: 64px;
}

.layout-content {
  flex: 1;
  background: #f5f7fa;
  overflow: auto;
}

.content-wrapper {
  padding: 20px;
}

.el-menu {
  border-right: none;
}
</style>
