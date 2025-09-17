# 🏪 Google Play Store 发布设置指南

## 📋 前置条件

### 1. Google Play Console账户
- 注册Google Play Console开发者账户（$25一次性费用）
- 创建应用程序条目
- 完成应用信息填写

### 2. 应用签名设置
```bash
# 在EAS中配置应用签名
eas credentials:configure --platform android
```

## 🔧 配置Google Play API

### 1. 创建服务账户
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google Play Android Developer API
4. 创建服务账户：
   - 导航到 IAM & Admin → Service Accounts
   - 点击 "Create Service Account"
   - 填写服务账户详情
   - 创建并下载JSON密钥文件

### 2. 配置Play Console权限
1. 访问 [Google Play Console](https://play.google.com/console/)
2. 选择您的应用
3. 导航到 Setup → API access
4. 链接您的Google Cloud项目
5. 为服务账户分配权限：
   - App information: View only
   - Release management: Manage releases
   - Store presence: View only

## 🔑 GitHub Secrets配置

在GitHub仓库中添加以下Secrets：

### 必需配置
```
GOOGLE_PLAY_SERVICE_ACCOUNT
```
- 值：Google Cloud服务账户JSON文件的完整内容
- 获取方式：从Google Cloud Console下载的JSON文件

### 示例JSON格式
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40your-project.iam.gserviceaccount.com"
}
```

## 📱 应用配置

### 1. 更新app.json
确保应用包名与Google Play Console中的一致：
```json
{
  "expo": {
    "android": {
      "package": "com.recoverycompanion.app"
    }
  }
}
```

### 2. 配置EAS Build
确保eas.json中的生产配置正确：
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

## 🚀 发布流程

### 自动发布（推荐）
1. 创建Git标签：
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions将自动：
   - 构建生产版AAB文件
   - 上传到Google Play Store
   - 发布到生产轨道

### 手动发布
1. 触发GitHub Actions工作流
2. 下载构建的AAB文件
3. 手动上传到Google Play Console

## 📊 发布轨道说明

### Internal Testing（内部测试）
- 最多100个测试用户
- 快速发布，无需审核
- 适合开发团队测试

### Alpha Testing（Alpha测试）
- 封闭测试，邀请制
- 需要简单审核
- 适合小范围用户测试

### Beta Testing（Beta测试）
- 开放或封闭测试
- 需要审核
- 适合大范围用户测试

### Production（生产）
- 正式发布
- 需要完整审核
- 面向所有用户

## 🔍 监控和分析

### Google Play Console
- 下载量统计
- 崩溃报告
- 用户评价
- 性能指标

### Firebase Analytics（可选）
```bash
# 添加Firebase Analytics
expo install @react-native-firebase/app @react-native-firebase/analytics
```

## ⚠️ 注意事项

### 1. 首次发布
- 首次发布需要手动上传到Google Play Console
- 设置应用详情、截图、描述等
- 完成内容评级

### 2. 版本管理
- 每次发布都需要增加版本号
- 遵循语义化版本控制
- 保持版本历史记录

### 3. 审核时间
- 新应用：1-3天
- 更新版本：几小时到1天
- 政策违规可能导致延迟

## 🆘 故障排除

### 常见错误
1. **包名冲突**：确保包名唯一且与Play Console一致
2. **签名问题**：使用EAS管理的签名证书
3. **权限问题**：检查服务账户权限配置
4. **API配额**：确保Google Play API配额充足

### 调试命令
```bash
# 检查EAS配置
eas config

# 查看构建状态
eas build:list

# 检查凭据
eas credentials
```

## 📞 获取帮助

- [Google Play Console帮助](https://support.google.com/googleplay/android-developer/)
- [EAS Build文档](https://docs.expo.dev/build/introduction/)
- [GitHub Actions文档](https://docs.github.com/en/actions)