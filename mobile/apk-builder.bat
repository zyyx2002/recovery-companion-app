@echo off
chcp 65001 >nul
echo 🔨 戒断康复APP APK构建工具
echo ================================
echo.

echo 🔍 检查构建环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    echo 💡 请先安装 Node.js: https://nodejs.org
    pause
    exit /b 1
)

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java 未安装
    echo 💡 请先安装 Java JDK: https://adoptium.net
    pause
    exit /b 1
)

echo ✅ 基础环境检查通过
echo.

echo 📋 选择构建方式：
echo 1. 使用Expo CLI构建 (推荐)
echo 2. 使用React Native CLI构建
echo 3. 使用Android Studio构建
echo.

set /p build_choice="请选择构建方式 (1-3): "

if "%build_choice%"=="1" goto expo_build
if "%build_choice%"=="2" goto rn_build
if "%build_choice%"=="3" goto as_build
goto invalid_choice

:expo_build
echo.
echo 🚀 使用Expo CLI构建APK...
echo.

echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🔧 配置Expo...
call npx expo install --fix
if %errorlevel% neq 0 (
    echo ❌ Expo配置失败
    pause
    exit /b 1
)

echo 🏗️ 构建APK...
call npx expo run:android --variant release
if %errorlevel% neq 0 (
    echo ❌ APK构建失败
    echo 💡 请检查Android SDK配置
    pause
    exit /b 1
)

echo ✅ APK构建成功！
echo 📁 文件位置: android/app/build/outputs/apk/release/
goto end

:rn_build
echo.
echo 🚀 使用React Native CLI构建APK...
echo.

echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🔧 清理缓存...
call npx react-native clean
if %errorlevel% neq 0 (
    echo ⚠️  清理缓存失败，继续构建...
)

echo 🏗️ 构建APK...
call npx react-native build-android --mode=release
if %errorlevel% neq 0 (
    echo ❌ APK构建失败
    pause
    exit /b 1
)

echo ✅ APK构建成功！
echo 📁 文件位置: android/app/build/outputs/apk/release/
goto end

:as_build
echo.
echo 🚀 使用Android Studio构建APK...
echo.

echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🔧 生成Android项目...
call npx expo prebuild --platform android
if %errorlevel% neq 0 (
    echo ❌ Android项目生成失败
    pause
    exit /b 1
)

echo 📱 打开Android Studio...
echo 💡 请在Android Studio中：
echo    1. 打开 android 文件夹
echo    2. 等待Gradle同步完成
echo    3. 选择 Build → Generate Signed Bundle/APK
echo    4. 选择 APK
echo    5. 配置签名信息
echo    6. 选择 release 构建类型
echo    7. 点击 Finish 开始构建
echo.

start android
echo ✅ Android Studio已打开
goto end

:invalid_choice
echo ❌ 无效选择，请重新运行脚本
goto end

:end
echo.
echo 🎉 构建完成！
echo.
echo 📱 APK安装说明：
echo 1. 将APK文件传输到Android设备
echo 2. 在设备上启用"未知来源"安装
echo 3. 点击APK文件进行安装
echo.
echo 🔧 如果构建失败：
echo 1. 检查Android SDK是否正确安装
echo 2. 检查JAVA_HOME环境变量
echo 3. 检查ANDROID_HOME环境变量
echo 4. 尝试清理项目缓存
echo.
pause
