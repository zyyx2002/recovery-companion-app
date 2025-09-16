@echo off
chcp 65001 >nul
echo 🌐 启动戒断康复APP Web版本
echo ================================
echo.

echo 📦 检查依赖...
if not exist node_modules (
    echo 📥 安装依赖...
    npm install
)

echo.
echo 🚀 启动Web开发服务器...
echo 💡 服务器启动后，请在浏览器中访问: http://localhost:8081
echo 💡 按 Ctrl+C 停止服务器
echo.

npm start
