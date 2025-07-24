// 游戏相关类型定义
export type RoleType =
  | "villager" // 村民
  | "werewolf" // 狼人
  | "seer" // 预言家
  | "witch" // 女巫
  | "hunter" // 猎人
  | "guard" // 守卫
  | "idiot" // 白痴
  | "cupid" // 丘比特
  | "thief" // 盗贼
  | "mayor"; // 村长

export type CampType = "villagers" | "werewolves" | "third_party";
export type GamePhase = "day" | "night";
export type GameStatus = "setup" | "ongoing" | "finished";
export type DeathReason =
  | "vote"
  | "werewolf_kill"
  | "witch_poison"
  | "hunter_revenge";

export interface Role {
  type: RoleType;
  name: string;
  description: string;
  camp: CampType;
  color: string;
}

export interface Player {
  id: number; // 座位号 1-12
  name?: string;
  role?: RoleType;
  isAlive: boolean;
  deathReason?: DeathReason;
  deathRound?: number;
  notes: string;
  tags: string[];
}

export interface Vote {
  voterId: number;
  targetId: number | "abstain"; // 支持弃票
  round: number;
}

export interface NightAction {
  actorId: number;
  targetId?: number;
  actionType:
    | "werewolf_kill"
    | "seer_check"
    | "witch_save"
    | "witch_poison"
    | "guard_protect";
  result?: string; // 对于预言家查验结果等
  description?: string; // 行动描述
}

export interface PoliceElection {
  candidates: number[]; // 上警的玩家ID
  sheriff?: number; // 当选警长的玩家ID
  votes: { [voterId: number]: number }; // 投票结果
}

export interface Round {
  number: number;
  phase: GamePhase;
  votes: Vote[];
  nightActions: NightAction[];
  policeElection?: PoliceElection;
  eliminated?: number; // 被淘汰的玩家座位号
  nightDeaths?: number[]; // 夜晚死亡的玩家
  discussionNotes?: string;
  actionLog: string[]; // 本回合操作日志
}

export interface Note {
  id: string;
  playerId?: number;
  content: string;
  tags: string[];
  timestamp: Date;
  round?: number;
}

export interface Game {
  id: string;
  name: string;
  playerCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: GameStatus;
  winner?: CampType;
  players: Player[];
  rounds: Round[];
  notes: Note[];
  currentRound: number;
  currentPhase: GamePhase;
  sheriff?: number; // 当前警长
  userRole: "god" | "player"; // 用户角色，决定日志查看权限
}

// 预设角色配置
export interface RoleConfig {
  name: string;
  description: string;
  roles: { [key in RoleType]?: number };
  playerCount: number;
}
