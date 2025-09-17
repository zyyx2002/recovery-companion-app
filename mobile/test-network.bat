@echo off
echo 🌐 网络连接测试
echo ================

echo 📡 测试Google连接...
ping -n 4 google.com
if %errorlevel%==0 (
    echo ✅ Google连接正常
) else (
    echo ❌ Google连接失败
)

echo.
echo 📡 测试GitHub连接...
ping -n 4 github.com
if %errorlevel%==0 (
    echo ✅ GitHub连接正常
) else (
    echo ❌ GitHub连接失败
)

echo.
echo 📡 测试npm连接...
npm ping
if %errorlevel%==0 (
    echo ✅ npm连接正常
) else (
    echo ❌ npm连接失败
)

echo.
echo 🔧 网络配置建议：
echo    1. 如果Google连接失败，需要配置代理或VPN
echo    2. 如果GitHub连接失败，检查防火墙设置
echo    3. 如果npm连接失败，配置npm代理

echo.
echo 💡 快速解决方案：
echo    1. 使用Clash for Windows等代理工具
echo    2. 配置系统代理：127.0.0.1:7890
echo    3. 或者使用GitHub Actions自动构建

pause
