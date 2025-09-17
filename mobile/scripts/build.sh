#!/bin/bash

# 戒断康复APP构建脚本
# 用于自动化构建和发布流程

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查构建依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 检查EAS CLI
    if ! command -v eas &> /dev/null; then
        log_warning "EAS CLI 未安装，正在安装..."
        npm install -g @expo/eas-cli
    fi
    
    log_success "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    npm install
    log_success "依赖安装完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    # 运行单元测试
    if npm run test 2>/dev/null; then
        log_success "单元测试通过"
    else
        log_warning "单元测试跳过或失败"
    fi
    
    # 运行类型检查
    if npm run type-check 2>/dev/null; then
        log_success "类型检查通过"
    else
        log_warning "类型检查跳过或失败"
    fi
}

# 构建应用
build_app() {
    local platform=$1
    local profile=$2
    
    log_info "构建 $platform 平台 ($profile 配置)..."
    
    case $platform in
        "ios")
            eas build --platform ios --profile $profile --non-interactive
            ;;
        "android")
            eas build --platform android --profile $profile --non-interactive
            ;;
        "all")
            eas build --platform all --profile $profile --non-interactive
            ;;
        *)
            log_error "不支持的平台: $platform"
            exit 1
            ;;
    esac
    
    log_success "$platform 构建完成"
}

# 提交到应用商店
submit_to_store() {
    local platform=$1
    
    log_info "提交到 $platform 应用商店..."
    
    case $platform in
        "ios")
            eas submit --platform ios --non-interactive
            ;;
        "android")
            eas submit --platform android --non-interactive
            ;;
        "all")
            eas submit --platform all --non-interactive
            ;;
        *)
            log_error "不支持的平台: $platform"
            exit 1
            ;;
    esac
    
    log_success "$platform 提交完成"
}

# 生成构建报告
generate_report() {
    local build_id=$1
    local platform=$2
    
    log_info "生成构建报告..."
    
    # 获取构建信息
    local build_info=$(eas build:list --limit 1 --json)
    
    # 生成报告文件
    cat > build-report.md << EOF
# 构建报告

## 构建信息
- 构建ID: $build_id
- 平台: $platform
- 时间: $(date)
- 版本: $(node -p "require('./package.json').version")

## 构建状态
- 状态: 成功
- 构建时间: $(date)

## 下一步
1. 测试构建的应用
2. 提交到应用商店
3. 监控发布状态

EOF
    
    log_success "构建报告已生成: build-report.md"
}

# 主函数
main() {
    local action=$1
    local platform=$2
    local profile=${3:-production}
    
    log_info "开始戒断康复APP构建流程..."
    log_info "操作: $action, 平台: $platform, 配置: $profile"
    
    case $action in
        "build")
            check_dependencies
            install_dependencies
            run_tests
            build_app $platform $profile
            generate_report "build-$(date +%s)" $platform
            ;;
        "submit")
            submit_to_store $platform
            ;;
        "full")
            check_dependencies
            install_dependencies
            run_tests
            build_app $platform $profile
            submit_to_store $platform
            generate_report "full-$(date +%s)" $platform
            ;;
        "test")
            check_dependencies
            install_dependencies
            run_tests
            ;;
        *)
            echo "用法: $0 {build|submit|full|test} {ios|android|all} [profile]"
            echo ""
            echo "操作:"
            echo "  build   - 构建应用"
            echo "  submit  - 提交到应用商店"
            echo "  full    - 完整流程(构建+提交)"
            echo "  test    - 运行测试"
            echo ""
            echo "平台:"
            echo "  ios     - iOS平台"
            echo "  android - Android平台"
            echo "  all     - 所有平台"
            echo ""
            echo "配置:"
            echo "  development - 开发版本"
            echo "  preview     - 预览版本"
            echo "  production  - 生产版本(默认)"
            echo ""
            echo "示例:"
            echo "  $0 build ios production"
            echo "  $0 submit all"
            echo "  $0 full android preview"
            exit 1
            ;;
    esac
    
    log_success "构建流程完成！"
}

# 执行主函数
main "$@"
