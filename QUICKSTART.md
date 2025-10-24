# 快速开始指南

## 1. 安装依赖

首先，确保你已经安装了 Node.js (建议 16.x 或更高版本)。

在项目根目录下运行：

```bash
npm install
```

如果使用 pnpm（推荐，更快）：

```bash
pnpm install
```

或者使用 yarn：

```bash
yarn install
```

## 2. 启动开发服务器

安装完成后，运行：

```bash
npm run dev
```

或：

```bash
pnpm dev
# 或
yarn dev
```

## 3. 访问应用

打开浏览器访问：http://localhost:3000

## 4. 登录系统

使用默认账号登录：
- 用户名：`admin`
- 密码：`123456`

## 5. 配置后端 API

### 开发环境

编辑 `.env.development` 文件，修改 API 地址：

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 生产环境

编辑 `.env.production` 文件，修改 API 地址：

```env
VITE_API_BASE_URL=https://api.emiyaoj.com
```

## 6. 项目构建

构建生产版本：

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 7. 预览生产构建

```bash
npm run preview
```

## 常见问题

### 依赖安装失败

如果遇到依赖安装问题，可以尝试：

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 端口占用

如果 3000 端口被占用，可以修改 `vite.config.ts` 中的端口配置：

```typescript
server: {
  port: 3001, // 改为其他端口
  // ...
}
```

### API 请求跨域

开发环境已配置代理，如果仍有跨域问题，请检查：

1. `.env.development` 中的 API 地址是否正确
2. 后端服务是否已启动
3. `vite.config.ts` 中的代理配置是否正确

## 开发建议

1. **使用 TypeScript**：项目已配置 TypeScript，充分利用类型检查
2. **遵循代码规范**：使用 ESLint 和 Prettier（如果配置了）
3. **组件化开发**：将可复用的 UI 放到 `src/components` 目录
4. **API 统一管理**：所有 API 调用都应通过 `src/api` 目录中的文件
5. **权限控制**：使用 `v-permission` 指令控制按钮显示

## 项目结构说明

```
src/
├── api/           # API 接口定义
├── assets/        # 静态资源（图片、样式等）
├── components/    # 公共组件
├── directives/    # 自定义指令
├── layout/        # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── views/         # 页面组件
├── App.vue        # 根组件
└── main.ts        # 应用入口
```

## 技术栈

- Vue 3.5（Composition API）
- TypeScript
- Vite
- Element Plus
- Vue Router 4
- Pinia
- Axios

## 下一步

现在你可以：

1. 查看 `src/views` 目录下的页面组件
2. 了解 `src/api` 目录下的 API 接口
3. 阅读 `frontend-api-documentation.md` 了解完整 API 文档
4. 根据需求添加新的功能模块

祝开发愉快！🎉
