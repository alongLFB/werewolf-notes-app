#!/bin/bash

# 狼人杀应用调试快速启动脚本

echo "🐺 狼人杀应用调试助手"
echo "========================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    npm install
fi

echo ""
echo "🚀 启动调试模式..."
echo ""
echo "请在VS Code中："
echo "1. 打开调试面板 (Cmd+Shift+D)"
echo "2. 选择 'Next.js: debug full stack'"
echo "3. 点击绿色播放按钮开始调试"
echo ""
echo "或者直接按 F5 开始调试"
echo ""
echo "📍 调试要点："
echo "- 在 gameStore.ts 的 addPoliceCandidate 方法设置断点"
echo "- 在 SheriffElectionPanel.tsx 的 handleAddCandidates 设置断点"
echo "- 使用调试控制台查看变量值"
echo ""

# 提供选择
read -p "是否现在启动调试？(y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在启动..."
    code . --goto src/store/gameStore.ts:789
    echo "VS Code已打开，请按 F5 开始调试"
else
    echo "调试配置已就绪，随时可以开始！"
fi
