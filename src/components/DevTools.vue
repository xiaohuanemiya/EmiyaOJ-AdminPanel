<template>
  <div v-if="isDevMode" class="dev-tools">
    <el-button 
      circle 
      type="primary" 
      @click="drawerVisible = true"
      class="dev-tools-trigger"
      title="打开调试工具"
    >
      <el-icon><View /></el-icon>
    </el-button>
    
    <el-drawer
      v-model="drawerVisible"
      title="🔧 开发者工具 - Pinia 状态查看器"
      size="50%"
      direction="rtl"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 用户状态 -->
        <el-tab-pane label="👤 用户状态" name="user">
          <div class="state-viewer">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="登录状态">
                <el-tag :type="userStore.isLoggedIn ? 'success' : 'danger'">
                  {{ userStore.isLoggedIn ? '已登录' : '未登录' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Token状态">
                <el-tag :type="getTokenStatus().type">
                  {{ getTokenStatus().text }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {{ userStore.userId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ userStore.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="Token">
                <el-input 
                  :model-value="userStore.token" 
                  type="textarea" 
                  :rows="2" 
                  readonly
                  style="font-size: 12px;"
                />
              </el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">JWT 解析信息</el-divider>
            <el-card shadow="never">
              <template v-if="jwtInfo">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="用户名">
                    {{ jwtInfo.username }}
                  </el-descriptions-item>
                  <el-descriptions-item label="账户状态">
                    <el-space>
                      <el-tag :type="jwtInfo.enabled ? 'success' : 'danger'">
                        {{ jwtInfo.enabled ? '启用' : '禁用' }}
                      </el-tag>
                      <el-tag :type="jwtInfo.accountNonExpired ? 'success' : 'danger'">
                        {{ jwtInfo.accountNonExpired ? '未过期' : '已过期' }}
                      </el-tag>
                      <el-tag :type="jwtInfo.accountNonLocked ? 'success' : 'danger'">
                        {{ jwtInfo.accountNonLocked ? '未锁定' : '已锁定' }}
                      </el-tag>
                    </el-space>
                  </el-descriptions-item>
                  <el-descriptions-item label="JWT权限">
                    <el-space wrap>
                      <el-tag 
                        v-for="perm in jwtInfo.permissions" 
                        :key="perm"
                        type="primary"
                        size="small"
                      >
                        {{ perm }}
                      </el-tag>
                    </el-space>
                  </el-descriptions-item>
                </el-descriptions>
                <el-divider>用户详细信息</el-divider>
                <pre class="json-viewer">{{ JSON.stringify(jwtInfo.user, null, 2) }}</pre>
              </template>
              <el-empty v-else description="无法解析JWT" />
            </el-card>

            <el-divider content-position="left">用户信息</el-divider>
            <el-card shadow="never">
              <pre class="json-viewer">{{ JSON.stringify(userStore.userInfo, null, 2) }}</pre>
            </el-card>

            <el-divider content-position="left">
              按钮权限列表 ({{ userStore.permissions.length }})
            </el-divider>
            <el-card shadow="never">
              <el-space wrap>
                <el-tag 
                  v-for="perm in userStore.permissions" 
                  :key="perm"
                  type="success"
                  effect="plain"
                >
                  {{ perm }}
                </el-tag>
              </el-space>
              <el-empty v-if="userStore.permissions.length === 0" description="暂无权限" />
            </el-card>

            <el-divider content-position="left">菜单权限树</el-divider>
            <el-card shadow="never">
              <el-tree 
                :data="userStore.menuTree" 
                :props="{ label: 'permissionName', children: 'children' }"
                default-expand-all
              >
                <template #default="{ node, data }">
                  <span>
                    <el-tag size="small" :type="getPermissionTypeTag(data.permissionType)">
                      {{ getPermissionTypeText(data.permissionType) }}
                    </el-tag>
                    <span style="margin-left: 8px;">{{ node.label }}</span>
                    <el-tag size="small" type="info" style="margin-left: 8px;">
                      {{ data.permissionCode }}
                    </el-tag>
                  </span>
                </template>
              </el-tree>
              <el-empty v-if="userStore.menuTree.length === 0" description="暂无菜单权限" />
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 应用状态 -->
        <el-tab-pane label="⚙️ 应用状态" name="app">
          <div class="state-viewer">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="侧边栏状态">
                <el-tag :type="appStore.sidebarCollapse ? 'warning' : 'success'">
                  {{ appStore.sidebarCollapse ? '已折叠' : '展开' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="主题">
                <el-tag>{{ appStore.theme }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">完整状态</el-divider>
            <el-card shadow="never">
              <pre class="json-viewer">{{ JSON.stringify(appStore.$state, null, 2) }}</pre>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- LocalStorage -->
        <el-tab-pane label="💾 LocalStorage" name="storage">
          <div class="state-viewer">
            <el-card shadow="never">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="token">
                  <el-input 
                    :model-value="getLocalStorageToken()" 
                    type="textarea"
                    :rows="2"
                    readonly
                    style="font-size: 12px;"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="userInfo">
                  <pre class="json-viewer">{{ getStorageItem('userInfo') }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="permissions">
                  <pre class="json-viewer">{{ getStorageItem('permissions') }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="menuTree">
                  <pre class="json-viewer">{{ getStorageItem('menuTree') }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-divider />
            <el-space>
              <el-button type="danger" @click="clearStorage">清空 LocalStorage</el-button>
              <el-button @click="refreshFromStorage">从 Storage 刷新状态</el-button>
            </el-space>
          </div>
        </el-tab-pane>

        <!-- 权限测试 -->
        <el-tab-pane label="🔐 权限测试" name="permission">
          <div class="state-viewer">
            <el-form label-width="120px">
              <el-form-item label="权限编码">
                <el-input 
                  v-model="testPermission" 
                  placeholder="输入权限编码，如：USER.ADD"
                  clearable
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="checkPermission">
                  检查权限
                </el-button>
              </el-form-item>
              <el-form-item label="检查结果" v-if="permissionCheckResult !== null">
                <el-tag :type="permissionCheckResult ? 'success' : 'danger'" size="large">
                  {{ permissionCheckResult ? '✅ 有权限' : '❌ 无权限' }}
                </el-tag>
              </el-form-item>
            </el-form>

            <el-divider content-position="left">常用权限快捷测试</el-divider>
            <el-space wrap>
              <el-button 
                v-for="perm in commonPermissions" 
                :key="perm"
                size="small"
                @click="quickCheckPermission(perm)"
              >
                {{ perm }}
                <el-icon v-if="userStore.hasPermission(perm)" color="green">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else color="red">
                  <CircleClose />
                </el-icon>
              </el-button>
            </el-space>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseJwtToken, isTokenExpired } from '@/utils/jwt'

const userStore = useUserStore()
const appStore = useAppStore()

const drawerVisible = ref(false)
const activeTab = ref('user')
const testPermission = ref('')
const permissionCheckResult = ref<boolean | null>(null)

const isDevMode = computed(() => import.meta.env.DEV)

const commonPermissions = [
  'USER.LIST',
  'USER.ADD',
  'USER.EDIT',
  'USER.DELETE',
  'ROLE.LIST',
  'ROLE.ADD',
  'ROLE.EDIT',
  'ROLE.DELETE',
  'PERMISSION.LIST',
  'PERMISSION.ADD',
  'PERMISSION.EDIT',
  'PERMISSION.DELETE'
]

const getPermissionTypeText = (type: number) => {
  const map: Record<number, string> = {
    1: '菜单',
    2: '按钮',
    3: '接口'
  }
  return map[type] || '未知'
}

const getPermissionTypeTag = (type: number): 'success' | 'warning' | 'info' => {
  const map: Record<number, 'success' | 'warning' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return map[type] || 'info'
}

const getStorageItem = (key: string) => {
  const value = localStorage.getItem(key)
  if (!value || value === 'null' || value === 'undefined') return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const getLocalStorageToken = () => {
  return localStorage.getItem('token') || '-'
}

const clearStorage = async () => {
  try {
    await ElMessageBox.confirm('确认清空所有 LocalStorage 数据吗？这将退出登录。', '警告', {
      type: 'warning'
    })
    localStorage.clear()
    ElMessage.success('LocalStorage 已清空')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch {
    // 用户取消
  }
}

const refreshFromStorage = () => {
  userStore.restoreUserInfo()
  ElMessage.success('已从 LocalStorage 刷新状态')
}

const checkPermission = () => {
  if (!testPermission.value) {
    ElMessage.warning('请输入权限编码')
    return
  }
  permissionCheckResult.value = userStore.hasPermission(testPermission.value)
}

const quickCheckPermission = (permission: string) => {
  testPermission.value = permission
  checkPermission()
}

// JWT 相关
const jwtInfo = computed(() => {
  if (!userStore.token) return null
  try {
    return parseJwtToken(userStore.token)
  } catch (error) {
    console.error('解析JWT失败:', error)
    return null
  }
})

const getTokenStatus = () => {
  if (!userStore.token) {
    return { type: 'info' as const, text: '无Token' }
  }
  try {
    const expired = isTokenExpired(userStore.token)
    return expired 
      ? { type: 'danger' as const, text: 'Token已过期' }
      : { type: 'success' as const, text: 'Token有效' }
  } catch (error) {
    return { type: 'warning' as const, text: '无法验证' }
  }
}
</script>

<style scoped>
.dev-tools {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

.dev-tools-trigger {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.state-viewer {
  padding: 0;
}

.json-viewer {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow: auto;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 600;
}

:deep(.el-card__body) {
  padding: 12px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
