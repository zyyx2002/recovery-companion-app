@echo off
echo ========================================
echo 本地构建备选方案
echo ========================================

echo 检查网络连接...
ping -n 1 expo.dev >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 无法连接到 expo.dev
    echo 建议检查网络连接或使用VPN
)

echo.
echo 选择构建方式:
echo 1. 重试 EAS Build (推荐)
echo 2. 本地 Android 构建
echo 3. 检查网络设置
echo 4. 退出

set /p choice=请选择 (1-4): 

if "%choice%"=="1" goto eas_retry
if "%choice%"=="2" goto local_build
if "%choice%"=="3" goto network_check
if "%choice%"=="4" goto end

:eas_retry
echo 重试 EAS Build...
eas build --platform android --profile production --clear-cache
goto end

:local_build
echo 开始本地 Android 构建...
echo 注意: 需要配置 Android SDK 和签名密钥
cd android
echo 清理项目...
call gradlew clean
echo 构建 Release APK...
call gradlew assembleRelease
echo 构建完成! APK 位置: android\app\build\outputs\apk\release\
goto end

:network_check
echo 网络诊断...
echo 检查 DNS 解析...
nslookup expo.dev
echo.
echo 检查防火墙设置...
echo 请确保以下域名可以访问:
echo - expo.dev
echo - storage.googleapis.com
echo - api.expo.dev
echo.
echo 如果在企业网络环境，请联系网络管理员配置代理设置
goto end

:end
echo.
echo 构建脚本结束
pause