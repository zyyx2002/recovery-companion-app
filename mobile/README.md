# 戒断康复助手

一款帮助用户戒除不良习惯、建立健康生活方式的移动应用。

## 📱 应用特性

### 🎯 核心功能
- **戒断追踪** - 记录戒断天数，可视化进度
- **任务系统** - 每日任务和挑战，获得积分奖励
- **AI陪伴** - 智能助手提供个性化支持和鼓励
- **社区互动** - 匿名分享经验，获得同伴支持
- **成就系统** - 解锁里程碑，庆祝每一个进步

### 🔧 技术特性
- **跨平台** - 基于React Native，支持iOS和Android
- **实时同步** - 云端数据同步，多设备无缝体验
- **离线支持** - 关键功能离线可用
- **推送通知** - 智能提醒和激励消息
- **数据安全** - 端到端加密，保护用户隐私

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS Simulator (macOS) 或 Android Studio

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

### 运行在设备上
```bash
# iOS
npm run ios

# Android
npm run android
```

## 📦 构建和发布

### 开发构建
```bash
# 构建开发版本
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 预览构建
```bash
# 构建预览版本
eas build --profile preview --platform all
```

### 生产构建
```bash
# 构建生产版本
eas build --profile production --platform all
```

### 提交到应用商店
```bash
# 提交到App Store
eas submit --platform ios

# 提交到Google Play
eas submit --platform android
```

## 🏗️ 项目结构

```
mobile/
├── src/
│   ├── app/                 # Expo Router页面
│   │   ├── (tabs)/         # 底部导航页面
│   │   ├── auth.tsx        # 认证页面
│   │   └── ai-chat.tsx     # AI聊天页面
│   ├── components/         # 可复用组件
│   │   ├── auth/          # 认证相关组件
│   │   ├── ai/            # AI相关组件
│   │   └── ErrorBoundary.tsx
│   ├── services/          # API服务
│   │   ├── api.ts         # 基础API客户端
│   │   ├── aiApi.ts       # AI API
│   │   └── notificationApi.ts
│   ├── stores/            # 状态管理
│   │   └── authStore.ts   # 认证状态
│   ├── hooks/             # 自定义Hooks
│   │   └── useNotifications.ts
│   └── utils/             # 工具函数
│       └── performance.ts
├── assets/                # 静态资源
├── app.json              # Expo配置
├── eas.json              # EAS构建配置
└── package.json          # 依赖配置
```

## 🔧 配置

### 环境变量
创建 `.env` 文件：
```env
API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_URL=https://your-api.com/api
```

### 推送通知
1. 在Expo Dashboard中配置推送证书
2. 更新 `app.json` 中的推送配置
3. 测试推送功能

### 应用图标和启动屏
- 替换 `assets/icon.png` (1024x1024)
- 替换 `assets/splash.png` (1242x2436)
- 替换 `assets/adaptive-icon.png` (1024x1024)

## 🧪 测试

### 单元测试
```bash
npm test
```

### 端到端测试
```bash
npm run e2e
```

### 性能测试
```bash
npm run performance
```

## 📊 性能优化

### 已实现的优化
- 图片懒加载和压缩
- 代码分割和懒加载
- 内存泄漏检测
- 网络请求缓存
- 错误边界处理

### 监控指标
- 应用启动时间
- 页面渲染性能
- 网络请求延迟
- 内存使用情况
- 崩溃率统计

## 🔒 安全措施

### 数据保护
- 敏感数据加密存储
- API请求HTTPS加密
- 用户认证JWT令牌
- 输入数据验证和清理

### 隐私保护
- 最小化数据收集
- 用户数据匿名化
- 透明的隐私政策
- 用户数据导出和删除

## 🚀 部署流程

### 1. 开发阶段
- 功能开发和测试
- 代码审查
- 单元测试通过

### 2. 测试阶段
- 内部测试构建
- 功能测试
- 性能测试
- 安全测试

### 3. 发布阶段
- 生产构建
- 应用商店审核
- 灰度发布
- 全量发布

## 📈 版本管理

### 版本号规则
- 主版本号：重大功能更新
- 次版本号：新功能添加
- 修订号：Bug修复和小改进

### 发布日志
每次发布都会生成详细的发布日志，包括：
- 新功能
- 改进
- Bug修复
- 已知问题

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request
5. 代码审查
6. 合并代码

### 代码规范
- 使用TypeScript
- 遵循ESLint规则
- 编写单元测试
- 添加必要的注释

## 📞 支持

### 技术支持
- 邮箱：support@recovery-app.com
- 文档：https://docs.recovery-app.com
- 社区：https://community.recovery-app.com

### 反馈渠道
- 应用内反馈
- GitHub Issues
- 用户社区
- 客服热线

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**戒断康复助手** - 让改变成为可能 💪
