@echo off
chcp 65001 >nul
echo 🔧 环境配置工具
echo ================
echo.

echo 🔍 检测已安装的软件...

echo 📋 Java检测:
where java >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Java已安装
    java -version
) else (
    echo ❌ Java未安装
)

echo.
echo 📋 Android Studio检测:
if exist "C:\Program Files\Android\Android Studio" (
    echo ✅ Android Studio已安装
    set ANDROID_STUDIO_PATH=C:\Program Files\Android\Android Studio
) else if exist "C:\Program Files (x86)\Android\Android Studio" (
    echo ✅ Android Studio已安装
    set ANDROID_STUDIO_PATH=C:\Program Files (x86)\Android\Android Studio
) else (
    echo ❌ Android Studio未找到
    echo 💡 请确保Android Studio已正确安装
)

echo.
echo 📋 Android SDK检测:
if exist "%LOCALAPPDATA%\Android\Sdk" (
    echo ✅ Android SDK已找到
    set ANDROID_SDK_PATH=%LOCALAPPDATA%\Android\Sdk
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    echo ✅ Android SDK已找到
    set ANDROID_SDK_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
) else (
    echo ❌ Android SDK未找到
    echo 💡 请打开Android Studio，安装Android SDK
)

echo.
echo 🔧 配置环境变量...

echo 设置JAVA_HOME...
for /f "tokens=*" %%i in ('where java') do (
    set JAVA_PATH=%%i
    goto :found_java
)
:found_java
set JAVA_HOME=%JAVA_PATH:~0,-10%
echo JAVA_HOME设置为: %JAVA_HOME%

echo 设置ANDROID_HOME...
if defined ANDROID_SDK_PATH (
    set ANDROID_HOME=%ANDROID_SDK_PATH%
    echo ANDROID_HOME设置为: %ANDROID_HOME%
) else (
    echo ❌ 无法设置ANDROID_HOME，请手动配置
)

echo.
echo 📝 创建环境配置脚本...
(
echo @echo off
echo echo 🔧 设置戒断康复APP构建环境
echo set JAVA_HOME=%JAVA_HOME%
echo set ANDROID_HOME=%ANDROID_HOME%
echo set PATH=%%PATH%%;%%JAVA_HOME%%\bin;%%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\platform-tools
echo echo ✅ 环境变量已设置
echo echo JAVA_HOME: %%JAVA_HOME%%
echo echo ANDROID_HOME: %%ANDROID_HOME%%
) > set-env.bat

echo.
echo 📝 创建永久环境变量设置脚本...
(
echo @echo off
echo echo 🔧 永久设置环境变量
echo echo 注意: 需要管理员权限
echo.
echo setx JAVA_HOME "%JAVA_HOME%" /M
echo setx ANDROID_HOME "%ANDROID_HOME%" /M
echo setx PATH "%%PATH%%;%%JAVA_HOME%%\bin;%%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\platform-tools" /M
echo echo ✅ 环境变量已永久设置
echo echo 请重新打开命令行窗口使环境变量生效
) > set-env-permanent.bat

echo.
echo ✅ 环境配置完成！
echo.
echo 🎯 下一步:
echo 1. 运行 set-env.bat 设置当前会话环境变量
echo 2. 或者以管理员身份运行 set-env-permanent.bat 永久设置
echo 3. 然后运行 build-local.bat 开始构建
echo.
echo 💡 提示:
echo - 如果遇到权限问题，请以管理员身份运行
echo - 设置完成后需要重新打开命令行窗口
echo.
pause
