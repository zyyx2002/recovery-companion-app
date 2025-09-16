# 🚀 GitHub Actions自动构建设置指南

## 📋 前置条件

### 1. 创建GitHub仓库
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit: 戒断康复APP"

# 创建GitHub仓库并推送
gh repo create recovery-app --public
git remote add origin https://github.com/你的用户名/recovery-app.git
git push -u origin main
```

### 2. 获取Expo Token
```bash
# 登录Expo
npx expo login

# 获取Token
npx expo whoami --json
```

## 🔧 配置GitHub Secrets

在GitHub仓库中设置以下Secrets：

### 必需配置
1. **EXPO_TOKEN** - Expo访问令牌
   - 获取方式：`npx expo whoami --json`
   - 用途：EAS Build认证

### 可选配置
2. **VERCEL_TOKEN** - Vercel部署令牌
   - 获取方式：Vercel Dashboard → Settings → Tokens
   - 用途：自动部署Web版本

3. **VERCEL_ORG_ID** - Vercel组织ID
   - 获取方式：Vercel Dashboard → Settings → General
   - 用途：Vercel部署配置

4. **VERCEL_PROJECT_ID** - Vercel项目ID
   - 获取方式：Vercel Dashboard → Project Settings
   - 用途：Vercel部署配置

5. **SLACK_WEBHOOK** - Slack通知Webhook
   - 获取方式：Slack App → Incoming Webhooks
   - 用途：构建结果通知

## 🎯 使用方法

### 1. 自动构建
- **推送代码**：每次推送到main分支自动构建
- **创建标签**：`git tag v1.0.0 && git push origin v1.0.0`
- **手动触发**：GitHub Actions页面点击"Run workflow"

### 2. 获取构建结果
- **Artifacts**：在Actions页面下载APK文件
- **Releases**：创建标签后自动生成Release
- **Web版本**：自动部署到Vercel

### 3. 构建流程
```
推送代码 → GitHub Actions → EAS Build → 生成APK → 上传到Release
```

## 📱 发布流程

### 1. 开发阶段
```bash
# 本地开发
npm run dev

# 提交代码
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### 2. 测试阶段
```bash
# 创建测试版本
git tag v1.0.0-beta
git push origin v1.0.0-beta

# 下载测试APK
# 在GitHub Actions页面下载Artifacts
```

### 3. 正式发布
```bash
# 创建正式版本
git tag v1.0.0
git push origin v1.0.0

# 自动生成Release和APK
# 下载APK提交到Google Play Store
```

## 🔍 监控和调试

### 1. 查看构建日志
- 访问：`https://github.com/你的用户名/recovery-app/actions`
- 点击具体的构建任务查看详细日志

### 2. 常见问题
- **Token过期**：重新生成EXPO_TOKEN
- **构建失败**：检查代码语法和依赖
- **上传失败**：检查网络连接和权限

### 3. 性能优化
- 使用缓存加速构建
- 并行构建多个平台
- 增量构建减少时间

## 🎉 优势

### ✅ 完全免费
- GitHub Actions：每月2000分钟免费
- EAS Build：每月30次免费构建
- Vercel：免费部署Web版本

### ✅ 自动化
- 代码推送自动构建
- 自动生成Release
- 自动部署Web版本

### ✅ 稳定可靠
- 使用GitHub官方服务器
- 网络环境稳定
- 支持多平台构建

### ✅ 易于维护
- 配置文件版本控制
- 构建历史可追溯
- 支持回滚和重试

## 🚀 立即开始

1. **推送代码到GitHub**
2. **配置Secrets**
3. **触发第一次构建**
4. **下载APK文件**
5. **发布到应用商店**

**现在您就可以完全绕过网络问题，使用GitHub Actions自动构建和发布您的戒断康复APP了！** 🎉
