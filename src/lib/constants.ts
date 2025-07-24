import { Role, RoleType, RoleConfig } from "@/types/game";

// 角色定义
export const ROLES: Record<RoleType, Role> = {
  villager: {
    type: "villager",
    name: "村民",
    description: "普通村民，白天可以投票",
    camp: "villagers",
    color: "bg-green-600 text-white",
  },
  werewolf: {
    type: "werewolf",
    name: "狼人",
    description: "夜晚可以击杀村民",
    camp: "werewolves",
    color: "bg-red-600 text-white",
  },
  seer: {
    type: "seer",
    name: "预言家",
    description: "夜晚可以查验一个玩家的身份",
    camp: "villagers",
    color: "bg-blue-600 text-white",
  },
  witch: {
    type: "witch",
    name: "女巫",
    description: "拥有解药和毒药各一瓶",
    camp: "villagers",
    color: "bg-purple-600 text-white",
  },
  hunter: {
    type: "hunter",
    name: "猎人",
    description: "死亡时可以开枪带走一个玩家",
    camp: "villagers",
    color: "bg-orange-600 text-white",
  },
  guard: {
    type: "guard",
    name: "守卫",
    description: "夜晚可以保护一个玩家",
    camp: "villagers",
    color: "bg-cyan-600 text-white",
  },
  idiot: {
    type: "idiot",
    name: "白痴",
    description: "被投票时翻牌，不死且失去投票权",
    camp: "villagers",
    color: "bg-yellow-600 text-white",
  },
  cupid: {
    type: "cupid",
    name: "丘比特",
    description: "第一夜指定两个玩家为情侣",
    camp: "third_party",
    color: "bg-pink-600 text-white",
  },
  thief: {
    type: "thief",
    name: "盗贼",
    description: "第一夜可以选择身份",
    camp: "third_party",
    color: "bg-gray-700 text-white",
  },
  mayor: {
    type: "mayor",
    name: "村长",
    description: "投票时算1.5票",
    camp: "villagers",
    color: "bg-indigo-600 text-white",
  },
};

// 预设游戏配置
export const ROLE_CONFIGS: RoleConfig[] = [
  {
    name: "6人局标准",
    description: "适合新手的6人局",
    playerCount: 6,
    roles: {
      villager: 2,
      werewolf: 2,
      seer: 1,
      witch: 1,
    },
  },
  {
    name: "8人局标准",
    description: "经典8人局配置",
    playerCount: 8,
    roles: {
      villager: 3,
      werewolf: 3,
      seer: 1,
      witch: 1,
    },
  },
  {
    name: "9人局进阶",
    description: "包含守卫的9人局",
    playerCount: 9,
    roles: {
      villager: 3,
      werewolf: 3,
      seer: 1,
      witch: 1,
      guard: 1,
    },
  },
  {
    name: "10人局标准",
    description: "经典10人局配置",
    playerCount: 10,
    roles: {
      villager: 4,
      werewolf: 3,
      seer: 1,
      witch: 1,
      hunter: 1,
    },
  },
  {
    name: "12人局进阶",
    description: "完整的12人局配置",
    playerCount: 12,
    roles: {
      villager: 4,
      werewolf: 4,
      seer: 1,
      witch: 1,
      hunter: 1,
      guard: 1,
    },
  },
];

// 获取阵营颜色
export const getCampColor = (camp: string): string => {
  switch (camp) {
    case "villagers":
      return "text-green-800 bg-green-100 border-green-300";
    case "werewolves":
      return "text-red-800 bg-red-100 border-red-300";
    case "third_party":
      return "text-purple-800 bg-purple-100 border-purple-300";
    default:
      return "text-gray-800 bg-gray-100 border-gray-300";
  }
};

// 获取角色图标
export const getRoleIcon = (roleType: RoleType): string => {
  const icons = {
    villager: "👨‍🌾",
    werewolf: "🐺",
    seer: "👁️",
    witch: "🧙‍♀️",
    hunter: "🏹",
    guard: "🛡️",
    idiot: "🤡",
    cupid: "💘",
    thief: "🕵️",
    mayor: "👑",
  };
  return icons[roleType] || "❓";
};
