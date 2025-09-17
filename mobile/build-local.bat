@echo off
chcp 65001 >nul
echo 🏠 戒断康复APP本地构建工具
echo ================================
echo.

echo 📋 选择构建类型：
echo 1. Web版本 (浏览器访问)
echo 2. APK文件 (Android安装包)
echo 3. 开发版本 (Expo Go)
echo 4. 完整构建 (所有版本)
echo.

set /p choice="请选择 (1-4): "

if "%choice%"=="1" goto web_build
if "%choice%"=="2" goto apk_build
if "%choice%"=="3" goto dev_build
if "%choice%"=="4" goto full_build
goto invalid_choice

:web_build
echo.
echo 🌐 构建Web版本...
call npm install
call npm run web
echo.
echo ✅ Web版本构建完成！
echo 📱 访问地址: http://localhost:8081
echo 💡 提示: 可以分享此地址给用户使用
goto end

:apk_build
echo.
echo 📱 构建APK文件...
echo ⚠️  注意: 需要安装Android Studio
call npm install
call npx expo run:android --variant release
echo.
echo ✅ APK构建完成！
echo 📁 文件位置: android/app/build/outputs/apk/release/
goto end

:dev_build
echo.
echo 🔧 启动开发版本...
call npm install
call npm start
echo.
echo ✅ 开发服务器启动完成！
echo 📱 使用Expo Go扫描二维码
goto end

:full_build
echo.
echo 🚀 开始完整构建...
call npm install
echo.
echo 1/3 构建Web版本...
call npm run web
echo.
echo 2/3 构建开发版本...
call npm start
echo.
echo 3/3 构建APK版本...
call npx expo run:android --variant release
echo.
echo ✅ 所有版本构建完成！
goto end

:invalid_choice
echo ❌ 无效选择，请重新运行脚本
goto end

:end
echo.
echo 🎉 构建完成！
echo 📞 如需帮助，请查看 README.md
pause