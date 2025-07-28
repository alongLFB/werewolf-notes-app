# 警长系统完善 - 职务而非角色

## 🎖️ 修正概念

### ❌ 修正前的错误概念

- **村长角色**: 错误地将警长定义为一个角色类型
- **角色混淆**: 将游戏职务当作身份角色

### ✅ 修正后的正确概念

- **警长职务**: 警长是游戏中选举产生的职务，不是身份角色
- **任何角色都可以当选**: 村民、预言家、女巫等任何角色都可能当选警长
- **职务特权**: 警长拥有特殊的投票权重和死亡处理机制

## 🗳️ 警长机制详解

### 选举机制

1. **上警阶段**: 玩家自愿上警竞选
2. **警长选举**: 全体玩家投票选出警长
3. **当选权利**: 获得特殊职务权限

### 投票权重

- **普通玩家**: 1 票投票权
- **警长**: 1.5 票投票权
- **显示方式**: 票数统计中正确显示小数（如"3.5 票"）

### 死亡处理

当警长死亡时，有两种选择：

#### 1. 移交警徽

- 选择存活玩家接任警长
- 新警长获得 1.5 票投票权
- 记录移交日志

#### 2. 撕毁警徽

- 销毁警长职务
- 本局游戏不再有警长
- 所有玩家回到 1 票权重

## 💻 技术实现

### 类型定义更新

```typescript
// 移除错误的 mayor 角色类型
export type RoleType =
  | "villager"
  | "werewolf"
  | "seer"
  | "witch"
  | "hunter"
  | "guard"
  | "idiot"
  | "knight"
  | "dark_wolf_king"
  | "white_wolf_king"
  | "cupid"
  | "thief"; // 不包含 mayor

// 游戏状态中的警长字段
export interface Game {
  sheriff?: number; // 当前警长玩家ID
  sheriffBadgeDestroyed?: boolean; // 警徽是否被撕毁
  // ... 其他字段
}
```

### 核心功能函数

#### 1. 警长选举

```typescript
electSheriff: (playerId: number) => void
// 设置指定玩家为警长，记录当选日志
```

#### 2. 警徽移交

```typescript
transferSheriff: (newSheriffId: number) => void
// 将警徽移交给新玩家，记录移交日志
```

#### 3. 撕毁警徽

```typescript
destroySheriffBadge: () => void
// 销毁警长职务，标记警徽被撕毁
```

#### 4. 投票权重计算

```typescript
// 在 resolveDayVoting 中实现
const voteWeight = vote.voterId === currentGame.sheriff ? 1.5 : 1;
```

### 死亡检测

```typescript
// 在 setPlayerAlive 中检测警长死亡
const isSheriffDying = !isAlive && currentGame.sheriff === playerId;
if (isSheriffDying) {
  get().addActionLog(`警长 ${playerName} 死亡，请选择撕毁警徽或移交给其他玩家`);
}
```

## 🎮 游戏流程

### 警长选举流程

1. **第一回合白天**: 进入警长选举阶段
2. **上警竞选**: 玩家点击"上警"按钮竞选
3. **投票选举**: 全体玩家投票选择警长候选人
4. **当选公布**: 得票最多者当选警长

### 警长投票特权

1. **普通投票**: 警长投票权重为 1.5 票
2. **结果统计**: 正确计算和显示投票结果
3. **出局判定**: 按照加权票数确定出局者

### 警长死亡处理

1. **死亡检测**: 系统自动检测警长死亡
2. **选择提示**: 提醒选择移交或撕毁警徽
3. **执行操作**:
   - 移交: `transferSheriff(newPlayerId)`
   - 撕毁: `destroySheriffBadge()`

## 🔧 使用示例

### 警长当选

```typescript
// 玩家3当选警长
gameStore.electSheriff(3);
// 日志: "玩家3 当选警长"
```

### 投票权重

```typescript
// 普通玩家投票: 1票
// 警长投票: 1.5票
// 结果显示: "玩家5(2.5票) 玩家7(2票)"
```

### 警长死亡处理

```typescript
// 选择1: 移交警徽给玩家8
gameStore.transferSheriff(8);
// 日志: "玩家3 将警徽移交给 玩家8"

// 选择2: 撕毁警徽
gameStore.destroySheriffBadge();
// 日志: "玩家3 撕毁警徽，警长职位作废"
```

## 🎯 系统优势

1. **概念正确**: 警长是职务而非角色，符合狼人杀规则
2. **权重准确**: 1.5 票投票权重的精确计算和显示
3. **死亡处理**: 完整的警徽移交/撕毁机制
4. **日志完善**: 详细记录所有警长相关操作
5. **状态管理**: 正确维护警长状态和警徽销毁状态

现在警长系统已经完全符合狼人杀游戏规则，是一个职务系统而非角色系统！
