import React from "react";
import { Game, Player, Vote } from "@/types/game";
import { ROLES, getRoleIcon } from "@/lib/constants";
import { Trophy, Users, Vote as VoteIcon, Shield, Skull, ChevronDown, ChevronUp } from "lucide-react";

interface GameSummaryProps {
  game: Game;
  onClose: () => void;
}

export const GameSummary: React.FC<GameSummaryProps> = ({ game, onClose }) => {
  const [expandedPlayer, setExpandedPlayer] = React.useState<number | null>(null);

  // 获取阵营名称
  const getCampName = (camp?: string) => {
    switch (camp) {
      case "villagers":
        return "好人阵营";
      case "werewolves":
        return "狼人阵营";
      case "third_party":
        return "第三方";
      default:
        return "未知";
    }
  };

  // 获取死亡原因文本
  const getDeathReasonText = (reason?: string) => {
    const reasonMap: { [key: string]: string } = {
      vote: "投票出局",
      werewolf_kill: "狼人击杀",
      witch_poison: "女巫毒死",
      hunter_revenge: "猎人带走",
      knight_duel: "骑士决斗",
      dark_wolf_king_revenge: "黑狼王复仇",
      white_wolf_king_explosion: "白狼王自爆",
      werewolf_explosion: "狼人自爆",
    };
    return reasonMap[reason || ""] || reason || "未知";
  };

  // 获取玩家的所有投票记录
  const getPlayerVotes = (playerId: number): Vote[] => {
    const votes: Vote[] = [];
    game.rounds.forEach((round) => {
      const playerVotes = round.votes.filter(v => v.voterId === playerId);
      votes.push(...playerVotes);
    });
    return votes;
  };

  // 获取玩家被投票的次数
  const getVotesReceived = (playerId: number): number => {
    let count = 0;
    game.rounds.forEach((round) => {
      count += round.votes.filter(v => v.targetId === playerId).length;
    });
    return count;
  };

  // 按阵营分组玩家
  const playersByCamp = {
    villagers: game.players.filter(p => {
      const role = p.role ? ROLES[p.role] : null;
      return role?.camp === "villagers";
    }),
    werewolves: game.players.filter(p => {
      const role = p.role ? ROLES[p.role] : null;
      return role?.camp === "werewolves";
    }),
    unknown: game.players.filter(p => !p.role)
  };

  const winnerCamp = game.winner ? getCampName(game.winner) : "游戏未结束";
  const winnerColor = game.winner === "werewolves" ? "text-red-600" : "text-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">游戏总结</h2>
                <p className="text-sm opacity-90">{game.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>

        {/* 游戏结果 */}
        <div className="bg-gray-50 p-6 border-b">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">获胜阵营</div>
            <div className={`text-3xl font-bold ${winnerColor}`}>
              {winnerCamp}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              游戏进行了 {game.currentRound} 回合
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 好人阵营 */}
          {playersByCamp.villagers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">好人阵营</h3>
                <span className="text-sm text-gray-500">
                  ({playersByCamp.villagers.length}人)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playersByCamp.villagers.map((player) => (
                  <PlayerSummaryCard
                    key={player.id}
                    player={player}
                    game={game}
                    expanded={expandedPlayer === player.id}
                    onToggle={() => setExpandedPlayer(
                      expandedPlayer === player.id ? null : player.id
                    )}
                    getPlayerVotes={getPlayerVotes}
                    getVotesReceived={getVotesReceived}
                    getDeathReasonText={getDeathReasonText}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 狼人阵营 */}
          {playersByCamp.werewolves.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">狼人阵营</h3>
                <span className="text-sm text-gray-500">
                  ({playersByCamp.werewolves.length}人)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playersByCamp.werewolves.map((player) => (
                  <PlayerSummaryCard
                    key={player.id}
                    player={player}
                    game={game}
                    expanded={expandedPlayer === player.id}
                    onToggle={() => setExpandedPlayer(
                      expandedPlayer === player.id ? null : player.id
                    )}
                    getPlayerVotes={getPlayerVotes}
                    getVotesReceived={getVotesReceived}
                    getDeathReasonText={getDeathReasonText}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 未分配身份 */}
          {playersByCamp.unknown.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">未分配身份</h3>
                <span className="text-sm text-gray-500">
                  ({playersByCamp.unknown.length}人)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playersByCamp.unknown.map((player) => (
                  <PlayerSummaryCard
                    key={player.id}
                    player={player}
                    game={game}
                    expanded={expandedPlayer === player.id}
                    onToggle={() => setExpandedPlayer(
                      expandedPlayer === player.id ? null : player.id
                    )}
                    getPlayerVotes={getPlayerVotes}
                    getVotesReceived={getVotesReceived}
                    getDeathReasonText={getDeathReasonText}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 玩家卡片组件
interface PlayerSummaryCardProps {
  player: Player;
  game: Game;
  expanded: boolean;
  onToggle: () => void;
  getPlayerVotes: (playerId: number) => Vote[];
  getVotesReceived: (playerId: number) => number;
  getDeathReasonText: (reason?: string) => string;
}

const PlayerSummaryCard: React.FC<PlayerSummaryCardProps> = ({
  player,
  game,
  expanded,
  onToggle,
  getPlayerVotes,
  getVotesReceived,
  getDeathReasonText,
}) => {
  const role = player.role ? ROLES[player.role] : null;
  const votes = getPlayerVotes(player.id);
  const votesReceived = getVotesReceived(player.id);
  const isSheriff = game.sheriff === player.id;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        player.isAlive
          ? "bg-white border-gray-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 玩家基本信息 */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-2xl">{role ? getRoleIcon(role.type) : "❓"}</div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">
                  {player.name || `玩家${player.id}`}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {player.id}号
                </span>
                {isSheriff && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    警长
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {role?.name || "未知身份"}
              </div>
            </div>
          </div>

          {/* 状态信息 */}
          <div className="flex items-center space-x-4 text-sm">
            {!player.isAlive && (
              <div className="flex items-center text-red-600">
                <Skull className="w-4 h-4 mr-1" />
                <span>
                  {getDeathReasonText(player.deathReason)}
                  {player.deathRound && ` (第${player.deathRound}回合)`}
                </span>
              </div>
            )}
            {player.isAlive && (
              <span className="text-green-600 font-medium">存活</span>
            )}
          </div>

          {/* 统计信息 */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <VoteIcon className="w-3 h-3 mr-1" />
              <span>投票 {votes.length} 次</span>
            </div>
            <div>被投 {votesReceived} 票</div>
          </div>
        </div>

        {/* 展开/收起按钮 */}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* 展开的投票记录 */}
      {expanded && votes.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">投票记录：</div>
          <div className="space-y-1">
            {votes.map((vote, index) => {
              const targetName = vote.targetId === "abstain" 
                ? "弃票"
                : game.players.find(p => p.id === vote.targetId)?.name || `玩家${vote.targetId}`;
              return (
                <div key={index} className="text-xs text-gray-600">
                  第{vote.round}回合: 投给 {targetName}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};