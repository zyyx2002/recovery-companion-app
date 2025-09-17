# 🚀 戒断康复APP发布指南

## 📱 立即可用的发布方案

### 方案一：使用Expo Go（推荐，5分钟完成）

这是最简单、最快的发布方式：

#### 1. 启动开发服务器
```bash
cd mobile
npm start
```

#### 2. 获取发布链接
- 在终端中按 `s` 键
- 选择 "Publish to Expo Go"
- 获得一个可分享的链接，如：`exp://192.168.1.100:8081`

#### 3. 分享给用户
- 用户下载 Expo Go 应用
- 扫描二维码或输入链接
- 立即可以使用您的APP

### 方案二：Web版本发布（10分钟完成）

#### 1. 构建Web版本
```bash
cd mobile
npm run web
```

#### 2. 部署到Vercel
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 方案三：APK直接发布（30分钟完成）

#### 1. 使用Expo Build Service
```bash
# 升级EAS CLI
npm install -g @expo/eas-cli@latest

# 登录
eas login

# 构建APK
eas build --platform android --profile preview
```

#### 2. 下载APK
- 构建完成后下载APK文件
- 直接分发给用户安装

### 方案四：应用商店发布（需要开发者账户）

#### 1. 准备开发者账户
- Google Play Console账户（$25一次性费用）
- Apple Developer账户（$99/年）

#### 2. 构建生产版本
```bash
eas build --platform all --profile production
```

#### 3. 提交到应用商店
```bash
eas submit --platform all
```

## 🎯 推荐发布流程

### 立即发布（今天就能用）
1. **使用方案一** - 通过Expo Go分享
2. **收集用户反馈**
3. **迭代改进**

### 正式发布（1-2周内）
1. **使用方案三** - 构建APK
2. **申请开发者账户**
3. **提交到应用商店**

## 📊 各方案对比

| 方案 | 时间 | 成本 | 用户获取 | 推荐度 |
|------|------|------|----------|--------|
| Expo Go | 5分钟 | 免费 | 需要安装Expo Go | ⭐⭐⭐⭐⭐ |
| Web版本 | 10分钟 | 免费 | 浏览器直接访问 | ⭐⭐⭐⭐ |
| APK发布 | 30分钟 | 免费 | 直接安装 | ⭐⭐⭐⭐ |
| 应用商店 | 1-2周 | $25-99 | 官方渠道 | ⭐⭐⭐ |

## 🚀 立即开始

选择最适合您的方案，现在就可以发布您的戒断康复APP！

**建议：先用方案一快速发布，收集用户反馈，再考虑正式的应用商店发布。**
