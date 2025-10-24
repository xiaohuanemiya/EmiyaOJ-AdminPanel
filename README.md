# EmiyaOJ 管理后台

基于 Vue 3.5 + TypeScript + Element Plus 开发的在线判题系统管理后台。

## 技术栈

- **框架**: Vue 3.5 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 框架**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **图标**: Element Plus Icons

## 功能特性

### 核心功能
- ✅ 用户管理：用户列表、新增、编辑、删除、状态管理、角色分配
- ✅ 角色管理：角色列表、新增、编辑、删除、权限分配
- ✅ 权限管理：权限树形列表、新增、编辑、删除
- ✅ 权限控制：基于 RBAC 的细粒度权限控制

### 技术特性
- 🔐 JWT 认证
- 🔑 按钮级权限控制（自定义指令）
- 📱 响应式布局
- 🎨 Element Plus 组件自动导入
- 🚀 Vite 热更新
- 📦 TypeScript 类型安全

## 项目结构

```
EmiyaOJ-AdminPanel/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API 接口
│   │   ├── auth.ts        # 认证接口
│   │   ├── user.ts        # 用户接口
│   │   ├── role.ts        # 角色接口
│   │   └── permission.ts  # 权限接口
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── directives/        # 自定义指令
│   │   ├── permission.ts  # 权限指令
│   │   └── index.ts       # 指令入口
│   ├── layout/            # 布局组件
│   │   └── index.vue      # 主布局
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由入口
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.ts        # 用户状态
│   │   └── app.ts         # 应用状态
│   ├── types/             # TypeScript 类型定义
│   │   └── api.ts         # API 类型
│   ├── utils/             # 工具函数
│   │   └── request.ts     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── login/         # 登录页
│   │   ├── dashboard/     # 仪表盘
│   │   ├── user/          # 用户管理
│   │   ├── role/          # 角色管理
│   │   ├── permission/    # 权限管理
│   │   └── error/         # 错误页面
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
├── index.html             # HTML 模板
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
# 或者使用 pnpm
pnpm install
# 或者使用 yarn
yarn install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 默认账号

- 用户名: `admin`
- 密码: `123456`

## API 配置

在 `.env.development` 和 `.env.production` 文件中配置 API 地址：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8080

# 生产环境
VITE_API_BASE_URL=https://api.emiyaoj.com
```

## 权限控制

### 路由权限

在路由配置中添加 `meta.permission` 字段：

```typescript
{
  path: '/user',
  component: () => import('@/views/user/index.vue'),
  meta: { permission: 'USER.LIST' }
}
```

### 按钮权限

使用 `v-permission` 指令：

```vue
<el-button v-permission="'USER.ADD'">新增用户</el-button>
<el-button v-permission-any="['USER.EDIT', 'USER.DELETE']">操作</el-button>
<el-button v-permission-all="['USER.EDIT', 'USER.DELETE']">全部权限</el-button>
```

### 编程式权限检查

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

if (userStore.hasPermission('USER.ADD')) {
  // 有权限
}
```

## API 文档

详见 `frontend-api-documentation.md` 文件。

## 主要页面

- **/login** - 登录页面
- **/dashboard** - 仪表盘
- **/user** - 用户管理
- **/role** - 角色管理
- **/permission** - 权限管理

## 浏览器支持

现代浏览器和 IE11+

## License

MIT

## 作者

EmiyaOJ Team

## 更新日志

### v1.0.0 (2025-10-22)
- 🎉 初始版本发布
- ✨ 完成用户、角色、权限管理基础功能
- 🔐 实现 RBAC 权限控制体系
- 📱 响应式布局适配
