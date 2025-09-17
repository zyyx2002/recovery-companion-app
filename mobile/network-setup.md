# 🌐 网络配置解决方案

## 方案一：配置代理（推荐）

### 1. 设置系统代理
```bash
# 设置HTTP代理
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890

# 或者使用环境变量
setx HTTP_PROXY http://127.0.0.1:7890
setx HTTPS_PROXY http://127.0.0.1:7890
```

### 2. 配置npm代理
```bash
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890
```

### 3. 配置Git代理
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

## 方案二：使用VPN

### 1. 安装VPN客户端
- Clash for Windows
- V2RayN
- Shadowsocks

### 2. 配置全局代理
- 开启系统代理
- 选择全局模式
- 测试Google访问

## 方案三：使用云服务器构建

### 1. 租用海外服务器
- 阿里云香港节点
- 腾讯云新加坡节点
- AWS EC2

### 2. 在服务器上构建
```bash
# 克隆项目到服务器
git clone your-repo
cd mobile

# 安装依赖
npm install

# 构建应用
eas build --platform android
```

## 方案四：使用GitHub Actions（免费）

### 1. 创建GitHub仓库
### 2. 配置GitHub Actions
### 3. 自动构建和发布

## 测试网络连接

```bash
# 测试Google连接
ping google.com

# 测试GitHub连接
ping github.com

# 测试npm连接
npm ping
```

## 推荐流程

1. **立即解决**：配置代理或VPN
2. **长期方案**：使用GitHub Actions自动构建
3. **备用方案**：租用海外服务器
