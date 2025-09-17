# 📱 Expo发布完整指南

## 🎯 概述
本指南将帮助您将"戒断康复助手"应用发布到Expo平台，并最终提交到Google Play Store和Apple App Store。

## ✅ 前置条件
- [x] Expo开发者账户 (zyyx2002)
- [x] EAS CLI已安装
- [x] 项目已配置 (ID: 3e3f827a-4c94-4e60-9f80-6a81da9b71de)

## 🚀 发布流程

### 1. 构建应用

#### Android构建
```bash
# 构建预览版本 (APK)
eas build --platform android --profile preview

# 构建生产版本 (AAB)
eas build --platform android --profile production
```

#### iOS构建
```bash
# 构建预览版本
eas build --platform ios --profile preview

# 构建生产版本
eas build --platform ios --profile production
```

#### 同时构建两个平台
```bash
eas build --platform all --profile production
```

### 2. 监控构建状态

```bash
# 查看构建状态
eas build:list

# 查看特定构建详情
eas build:view [BUILD_ID]
```

### 3. 测试构建

#### Android测试
1. 下载构建的APK文件
2. 在Android设备上安装测试
3. 验证所有功能正常工作

#### iOS测试
1. 通过TestFlight分发
2. 邀请测试用户
3. 收集反馈

### 4. 发布到应用商店

#### Google Play Store
```bash
# 提交到Google Play (需要配置服务账户)
eas submit --platform android
```

#### Apple App Store
```bash
# 提交到App Store (需要配置Apple开发者账户)
eas submit --platform ios
```

## 📋 配置文件说明

### app.json
- `name`: 应用名称 "戒断康复助手"
- `slug`: URL友好的标识符 "recovery-companion"
- `version`: 当前版本 "1.0.0"
- `bundleIdentifier`: iOS包标识符
- `package`: Android包名

### eas.json
- `development`: 开发构建配置
- `preview`: 预览构建配置 (APK)
- `production`: 生产构建配置 (AAB/IPA)

## 🔧 常用命令

```bash
# 登录Expo
eas login

# 查看项目信息
eas project:info

# 查看构建历史
eas build:list

# 查看提交历史
eas submit:list

# 更新应用
eas update

# 查看分析数据
eas analytics
```

## 📱 发布检查清单

### 构建前检查
- [ ] 更新版本号
- [ ] 测试所有功能
- [ ] 检查图标和启动画面
- [ ] 验证权限配置
- [ ] 检查应用描述和元数据

### 发布前检查
- [ ] 在真实设备上测试
- [ ] 检查性能和内存使用
- [ ] 验证网络连接处理
- [ ] 测试离线功能
- [ ] 检查应用大小

### 商店提交前检查
- [ ] 准备应用截图
- [ ] 编写应用描述
- [ ] 设置关键词和分类
- [ ] 配置定价和可用性
- [ ] 准备隐私政策

## 🔐 安全配置

### Android
1. 生成签名密钥
2. 配置Google Play服务账户
3. 设置应用签名

### iOS
1. 配置Apple开发者账户
2. 创建App Store Connect应用
3. 设置证书和配置文件

## 📊 监控和分析

### Expo Analytics
- 用户活跃度
- 崩溃报告
- 性能指标

### 第三方分析
- Google Analytics
- Firebase Analytics
- Sentry错误监控

## 🆘 故障排除

### 常见问题
1. **构建失败**: 检查依赖项和配置
2. **签名错误**: 验证证书配置
3. **上传失败**: 检查网络和权限
4. **审核被拒**: 查看应用商店指南

### 获取帮助
- [Expo文档](https://docs.expo.dev/)
- [EAS构建文档](https://docs.expo.dev/build/introduction/)
- [Expo论坛](https://forums.expo.dev/)
- [Discord社区](https://chat.expo.dev/)

## 📈 版本管理

### 语义化版本
- `1.0.0`: 主要版本
- `1.1.0`: 功能更新
- `1.1.1`: 错误修复

### 发布流程
1. 开发 → 测试 → 预览构建
2. 内部测试 → 外部测试
3. 生产构建 → 商店提交
4. 审核 → 发布

---

**注意**: 首次发布可能需要几天时间进行应用商店审核。请确保应用符合各平台的发布指南。