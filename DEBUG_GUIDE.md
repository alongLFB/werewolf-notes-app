# VS Code 调试 Next.js 应用指南

## 设置完成

已为你的 Next.js 狼人杀应用配置了完整的 VS Code 调试环境。

## 调试配置说明

### 1. Next.js: debug server-side

- **用途**: 调试服务端代码（API 路由、服务端组件等）
- **适用场景**: 后端逻辑、数据处理、API 调试

### 2. Next.js: debug client-side

- **用途**: 调试客户端代码（React 组件、浏览器行为等）
- **适用场景**: 前端组件、用户交互、浏览器端逻辑

### 3. Next.js: debug full stack

- **用途**: 同时调试前后端代码
- **适用场景**: 全栈调试，最推荐使用

## 使用步骤

### 方法一：使用调试面板（推荐）

1. **打开调试面板**

   - 按 `Cmd+Shift+D` (Mac) 或 `Ctrl+Shift+D` (Windows/Linux)
   - 或点击左侧活动栏的"运行和调试"图标

2. **选择调试配置**
   - 在顶部下拉菜单中选择 "Next.js: debug full stack"
3. **开始调试**

   - 点击绿色播放按钮或按 `F5`
   - 应用会自动启动并在 http://localhost:3000 打开

4. **设置断点**
   - 在代码行号左侧点击设置红色断点
   - 或按 `F9` 在当前行设置断点

### 方法二：命令面板启动

1. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 "Debug: Start Debugging"
3. 选择调试配置

## 调试你的狼人杀应用

### 1. 调试 gameStore.ts 中的状态管理

```typescript
// 在 shouldShowSheriffElection 方法中设置断点
shouldShowSheriffElection: () => {
  const { currentGame } = get();
  if (!currentGame) return false; // 👈 在这里设置断点

  // 调试变量
  console.log('当前游戏状态:', currentGame);
  console.log('当前回合:', currentGame.currentRound);
  console.log('当前阶段:', currentGame.currentPhase);

  // 其余逻辑...
},
```

### 2. 调试组件渲染

```typescript
// 在 SheriffElectionPanel.tsx 中设置断点
export const SheriffElectionPanel: React.FC = () => {
  const {
    currentGame,
    getAlivePlayers,
    addPoliceCandidate, // 👈 在函数调用处设置断点
    // ...
  } = useGameStore();

  const handleAddCandidates = () => {
    if (selectedPlayers.length === 0) return; // 👈 设置断点检查条件

    selectedPlayers.forEach((playerId) => {
      if (!candidates.includes(playerId)) {
        addPoliceCandidate(playerId); // 👈 设置断点追踪函数调用
      }
    });
    setSelectedPlayers([]);
  };
```

### 3. 调试用户交互

```typescript
// 在页面组件中调试状态变化
const getActiveTab = (): "day" | "night" | "sheriff" | "log" | "results" => {
  if (!currentGame) return "day";

  // 👈 在条件判断处设置断点
  if (showGameLog) return "log";

  if (currentGame.currentPhase === "night") {
    return "night";
  } else if (currentGame.currentPhase === "day") {
    // 👈 在复杂逻辑处设置断点
    if (shouldShowSheriffElection()) {
      return "sheriff";
    }
    // ...
  }
};
```

## 调试技巧

### 1. 条件断点

- 右键点击断点 → "编辑断点"
- 添加条件如: `currentGame.currentRound === 1`
- 只有满足条件时才会触发断点

### 2. 日志断点

- 右键点击断点 → "编辑断点"
- 选择"日志消息"而不是"暂停"
- 输入如: `当前回合: {currentGame.currentRound}`

### 3. 变量监视

- 在调试面板的"监视"部分添加变量
- 如: `currentGame.werewolfExplosions`
- 实时查看变量值变化

### 4. 调用堆栈

- 查看函数调用链
- 了解代码执行路径

### 5. 控制台调试

- 在断点暂停时，可以在调试控制台执行代码
- 如: `get().getCurrentRound()`

## 常见调试场景

### 批量上警功能调试

1. 在 `addPoliceCandidate` 方法开头设置断点
2. 在 `getCurrentRound()` 调用处设置断点
3. 在 `SheriffElectionPanel` 的 `handleAddCandidates` 设置断点
4. 追踪数据流：UI 点击 → 状态更新 → 组件重渲染

### 游戏流程调试

1. 在 `shouldShowSheriffElection` 设置断点
2. 在 `getActiveTab` 设置断点
3. 在 `nextPhase` 设置断点
4. 观察游戏状态如何影响 UI 显示

### 狼人自爆功能调试

1. 在 `explodeWerewolf` 方法设置断点
2. 在 `shouldShowSheriffElection` 的爆炸逻辑设置断点
3. 追踪自爆如何影响后续游戏流程

## 快捷键

- `F5`: 开始/继续调试
- `F9`: 设置/取消断点
- `F10`: 单步跳过（下一行）
- `F11`: 单步进入（进入函数）
- `Shift+F11`: 单步跳出（跳出函数）
- `Shift+F5`: 停止调试
- `Cmd+Shift+F5`: 重启调试

## 注意事项

1. **Source Maps**: 已配置，TypeScript 代码可以直接调试
2. **热重载**: 调试时支持代码热重载
3. **多进程**: 同时调试前后端时可能有多个调试会话
4. **性能**: 调试模式会略微影响性能，生产环境不要使用

## 故障排除

### 断点不生效

1. 确保使用调试模式启动（不是 `npm run dev`）
2. 检查 source map 是否正确生成
3. 重启调试会话

### 无法连接到调试器

1. 检查端口 3000 是否被占用
2. 重启 VS Code
3. 清理 `.next` 缓存文件夹

### 变量显示 undefined

1. 确保在正确的作用域内
2. 检查变量名是否正确
3. 可能需要等待异步操作完成

现在你可以开始调试你的狼人杀应用了！建议先从调试 `addPoliceCandidate` 方法开始，这样可以解决批量上警的问题。
