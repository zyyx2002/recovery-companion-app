@echo off
chcp 65001 >nul
echo 🧪 戒断康复APP构建测试
echo ========================
echo.

echo 🔍 环境检查...
echo Node.js版本:
node --version
echo.
echo npm版本:
npm --version
echo.
echo Java版本:
java -version
echo.

echo 📦 检查依赖...
if exist node_modules (
    echo ✅ 依赖已安装
) else (
    echo 📥 安装依赖...
    npm install
)

echo.
echo 🌐 测试Web构建...
echo 启动Web开发服务器...
echo 💡 请在浏览器中访问: http://localhost:8081
echo 💡 按 Ctrl+C 停止服务器
echo.

npm run web
