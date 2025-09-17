@echo off
chcp 65001 >nul
echo 📦 戒断康复APP离线打包工具
echo ================================
echo.

echo 🔍 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

echo 📋 创建离线发布包...
set PACKAGE_DIR=recovery-app-offline
if exist %PACKAGE_DIR% rmdir /s /q %PACKAGE_DIR%
mkdir %PACKAGE_DIR%

echo 📁 复制项目文件...
xcopy /E /I /Y . %PACKAGE_DIR%\mobile
xcopy /E /I /Y ..\backend %PACKAGE_DIR%\backend
xcopy /E /I /Y ..\admin %PACKAGE_DIR%\admin

echo 📄 创建安装说明...
(
echo # 戒断康复APP离线安装包
echo.
echo ## 📱 安装说明
echo.
echo ### 方法一：Web版本 (推荐)
echo 1. 进入 mobile 文件夹
echo 2. 双击运行 build-local.bat
echo 3. 选择 "1. Web版本"
echo 4. 在浏览器中访问 http://localhost:8081
echo.
echo ### 方法二：APK安装
echo 1. 安装 Android Studio
echo 2. 进入 mobile 文件夹
echo 3. 双击运行 build-local.bat
echo 4. 选择 "2. APK文件"
echo 5. 等待构建完成
echo 6. 安装生成的APK文件
echo.
echo ### 方法三：开发版本
echo 1. 安装 Expo Go 应用
echo 2. 进入 mobile 文件夹
echo 3. 双击运行 build-local.bat
echo 4. 选择 "3. 开发版本"
echo 5. 用Expo Go扫描二维码
echo.
echo ## 🔧 系统要求
echo - Windows 10/11
echo - Node.js 18+
echo - 4GB 可用内存
echo - 2GB 可用磁盘空间
echo.
echo ## 📞 技术支持
echo 如遇问题，请查看项目文档或联系技术支持
) > %PACKAGE_DIR%\安装说明.txt

echo 📄 创建快速启动脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🚀 戒断康复APP快速启动
echo echo ========================
echo echo.
echo echo 📋 选择启动方式：
echo echo 1. Web版本 (浏览器)
echo echo 2. 开发版本 (Expo Go)
echo echo.
echo set /p choice="请选择 (1-2): "
echo.
echo if "%%choice%%"=="1" ^(
echo     echo 🌐 启动Web版本...
echo     cd mobile
echo     call npm install
echo     call npm run web
echo ^) else if "%%choice%%"=="2" ^(
echo     echo 🔧 启动开发版本...
echo     cd mobile
echo     call npm install
echo     call npm start
echo ^) else ^(
echo     echo ❌ 无效选择
echo ^)
echo pause
) > %PACKAGE_DIR%\快速启动.bat

echo 📄 创建环境检查脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🔍 环境检查工具
echo echo ================
echo echo.
echo echo 检查 Node.js...
echo where node ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Node.js 未安装
echo     echo 💡 请访问 https://nodejs.org 下载安装
echo ^) else ^(
echo     echo ✅ Node.js 已安装
echo     node --version
echo ^)
echo echo.
echo echo 检查 npm...
echo where npm ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ npm 未安装
echo ^) else ^(
echo     echo ✅ npm 已安装
echo     npm --version
echo ^)
echo echo.
echo echo 检查磁盘空间...
echo for /f "tokens=3" %%i in ^('dir /-c ^| find "bytes free"'^) do set free=%%i
echo echo 可用空间: %%free%% 字节
echo echo.
echo pause
) > %PACKAGE_DIR%\环境检查.bat

echo 📄 创建项目信息...
(
echo 项目名称: 戒断康复助手
echo 版本: 1.0.0
echo 构建时间: %date% %time%
echo 构建环境: Windows
echo 包大小: 约 50MB
echo.
echo 功能特性:
echo - 戒断进度追踪
echo - 任务管理系统
echo - AI陪伴功能
echo - 社区互动
echo - 成就系统
echo - 推送通知
echo.
echo 技术栈:
echo - React Native + Expo
echo - Node.js + Express
echo - PostgreSQL
echo - TypeScript
) > %PACKAGE_DIR%\项目信息.txt

echo 📦 压缩发布包...
powershell -command "Compress-Archive -Path '%PACKAGE_DIR%\*' -DestinationPath 'recovery-app-offline.zip' -Force"

echo.
echo ✅ 离线发布包创建完成！
echo 📁 发布包位置: recovery-app-offline.zip
echo 📄 安装说明: %PACKAGE_DIR%\安装说明.txt
echo.
echo 🎯 使用方法:
echo 1. 将 recovery-app-offline.zip 分发给用户
echo 2. 用户解压后运行 快速启动.bat
echo 3. 按照安装说明操作
echo.
pause
