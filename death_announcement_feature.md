# 死亡公布机制实现报告

## 功能需求

根据用户需求实现以下游戏流程：

1. **第一回合**：进入白天后 → 警长选举 → 警长选举结束后公布第一晚死亡信息 → 开始投票
2. **第二回合开始**：进入白天时 → 立即公布昨夜死亡信息 → 开始投票

## 实现方案

### 1. 新增 `announceNightDeaths` 函数

**位置**: `gameStore.ts`

**功能**: 根据当前游戏状态公布相应回合的夜晚死亡信息

**逻辑**:

```typescript
announceNightDeaths: () => {
  // 确定要公布哪个回合的死亡
  let targetRound: number;

  if (currentGame.currentPhase === "day") {
    if (currentGame.currentRound === 1) {
      targetRound = 1; // 第一回合白天，查看第一回合夜晚
    } else {
      targetRound = currentGame.currentRound - 1; // 其他回合，查看前一回合夜晚
    }
  }

  // 收集死亡玩家并公布
  const deadPlayers = currentGame.players.filter(
    (player) =>
      !player.isAlive &&
      player.deathRound === targetRound &&
      (player.deathReason === "werewolf_kill" ||
        player.deathReason === "witch_poison")
  );

  // 公布死亡信息到游戏日志
};
```

### 2. 修改 `nextPhase` 函数

**位置**: `gameStore.ts`

**功能**: 在阶段转换时自动处理死亡公布

**逻辑**:

- 从夜晚进入白天时检查回合数
- 第一回合：提示进行警长选举，不立即公布死亡
- 第二回合及以后：自动公布昨夜死亡

```typescript
if (newPhase === "day") {
  if (newRound === 1) {
    // 第一回合白天，等警长选举后再公布
    get().addActionLog("第一个白天开始，请先进行警长选举");
  } else {
    // 第二回合及以后，立即公布昨夜死亡
    setTimeout(() => {
      get().announceNightDeaths();
    }, 100);
  }
}
```

### 3. 修改 `electSheriff` 函数

**位置**: `gameStore.ts`

**功能**: 第一回合警长选举结束后自动公布死亡

```typescript
// 如果是第一回合且当前是白天，警长选举结束后公布死亡信息
if (currentGame.currentRound === 1 && currentGame.currentPhase === "day") {
  setTimeout(() => {
    get().announceNightDeaths();
    get().addActionLog("警长选举结束，现在开始白天讨论和投票");
  }, 500);
}
```

### 4. 增强 GameControlPanel

**位置**: `GameControlPanel.tsx`

**功能**: 添加手动公布死亡按钮（第一回合使用）

**条件**: 只在第一回合白天且已选出警长时显示

```tsx
{
  currentGame.currentRound === 1 && isDay && currentGame.sheriff && (
    <button onClick={() => announceNightDeaths()}>公布昨夜死亡</button>
  );
}
```

## 游戏流程示例

### 第一回合流程

1. 游戏开始 → 第一个夜晚
2. 玩家进行夜间行动（狼刀、女巫毒救、守卫保护等）
3. 夜晚结算 → 确定死亡玩家
4. 进入白天 → 显示"请先进行警长选举"
5. 警长选举进行中...
6. 警长当选 → **自动公布昨夜死亡** → 开始白天讨论投票

### 第二回合及以后流程

1. 夜晚行动 → 夜晚结算
2. 进入白天 → **立即自动公布昨夜死亡** → 开始白天讨论投票

## 日志示例

### 死亡公布日志

```
昨夜死亡公布：玩家1、玩家3 死亡
[私密] 玩家1 死于 狼人击杀
[私密] 玩家3 死于 女巫毒杀
```

### 平安夜日志

```
昨夜平安，无人死亡
```

### 第一回合特殊日志

```
第一个白天开始，请先进行警长选举
玩家2 当选警长
昨夜死亡公布：玩家5 死亡
警长选举结束，现在开始白天讨论和投票
```

## 技术特点

1. **自动化处理**: 大部分情况下自动公布，减少手动操作
2. **灵活控制**: 第一回合提供手动公布选项，适应不同游戏节奏
3. **详细日志**: 提供公开和私密两层日志信息
4. **时序控制**: 使用 setTimeout 确保状态更新后再执行
5. **条件判断**: 根据回合数、阶段、警长状态智能决定公布时机

## 测试要点

1. **第一回合测试**:

   - 夜晚有死亡 → 进入白天 → 警长选举 → 选出警长后是否自动公布死亡
   - 夜晚无死亡 → 相同流程 → 是否显示"昨夜平安"

2. **第二回合测试**:

   - 夜晚有死亡 → 进入白天 → 是否立即公布死亡
   - 夜晚无死亡 → 进入白天 → 是否显示"昨夜平安"

3. **手动公布测试**:
   - 第一回合选出警长后 → 手动点击"公布昨夜死亡"按钮是否工作

这个实现确保了游戏流程符合传统狼人杀的节奏，同时提供了灵活的控制选项。
