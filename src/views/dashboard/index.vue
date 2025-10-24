<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,234</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">45</div>
              <div class="stat-label">角色数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon permission-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">156</div>
              <div class="stat-label">权限数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">89</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="welcome-card" style="margin-top: 20px;">
      <template #header>
        <span>欢迎使用 EmiyaOJ 管理后台</span>
      </template>
      <div class="welcome-content">
        <h2>👋 您好，{{ userStore.username }}</h2>
        <p>这是一个基于 Vue 3.5 + TypeScript + Element Plus 开发的在线判题系统管理后台。</p>
        <div class="features">
          <h3>主要功能：</h3>
          <ul>
            <li>✅ 用户管理：管理系统用户，支持增删改查、状态管理、角色分配</li>
            <li>✅ 角色管理：管理用户角色，支持角色权限分配</li>
            <li>✅ 权限管理：管理系统权限，支持菜单、按钮、接口权限配置</li>
            <li>✅ 权限控制：基于 RBAC 的权限控制体系</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.role-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.permission-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.active-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.welcome-card {
  margin-top: 20px;
}

.welcome-content h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
}

.welcome-content p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

.features h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  font-size: 15px;
  color: #606266;
  line-height: 2;
  padding-left: 24px;
  position: relative;
}
</style>
