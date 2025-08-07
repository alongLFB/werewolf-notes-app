# 死亡信息公布逻辑优化

## 改进内容

### 1. 移除手动公布按钮
- 删除了GameControlPanel中的"公布昨夜死亡"按钮
- 改为根据游戏逻辑自动显示相应的死亡信息

### 2. 优化NightResultsPanel显示逻辑

#### 显示条件：
- **第一回合**：警长竞选完成后自动显示第一晚死亡信息
- **狼人自爆**：立即显示当前回合的夜晚死亡信息
- **其他回合**：自动显示前一晚的死亡信息

#### 显示内容：
- **狼人自爆情况**：显示当前回合夜晚死亡信息，标注"警徽流失"
- **第一回合**：显示第一晚死亡信息，提供"进入发言环节"按钮
- **其他回合**：显示前一晚死亡信息，提示正常流程

### 3. 狼人自爆逻辑完善
- 如果自爆的是警长，自动设置警徽流失
- 自爆后直接跳过当前白天，进入下一回合夜晚
- 在死亡信息面板中显示特殊的警徽流失状态

## 游戏流程

### 第一回合流程：
1. **夜晚** → 记录夜间行动 → 结算
2. **白天** → 警长竞选
3. **警长竞选完成** → 自动显示第一晚死亡信息
4. **确认公布结果** → 进入发言和投票环节

### 狼人自爆流程：
1. **白天阶段** → 狼人选择自爆
2. **立即显示** → 当前回合夜晚死亡信息
3. **直接跳转** → 下一回合夜晚
4. **警徽流失标记** → 如果自爆的是警长

### 普通回合流程：
1. **夜晚** → 记录夜间行动 → 结算
2. **白天** → 自动显示前一晚死亡信息
3. **正常流程** → 发言和投票

## 技术实现

### NightResultsPanel核心逻辑：
```typescript
const shouldShowPanel = () => {
  if (isPoliceDestroyed) {
    // 狼人自爆情况：总是显示
    return true;
  }
  
  if (isFirstRound) {
    // 第一回合：警长竞选完成后显示
    const policeElection = currentRound?.policeElection;
    return policeElection?.isCompleted || currentGame.sheriff || policeElection?.badgeLost;
  }
  
  // 其他回合：直接显示前一晚死亡信息
  return true;
};
```

### 死亡信息获取逻辑：
```typescript
const getNightDeathsToShow = () => {
  if (isPoliceDestroyed) {
    // 狼人自爆：显示当前回合的夜晚死亡信息
    return [{ round: currentGame.currentRound, deaths: currentRound?.nightDeaths || [] }];
  }
  
  if (isFirstRound) {
    // 第一回合：显示第一晚的死亡信息
    return [{ round: 1, deaths: firstRound?.nightDeaths || [] }];
  }
  
  // 其他回合：显示前一晚的死亡信息
  return [{ round: currentGame.currentRound - 1, deaths: previousRound?.nightDeaths || [] }];
};
```

## 用户体验改进

1. **自动化流程**：减少手动操作，游戏流程更顺畅
2. **清晰提示**：不同情况下显示不同的状态说明
3. **正确时机**：在合适的时机自动显示死亡信息
4. **异常处理**：狼人自爆等特殊情况的正确处理

## 测试建议

1. **第一回合测试**：
   - 夜晚行动 → 警长竞选 → 验证死亡信息自动显示
   
2. **狼人自爆测试**：
   - 任意回合狼人自爆 → 验证当前夜晚死亡信息显示
   - 警长自爆 → 验证警徽流失状态
   
3. **普通回合测试**：
   - 第二回合及以后 → 验证前一晚死亡信息自动显示
