# 狼人杀游戏流程优化 - 批量上警功能修复

## 问题描述

用户反映"批量上警"功能点击后没有反应，警长竞选无法正常进行。

## 问题分析

经过代码分析，发现问题出现在以下几个方面：

### 1. 游戏回合数据结构不完整

- 在 `createGame` 方法中，初始回合结构缺少 `policeElection` 字段
- 导致 `addPoliceCandidate` 方法无法正常工作

### 2. nextPhase 方法未正确创建新回合数据

- 当游戏从夜晚进入白天时，会增加回合数
- 但新回合在 `rounds` 数组中不存在，导致 `getCurrentRound()` 返回 null

## 解决方案

### 1. 修复游戏创建时的数据结构

```typescript
rounds: [
  {
    number: 1,
    phase: "night",
    votes: [],
    nightActions: [],
    actionLog: [`游戏开始！${playerCount}人局狼人杀开始`],
    policeElection: {
      candidates: [],
      votes: {},
    },
  },
],
```

### 2. 修复 nextPhase 方法

在进入新回合时正确创建回合数据结构：

```typescript
if (currentGame.currentPhase === "day") {
  newPhase = "night";
} else {
  newPhase = "day";
  newRound += 1;

  // 创建新回合的数据结构
  const newRoundData = {
    number: newRound,
    phase: newPhase,
    votes: [],
    nightActions: [],
    actionLog: [],
    policeElection: {
      candidates: [],
      votes: {},
    },
  };

  updatedRounds = [...currentGame.rounds, newRoundData];
}
```

### 3. 添加调试信息

在 `addPoliceCandidate` 方法中添加错误日志，便于调试：

```typescript
if (currentRound) {
  // ... 现有逻辑
} else {
  console.warn("无法获取当前回合，添加警长候选人失败");
}
```

## 新增游戏流程规则

### 1. 第一回合白天流程

1. **警长竞选** - 玩家上警候选
2. **警长选举** - 投票选出警长
3. **完成竞选** - 点击完成进入下一环节
4. **公布第一晚结果** - 显示夜晚死亡信息
5. **确认公布** - 进入发言和投票环节

### 2. 狼人自爆规则

- **9 人局/10 人局**：第一回合白天有狼人自爆 → 第二回合白天警徽流失
- **12 人局**：连续两个回合白天都有狼人自爆 → 第三回合白天警徽流失
- **自爆后**：直接进入下一回合夜晚

### 3. 警徽流失状态

- 跳过警长竞选环节
- 直接公布所有夜晚的死亡信息
- 进入自由发言和投票环节

## 相关文件修改

### 1. 类型定义更新 (`src/types/game.ts`)

- 添加 `werewolfExplosions` 字段跟踪狼人自爆
- 添加 `sheriffElectionCompleted` 和 `firstNightResultsAnnounced` 状态字段
- 添加 `werewolf_explosion` 死亡原因

### 2. 游戏状态管理 (`src/store/gameStore.ts`)

- 修复 `createGame` 和 `nextPhase` 方法
- 添加 `shouldShowSheriffElection`, `shouldShowVoting`, `shouldShowNightResults`, `isBadgeLost` 方法
- 添加 `explodeWerewolf`, `completeSheriffElection`, `announceFirstNightResults` 方法

### 3. 界面组件更新

- **页面主组件** (`src/app/page.tsx`) - 更新活动标签页逻辑
- **警长竞选面板** (`src/components/SheriffElectionPanel.tsx`) - 添加完成竞选按钮
- **投票面板** (`src/components/VotingPanel.tsx`) - 添加狼人自爆功能
- **夜晚结果面板** (`src/components/NightResultsPanel.tsx`) - 新建组件显示夜晚结果

## 测试建议

### 1. 基本功能测试

1. 创建新游戏
2. 进入第一回合白天
3. 测试批量上警功能
4. 完成警长竞选
5. 公布第一晚结果

### 2. 狼人自爆测试

1. 测试 9 人局第一回合自爆效果
2. 测试 12 人局连续两回合自爆效果
3. 验证警徽流失状态显示

### 3. 游戏流程测试

1. 验证各阶段自动切换
2. 测试不同人数局的规则差异
3. 确认所有按钮和功能正常工作

## 预期效果

- ✅ 批量上警功能正常工作
- ✅ 游戏流程按规则自动切换
- ✅ 狼人自爆影响后续流程
- ✅ 警徽流失状态正确处理
- ✅ 用户体验流畅，操作直观

修复完成后，用户应该能够：

1. 正常使用批量上警功能
2. 体验完整的警长竞选流程
3. 根据不同局数享受不同的游戏规则
4. 清楚地了解当前游戏阶段和后续流程
