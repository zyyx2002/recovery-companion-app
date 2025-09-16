# 🏠 戒断康复APP本地发布指南

## 📋 概述

本指南提供完全离线的APP发布方案，无需网络连接即可构建和分发您的戒断康复APP。

## 🛠️ 环境准备

### 必需软件
1. **Node.js 18+** - [下载地址](https://nodejs.org)
2. **Java JDK 11+** - [下载地址](https://adoptium.net)
3. **Android Studio** - [下载地址](https://developer.android.com/studio)

### 环境变量配置
```bash
# 设置JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-11.0.16

# 设置ANDROID_HOME
set ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk

# 添加到PATH
set PATH=%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

## 🚀 快速开始

### 方法一：一键构建 (推荐)
```bash
# 双击运行
build-local.bat
```

### 方法二：APK专用构建
```bash
# 双击运行
apk-builder.bat
```

### 方法三：离线打包分发
```bash
# 双击运行
offline-package.bat
```

## 📱 发布方式

### 1. Web版本发布
- **优点**: 无需安装，浏览器直接访问
- **适用**: 快速测试和演示
- **步骤**: 选择"Web版本" → 分享链接

### 2. APK文件发布
- **优点**: 原生应用体验，功能完整
- **适用**: 正式发布和分发
- **步骤**: 选择"APK文件" → 等待构建 → 分发APK

### 3. 开发版本发布
- **优点**: 实时更新，开发调试
- **适用**: 内部测试和开发
- **步骤**: 选择"开发版本" → 扫描二维码

## 🔧 构建选项详解

### Web版本构建
```bash
npm install
npm run web
```
- 生成静态Web应用
- 可在任何浏览器中运行
- 支持PWA功能

### APK构建
```bash
npm install
npx expo run:android --variant release
```
- 生成Android安装包
- 原生应用性能
- 支持所有Android功能

### 开发版本
```bash
npm install
npm start
```
- 启动开发服务器
- 支持热重载
- 需要Expo Go应用

## 📦 离线分发方案

### 创建离线安装包
1. 运行 `offline-package.bat`
2. 自动打包所有必要文件
3. 生成 `recovery-app-offline.zip`
4. 分发给用户

### 用户安装步骤
1. 解压 `recovery-app-offline.zip`
2. 运行 `快速启动.bat`
3. 按照提示选择安装方式
4. 开始使用APP

## 🎯 发布策略

### 内部测试
- 使用开发版本
- 通过Expo Go快速测试
- 实时反馈和调试

### 公测版本
- 使用Web版本
- 分享链接给测试用户
- 收集用户反馈

### 正式发布
- 使用APK版本
- 通过应用商店分发
- 或直接提供APK下载

## 🔍 故障排除

### 常见问题

#### 1. Node.js未安装
```
❌ Node.js 未安装
💡 请访问 https://nodejs.org 下载安装
```

#### 2. Java环境问题
```
❌ Java 未安装
💡 请安装 Java JDK: https://adoptium.net
```

#### 3. Android SDK问题
```
❌ Android SDK 未配置
💡 请安装 Android Studio 并配置SDK
```

#### 4. 构建失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules
npm install

# 重新构建
npm run build
```

### 环境检查
运行 `环境检查.bat` 自动检测环境配置。

## 📊 性能优化

### 构建优化
- 使用 `--production` 模式
- 启用代码压缩和混淆
- 优化图片和资源

### 分发优化
- 压缩APK文件大小
- 使用增量更新
- 提供多种下载方式

## 🎉 发布检查清单

### 发布前检查
- [ ] 环境配置正确
- [ ] 依赖安装完整
- [ ] 构建测试通过
- [ ] 功能测试完成
- [ ] 性能测试通过

### 发布后检查
- [ ] 用户反馈收集
- [ ] 错误监控配置
- [ ] 更新机制准备
- [ ] 技术支持准备

## 📞 技术支持

### 自助解决
1. 查看错误日志
2. 检查环境配置
3. 重新安装依赖
4. 清理项目缓存

### 获取帮助
- 查看项目文档
- 检查GitHub Issues
- 联系技术支持

---

**现在您就可以完全离线地构建和发布您的戒断康复APP了！** 🎉
