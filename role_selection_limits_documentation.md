# 角色选择数量限制系统

## 🎯 功能概述

实现基于游戏配置的角色选择数量限制，确保玩家只能按照预设配置选择对应数量的角色。

## 🎮 系统特点

### 配置驱动

- 基于 `ROLE_CONFIGS` 中的角色配置自动限制选择
- 支持不同人数局的不同角色搭配
- 动态显示剩余可选数量

### 智能限制

- 实时计算已选择的角色数量
- 当达到上限时自动禁用对应角色选项
- 清晰的视觉反馈（灰色显示、禁用状态）

### 用户体验

- 显示每个角色的剩余可选数量
- 不同状态的颜色区分
- 防止超额选择的交互保护

## 💻 技术实现

### 类型定义扩展

#### Game 接口增强

```typescript
export interface Game {
  // ... 其他字段
  roleConfig?: { [key in RoleType]?: number }; // 角色配置数量限制
}
```

#### RoleSelector 组件属性

```typescript
interface RoleSelectorProps {
  selectedRole?: RoleType;
  onRoleSelect: (role: RoleType) => void;
  availableRoles?: RoleType[];
  className?: string;
  roleConfig?: { [key in RoleType]?: number }; // 角色配置数量
  selectedRoleCounts?: { [key in RoleType]?: number }; // 已选择的角色数量
}
```

### 核心功能函数

#### 1. 创建游戏时保存配置

```typescript
createGame: (name: string, playerCount: number, roleConfig?: { [key in RoleType]?: number }) => void

// 使用示例
const config = ROLE_CONFIGS[selectedConfig];
createGame(gameName.trim(), config.playerCount, config.roles);
```

#### 2. 角色计数统计

```typescript
getSelectedRoleCounts: () => { [key in RoleType]?: number }

// 实现逻辑
const roleCounts: { [key in RoleType]?: number } = {};
currentGame.players.forEach((player) => {
  if (player.role) {
    roleCounts[player.role] = (roleCounts[player.role] || 0) + 1;
  }
});
```

#### 3. 角色可用性检查

```typescript
const isRoleAvailable = (roleType: RoleType): boolean => {
  if (!roleConfig) return true;

  const maxCount = roleConfig[roleType] || 0;
  const currentCount = selectedRoleCounts[roleType] || 0;

  return currentCount < maxCount;
};
```

#### 4. 剩余数量计算

```typescript
const getRemainingCount = (roleType: RoleType): number => {
  if (!roleConfig) return 999;

  const maxCount = roleConfig[roleType] || 0;
  const currentCount = selectedRoleCounts[roleType] || 0;

  return Math.max(0, maxCount - currentCount);
};
```

### UI 状态设计

#### 角色按钮状态

```typescript
const isDisabled = !isRoleAvailable(roleType);

// 样式类名
className={`
  ${isSelected ? role.color :
    isDisabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" :
    "bg-white border-gray-300 hover:border-gray-400 text-gray-900"
  }
`}
```

#### 剩余数量显示

```typescript
{
  roleConfig && (
    <div
      className={`text-xs font-medium ${
        isSelected
          ? "text-white"
          : isDisabled
          ? "text-gray-400"
          : remainingCount === 0
          ? "text-red-500"
          : "text-blue-600"
      }`}
    >
      剩余: {remainingCount}
    </div>
  );
}
```

## 📊 配置示例

### 9 人暗牌场配置

```typescript
{
  name: "9人暗牌场",
  playerCount: 9,
  roles: {
    villager: 3,     // 最多选3个村民
    werewolf: 3,     // 最多选3个狼人
    seer: 1,         // 最多选1个预言家
    witch: 1,        // 最多选1个女巫
    hunter: 1,       // 最多选1个猎人
  },
}
```

### 实际选择限制效果

- **村民**: 最多可选 3 人，选满后按钮变灰禁用
- **狼人**: 最多可选 3 人，显示"剩余: X"
- **预言家**: 最多可选 1 人，选择后立即禁用
- **其他角色**: 未在配置中的角色无法选择

## 🔧 使用流程

### 1. 创建游戏

1. 选择游戏配置（如"9 人暗牌场"）
2. 系统自动保存角色数量限制到游戏状态
3. 进入角色分配阶段

### 2. 分配角色

1. 点击玩家头像进入角色选择
2. 系统显示所有角色，但根据配置限制可选性
3. 实时显示每个角色的剩余可选数量
4. 达到上限的角色自动变灰禁用

### 3. 视觉反馈

- **可选状态**: 正常颜色，显示剩余数量
- **已满状态**: 灰色禁用，显示"剩余: 0"
- **当前选中**: 角色主题色高亮显示

## 🎯 系统优势

### 1. 防误操作

- 严格按照配置限制角色选择
- 避免配置错误导致游戏平衡问题
- 清晰的视觉状态提示

### 2. 配置灵活

- 支持多种预设配置
- 不同人数局的不同角色搭配
- 可扩展支持自定义配置

### 3. 用户友好

- 实时反馈剩余可选数量
- 直观的禁用状态显示
- 防止超额选择的交互保护

### 4. 数据一致性

- 实时计算确保数据准确
- 配置与实际选择严格对应
- 状态管理集中统一

现在角色选择系统完全按照配置文件的数量限制工作，确保游戏配置的准确性和一致性！
