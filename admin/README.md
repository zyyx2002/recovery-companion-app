# 戒断康复APP管理后台

这是戒断康复APP的管理后台系统，基于Next.js 14构建，提供用户管理、内容审核、数据统计等功能。

## 功能特性

- 📊 **数据仪表板** - 实时统计用户数据、活跃度、戒断进度等
- 👥 **用户管理** - 用户列表、详情查看、状态管理
- 📝 **内容审核** - 社区帖子审核、评论管理
- 📈 **数据报告** - 生成各种统计报告和图表
- 🔔 **通知管理** - 推送通知设置和发送
- ⚙️ **系统设置** - 应用配置、功能开关等

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件**: Tailwind CSS + Headless UI
- **图表库**: Recharts
- **状态管理**: React Hooks
- **表单处理**: React Hook Form + Zod
- **HTTP客户端**: Axios
- **通知**: React Hot Toast

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件：

```env
API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看管理后台。

## 项目结构

```
admin/
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 首页仪表板
│   │   ├── globals.css     # 全局样式
│   │   └── users/          # 用户管理页面
│   ├── components/         # 可复用组件
│   │   ├── ui/            # 基础UI组件
│   │   └── charts/        # 图表组件
│   ├── lib/               # 工具函数
│   │   ├── api.ts         # API客户端
│   │   └── utils.ts       # 通用工具
│   └── types/             # TypeScript类型定义
├── public/                # 静态资源
├── tailwind.config.js     # Tailwind配置
├── next.config.js         # Next.js配置
└── tsconfig.json          # TypeScript配置
```

## 主要页面

### 仪表板 (`/`)
- 用户统计概览
- 活跃度指标
- 最近活动
- 快速操作入口

### 用户管理 (`/users`)
- 用户列表和搜索
- 用户详情查看
- 用户状态管理
- 数据导出功能

### 内容管理 (`/content`)
- 社区帖子审核
- 评论管理
- 举报处理
- 内容统计

### 数据报告 (`/reports`)
- 用户增长报告
- 戒断成功率分析
- 功能使用统计
- 自定义报告生成

## API集成

管理后台通过REST API与后端服务通信：

- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `GET /api/community/posts` - 获取帖子列表
- `PUT /api/community/posts/:id` - 审核帖子
- `GET /api/stats` - 获取统计数据

## 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

## 开发指南

### 添加新页面

1. 在 `src/app/` 下创建新的路由文件夹
2. 添加 `page.tsx` 文件
3. 在 `layout.tsx` 中添加导航链接

### 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 使用TypeScript定义props类型
3. 添加必要的样式和功能

### API调用

使用 `src/lib/api.ts` 中的API客户端：

```typescript
import { api } from '@/lib/api';

const users = await api.get('/users');
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
