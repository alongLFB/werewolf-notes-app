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
  knight: {
    type: "knight",
    name: "骑士",
    description: "白天可以与玩家决斗：杀死狼人则狼人出局，杀死好人则自己死亡",
    camp: "villagers",
    color: "bg-indigo-600 text-white",
  },
  dark_wolf_king: {
    type: "dark_wolf_king",
    name: "黑狼王",
    description: "被投票出局时可以选择带走一个玩家",
    camp: "werewolves",
    color: "bg-gray-800 text-white",
  },
  white_wolf_king: {
    type: "white_wolf_king",
    name: "白狼王",
    description: "可以在白天自爆并带走一个玩家",
    camp: "werewolves",
    color: "bg-slate-600 text-white",
  },
};

// 预设游戏配置
export const ROLE_CONFIGS: RoleConfig[] = [
  {
    name: "9人暗牌场",
    description: "新手进阶挑战，9人纷争乱斗",
    roles_description: "3村民，3狼人，1预言家，1女巫，1猎人",
    playerCount: 9,
    roles: {
      villager: 3,
      werewolf: 3,
      seer: 1,
      witch: 1,
      hunter: 1,
    },
  },
  {
    name: "10人速推场",
    description: "通往强者的必经之路",
    roles_description: "4村民，3狼人，1预言家，1女巫，1猎人",
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
    name: "12人标准场",
    description: "强者的晋升之路",
    roles_description: "4村民，4狼人，1预言家，1女巫，1猎人，1白痴",
    playerCount: 12,
    roles: {
      villager: 4,
      werewolf: 4,
      seer: 1,
      witch: 1,
      hunter: 1,
      idiot: 1,
    },
  },
  {
    name: "12人狼王守卫",
    description: "狼王，扰乱好人视线的逻辑大神",
    roles_description: "4村民，3狼人，1黑狼王，1预言家，1女巫，1猎人，1守卫",
    playerCount: 12,
    roles: {
      villager: 4,
      werewolf: 3,
      dark_wolf_king: 1,
      seer: 1,
      witch: 1,
      hunter: 1,
      guard: 1,
    },
  },
  {
    name: "12人白狼王骑士",
    description: "光与暗的再次对决",
    roles_description: "4村民，3狼人，1白狼王，1预言家，1女巫，1守卫，1骑士",
    playerCount: 12,
    roles: {
      villager: 4,
      werewolf: 3,
      white_wolf_king: 1,
      seer: 1,
      witch: 1,
      guard: 1,
      knight: 1,
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
    knight: "⚔️",
    dark_wolf_king: "👑",
    white_wolf_king: "💀",
  };
  return icons[roleType] || "❓";
};
