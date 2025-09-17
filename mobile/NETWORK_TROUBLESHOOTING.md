# 🌐 EAS Build 网络问题解决指南

## 🚨 问题描述
遇到 `ECONNRESET` 错误，无法上传项目到 EAS Build 服务器。

## 🔍 可能原因
1. **网络连接不稳定**
2. **防火墙或代理限制**
3. **DNS解析问题**
4. **企业网络限制**
5. **临时服务器问题**

## 🛠️ 解决方案

### 方案1: 网络诊断和修复

#### 1.1 检查网络连接
```bash
# 测试基本连接
ping expo.dev
ping storage.googleapis.com

# 测试DNS解析
nslookup expo.dev
nslookup storage.googleapis.com
```

#### 1.2 刷新DNS缓存
```bash
# Windows
ipconfig /flushdns

# 重启网络适配器
ipconfig /release
ipconfig /renew
```

#### 1.3 更换DNS服务器
- 主DNS: 8.8.8.8 (Google)
- 备DNS: 1.1.1.1 (Cloudflare)

### 方案2: 代理和VPN配置

#### 2.1 如果使用企业网络
```bash
# 配置npm代理
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port

# 配置EAS代理
export HTTP_PROXY=http://proxy-server:port
export HTTPS_PROXY=http://proxy-server:port
```

#### 2.2 使用VPN
- 尝试连接到不同地区的VPN服务器
- 确保VPN支持Google Cloud Storage访问

### 方案3: 本地构建替代方案

#### 3.1 使用本地Android构建
```bash
# 进入android目录
cd android

# 清理项目
.\gradlew clean

# 构建Release APK
.\gradlew assembleRelease

# 构建Release AAB (Google Play)
.\gradlew bundleRelease
```

#### 3.2 配置签名密钥
1. 生成签名密钥:
```bash
keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

2. 配置gradle.properties:
```properties
MYAPP_RELEASE_STORE_FILE=release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=release
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password
```

### 方案4: 分步上传策略

#### 4.1 减小项目大小
```bash
# 清理node_modules
rm -rf node_modules
npm install --production

# 清理缓存
npx expo install --fix
```

#### 4.2 使用.easignore文件
创建 `.easignore` 文件排除不必要的文件:
```
node_modules/
.git/
.expo/
android/build/
android/.gradle/
*.log
.DS_Store
```

### 方案5: 时间和重试策略

#### 5.1 错峰构建
- 避开网络高峰期（通常是工作时间）
- 尝试在深夜或早晨构建

#### 5.2 自动重试脚本
```bash
#!/bin/bash
for i in {1..5}; do
    echo "尝试第 $i 次构建..."
    eas build --platform android --profile production
    if [ $? -eq 0 ]; then
        echo "构建成功!"
        break
    else
        echo "构建失败，等待 30 秒后重试..."
        sleep 30
    fi
done
```

## 🔧 快速修复命令

### Windows PowerShell
```powershell
# 重置网络
netsh winsock reset
netsh int ip reset

# 刷新DNS
ipconfig /flushdns

# 重启网络服务
Restart-Service -Name "DNS Client"
```

### 临时解决方案
```bash
# 使用不同的网络环境
# 1. 手机热点
# 2. 不同的WiFi网络
# 3. 有线网络

# 或者使用本地构建
cd android
.\gradlew assembleRelease
```

## 📞 获取帮助

### 官方支持
- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [GitHub Issues](https://github.com/expo/expo/issues)

### 社区资源
- Stack Overflow: `expo` + `eas-build` 标签
- Reddit: r/reactnative

## 🎯 推荐操作顺序

1. **立即尝试**: 更换网络环境（手机热点）
2. **短期解决**: 使用本地构建
3. **长期解决**: 配置网络代理或VPN
4. **最终方案**: 联系网络管理员或ISP

---

**注意**: 如果问题持续存在，建议使用本地构建作为临时解决方案，同时联系网络管理员解决网络访问问题。