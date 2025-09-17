# 🚀 戒断康复APP部署指南

## 📋 部署前检查清单

### ✅ 环境准备
- [ ] Node.js 18+ 已安装
- [ ] PostgreSQL 数据库已准备
- [ ] Expo CLI 已安装
- [ ] EAS CLI 已安装
- [ ] 环境变量已配置

### ✅ 代码检查
- [ ] 所有依赖已安装
- [ ] 代码无语法错误
- [ ] 测试全部通过
- [ ] 构建成功

## 🗄️ 数据库部署

### 1. 创建数据库
```bash
# 使用 Neon 或其他 PostgreSQL 服务
# 创建数据库实例
# 获取连接字符串
```

### 2. 运行迁移
```bash
cd backend
npm run db:migrate
```

### 3. 种子数据
```bash
npm run db:seed
```

## 🔧 后端部署

### 1. 环境配置
```bash
cd backend
cp env.example .env
# 编辑 .env 文件，配置以下变量：
# DATABASE_URL=your_database_url
# JWT_SECRET=your_jwt_secret
# PORT=3000
# NODE_ENV=production
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建项目
```bash
npm run build
```

### 4. 启动服务
```bash
npm start
```

### 5. 验证部署
```bash
curl http://localhost:3000/api/health
```

## 📱 移动端部署

### 1. 环境配置
```bash
cd mobile
cp env.example .env
# 编辑 .env 文件，配置以下变量：
# EXPO_PUBLIC_API_URL=your_backend_url
# EXPO_PUBLIC_APP_NAME=戒断康复助手
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 EAS
```bash
# 登录 EAS
eas login

# 创建项目
eas project:create

# 更新 app.json 中的 projectId
```

### 4. 构建应用

#### Android 构建
```bash
# 开发版本
eas build --platform android --profile development

# 预览版本
eas build --platform android --profile preview

# 生产版本
eas build --platform android --profile production
```

#### iOS 构建
```bash
# 开发版本
eas build --platform ios --profile development

# 预览版本
eas build --platform ios --profile preview

# 生产版本
eas build --platform ios --profile production
```

### 5. 提交到应用商店

#### Google Play Store
```bash
eas submit --platform android
```

#### Apple App Store
```bash
eas submit --platform ios
```

## 🖥️ 管理后台部署

### 1. 环境配置
```bash
cd admin
# 创建 .env.local 文件
# 配置以下变量：
# NEXT_PUBLIC_API_URL=your_backend_url
# NEXT_PUBLIC_APP_NAME=戒断康复管理后台
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建项目
```bash
npm run build
```

### 4. 部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

## 🔍 部署验证

### 后端验证
- [ ] API 健康检查通过
- [ ] 数据库连接正常
- [ ] 认证功能正常
- [ ] 所有 API 端点响应正常

### 移动端验证
- [ ] 应用启动正常
- [ ] 登录功能正常
- [ ] 数据同步正常
- [ ] 推送通知正常

### 管理后台验证
- [ ] 页面加载正常
- [ ] 数据统计正常
- [ ] 用户管理功能正常
- [ ] 内容审核功能正常

## 📊 监控配置

### 1. 性能监控
- 配置 APM 工具（如 New Relic、DataDog）
- 设置性能指标监控
- 配置告警规则

### 2. 错误监控
- 配置错误追踪（如 Sentry）
- 设置错误告警
- 配置日志收集

### 3. 健康检查
- 配置健康检查端点
- 设置自动重启机制
- 配置负载均衡

## 🔒 安全配置

### 1. HTTPS 配置
- 配置 SSL 证书
- 强制 HTTPS 重定向
- 配置 HSTS 头

### 2. 防火墙配置
- 配置安全组规则
- 限制端口访问
- 配置 DDoS 防护

### 3. 数据备份
- 配置数据库备份
- 设置备份策略
- 测试恢复流程

## 📈 性能优化

### 1. 数据库优化
- 配置连接池
- 优化查询索引
- 配置读写分离

### 2. 缓存配置
- 配置 Redis 缓存
- 设置缓存策略
- 配置缓存失效

### 3. CDN 配置
- 配置静态资源 CDN
- 设置缓存策略
- 配置压缩

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库 URL
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. 构建失败
```bash
# 清理缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

#### 3. 应用启动失败
```bash
# 检查端口占用
lsof -i :3000

# 检查环境变量
env | grep -E "(DATABASE_URL|JWT_SECRET)"
```

## 📞 支持联系

### 技术支持
- 邮箱: support@recoveryapp.com
- 电话: +86-400-123-4567
- 在线客服: 24/7 在线支持

### 紧急联系
- 紧急故障: emergency@recoveryapp.com
- 值班电话: +86-138-0013-8000

---

**部署完成后，请确保所有功能正常运行，并进行全面的功能测试！** 🎉
