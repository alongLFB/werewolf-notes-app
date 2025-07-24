# 夜晚结算规则修复报告

## 修复的问题

### 原始问题

用户报告："第一晚结算的时候女巫毒了 9 号狼人刀了 10 号但是结算的时候只有女巫毒的人死了狼人刀的人没有人"

### 根本原因分析

1. **优先级处理错误**: 原来的逻辑没有正确处理女巫毒杀的最高优先级
2. **守护+救药规则缺失**: 没有实现"守卫守护+女巫救药同时作用会导致死亡"的规则
3. **双重死亡处理**: NightActionPanel 中女巫毒杀会立即调用死亡函数，导致与结算函数冲突

## 新的夜晚结算规则

### 优先级顺序

1. **女巫毒杀** - 最高优先级，无法被任何手段阻挡
2. **狼人击杀** - 可以被守卫保护或女巫解药阻挡
3. **守护+救药冲突** - 如果同一目标同时受到守卫保护和女巫解药，会相互抵消导致死亡

### 详细规则逻辑

```typescript
// 第一步：处理女巫毒杀（最高优先级，无法阻挡）
witchPoisons.forEach((poison) => {
  if (poison.targetId && !finalDeaths.includes(poison.targetId)) {
    finalDeaths.push(poison.targetId);
    // 记录毒杀日志
  }
});

// 第二步：处理狼人击杀
werewolfKills.forEach((kill) => {
  if (kill.targetId && !finalDeaths.includes(kill.targetId)) {
    const isSaved = witchSaves.some((save) => save.targetId === kill.targetId);
    const isProtected = guardProtects.some(
      (protect) => protect.targetId === kill.targetId
    );

    let isKilled = true;

    if (isSaved && isProtected) {
      // 守护+救药同时作用 = 死亡
      isKilled = true;
      // 记录特殊死亡原因
    } else if (isSaved) {
      // 只有救药 = 救活
      isKilled = false;
    } else if (isProtected) {
      // 只有守护 = 保护
      isKilled = false;
    }

    if (isKilled) {
      finalDeaths.push(kill.targetId);
    }
  }
});
```

## 修复的代码变更

### 1. gameStore.ts - resolveNightActions 函数

- 重构了整个夜晚结算逻辑
- 添加了女巫毒杀优先级处理
- 实现了守护+救药冲突规则
- 改进了日志记录，明确显示各种死亡原因

### 2. NightActionPanel.tsx

- 移除了立即死亡处理逻辑
- 所有死亡都由结算函数统一处理
- 避免了双重处理导致的问题

### 3. 结算防重复机制

- 添加了 `isNightResolved` 和 `isDayResolved` 标记
- 防止同一回合多次结算

## 测试场景

### 场景 1: 基本狼杀

- 狼人击杀目标
- 无其他干扰
- **预期结果**: 目标死亡

### 场景 2: 女巫救药

- 狼人击杀目标
- 女巫救药救目标
- **预期结果**: 目标存活

### 场景 3: 守卫保护

- 狼人击杀目标
- 守卫保护目标
- **预期结果**: 目标存活

### 场景 4: 守护+救药冲突 ⭐️

- 狼人击杀目标
- 守卫保护目标
- 女巫救药救目标
- **预期结果**: 目标死亡（规则冲突）

### 场景 5: 女巫毒杀优先级 ⭐️

- 女巫毒杀目标
- 守卫保护同一目标（其他原因）
- **预期结果**: 目标死亡（毒杀无法阻挡）

### 场景 6: 复合情况

- 女巫毒杀 A
- 狼人击杀 B
- 守卫保护 B
- **预期结果**: A 死亡，B 存活

## 日志记录改进

现在的日志会清楚显示：

- "女巫毒死了 [玩家名]"
- "狼人击杀了 [玩家名]"
- "女巫使用解药救了 [玩家名]"
- "守卫保护了 [玩家名]"
- "[玩家名] 同时受到守卫保护和女巫解药，相互抵消导致死亡"

这样玩家可以清楚了解每个行动的结果和原因。

## 总结

修复后的夜晚结算系统现在能够：

1. ✅ 正确处理女巫毒杀的最高优先级
2. ✅ 实现守护+救药冲突规则
3. ✅ 防止重复结算
4. ✅ 提供清晰的日志记录
5. ✅ 避免双重死亡处理

用户报告的问题（狼刀没死，女巫毒杀正常）现在应该能够正确处理。
