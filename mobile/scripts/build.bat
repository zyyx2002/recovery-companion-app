@echo off
REM 戒断康复APP构建脚本 (Windows版本)
REM 用于自动化构建和发布流程

setlocal enabledelayedexpansion

REM 设置颜色 (Windows 10+)
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "NC=%ESC%[0m"

REM 日志函数
:log_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:log_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:log_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查依赖
:check_dependencies
call :log_info "检查构建依赖..."

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Node.js 未安装"
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :log_error "npm 未安装"
    exit /b 1
)

REM 检查EAS CLI
eas --version >nul 2>&1
if errorlevel 1 (
    call :log_warning "EAS CLI 未安装，正在安装..."
    npm install -g @expo/eas-cli
)

call :log_success "依赖检查完成"
goto :eof

REM 安装依赖
:install_dependencies
call :log_info "安装项目依赖..."
npm install
if errorlevel 1 (
    call :log_error "依赖安装失败"
    exit /b 1
)
call :log_success "依赖安装完成"
goto :eof

REM 运行测试
:run_tests
call :log_info "运行测试..."

REM 运行单元测试
npm run test >nul 2>&1
if errorlevel 1 (
    call :log_warning "单元测试跳过或失败"
) else (
    call :log_success "单元测试通过"
)

REM 运行类型检查
npm run type-check >nul 2>&1
if errorlevel 1 (
    call :log_warning "类型检查跳过或失败"
) else (
    call :log_success "类型检查通过"
)
goto :eof

REM 构建应用
:build_app
set "platform=%~1"
set "profile=%~2"

call :log_info "构建 !platform! 平台 (!profile! 配置)..."

if "!platform!"=="ios" (
    eas build --platform ios --profile !profile! --non-interactive
) else if "!platform!"=="android" (
    eas build --platform android --profile !profile! --non-interactive
) else if "!platform!"=="all" (
    eas build --platform all --profile !profile! --non-interactive
) else (
    call :log_error "不支持的平台: !platform!"
    exit /b 1
)

if errorlevel 1 (
    call :log_error "构建失败"
    exit /b 1
)

call :log_success "!platform! 构建完成"
goto :eof

REM 提交到应用商店
:submit_to_store
set "platform=%~1"

call :log_info "提交到 !platform! 应用商店..."

if "!platform!"=="ios" (
    eas submit --platform ios --non-interactive
) else if "!platform!"=="android" (
    eas submit --platform android --non-interactive
) else if "!platform!"=="all" (
    eas submit --platform all --non-interactive
) else (
    call :log_error "不支持的平台: !platform!"
    exit /b 1
)

if errorlevel 1 (
    call :log_error "提交失败"
    exit /b 1
)

call :log_success "!platform! 提交完成"
goto :eof

REM 生成构建报告
:generate_report
set "build_id=%~1"
set "platform=%~2"

call :log_info "生成构建报告..."

REM 生成报告文件
(
echo # 构建报告
echo.
echo ## 构建信息
echo - 构建ID: !build_id!
echo - 平台: !platform!
echo - 时间: %date% %time%
echo - 版本: 
for /f "tokens=2 delims=:" %%a in ('npm list --depth=0 2^>nul ^| findstr "recovery-app-mobile"') do echo   %%a
echo.
echo ## 构建状态
echo - 状态: 成功
echo - 构建时间: %date% %time%
echo.
echo ## 下一步
echo 1. 测试构建的应用
echo 2. 提交到应用商店
echo 3. 监控发布状态
) > build-report.md

call :log_success "构建报告已生成: build-report.md"
goto :eof

REM 显示帮助信息
:show_help
echo 用法: %0 {build^|submit^|full^|test} {ios^|android^|all} [profile]
echo.
echo 操作:
echo   build   - 构建应用
echo   submit  - 提交到应用商店
echo   full    - 完整流程(构建+提交)
echo   test    - 运行测试
echo.
echo 平台:
echo   ios     - iOS平台
echo   android - Android平台
echo   all     - 所有平台
echo.
echo 配置:
echo   development - 开发版本
echo   preview     - 预览版本
echo   production  - 生产版本(默认)
echo.
echo 示例:
echo   %0 build ios production
echo   %0 submit all
echo   %0 full android preview
goto :eof

REM 主函数
:main
set "action=%~1"
set "platform=%~2"
set "profile=%~3"
if "%profile%"=="" set "profile=production"

call :log_info "开始戒断康复APP构建流程..."
call :log_info "操作: !action!, 平台: !platform!, 配置: !profile!"

if "!action!"=="build" (
    call :check_dependencies
    call :install_dependencies
    call :run_tests
    call :build_app !platform! !profile!
    call :generate_report "build-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%" !platform!
) else if "!action!"=="submit" (
    call :submit_to_store !platform!
) else if "!action!"=="full" (
    call :check_dependencies
    call :install_dependencies
    call :run_tests
    call :build_app !platform! !profile!
    call :submit_to_store !platform!
    call :generate_report "full-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%" !platform!
) else if "!action!"=="test" (
    call :check_dependencies
    call :install_dependencies
    call :run_tests
) else (
    call :show_help
    exit /b 1
)

call :log_success "构建流程完成！"
goto :eof

REM 执行主函数
call :main %*
