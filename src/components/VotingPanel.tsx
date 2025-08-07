import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Vote, Target, Users, CheckCircle, Bomb } from "lucide-react";

export const VotingPanel: React.FC = () => {
  const {
    currentGame,
    getAlivePlayers,
    addVote,
    eliminatePlayer,
    getCurrentRound,
    resolveDayVoting,
    isCurrentRoundResolved,
    explodeWerewolf,
  } = useGameStore();

  const [voterSelections, setVoterSelections] = useState<{
    [voterId: number]: number | "abstain" | null;
  }>({});

  if (!currentGame || currentGame.currentPhase !== "day") return null;

  const alivePlayers = getAlivePlayers();
  const currentRound = getCurrentRound();
  const votes = currentRound?.votes || [];
  const sheriff = currentGame.sheriff;

  // 统计投票结果
  const voteCount: { [key: string]: number } = {};
  const voterChoices: { [key: number]: number | "abstain" } = {};

  votes.forEach((vote) => {
    const voterId = vote.voterId;
    const voteWeight = sheriff === voterId ? 1.5 : 1;
    
    if (vote.targetId === "abstain") {
      voteCount["abstain"] = (voteCount["abstain"] || 0) + voteWeight;
    } else {
      const targetKey = vote.targetId.toString();
      voteCount[targetKey] = (voteCount[targetKey] || 0) + voteWeight;
    }
    voterChoices[voterId] = vote.targetId;
  });

  const handleVote = (voterId: number, targetId: number | "abstain") => {
    addVote(voterId, targetId);
    setVoterSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[voterId];
      return newSelections;
    });
  };

  const handleEliminate = (playerId: number) => {
    eliminatePlayer(playerId);
  };

  // 找出得票最多的玩家
  const maxVotes = Math.max(...Object.values(voteCount).filter(v => typeof v === 'number'), 0);
  const topCandidates = Object.entries(voteCount)
    .filter(([key, count]) => key !== "abstain" && count === maxVotes && maxVotes > 0)
    .map(([playerId]) => parseInt(playerId));

  // 检查是否所有人都已投票
  const isAllVoted = () => {
    return alivePlayers.every((player) => voterChoices.hasOwnProperty(player.id));
  };

  // 计算总票数（考虑警长权重）
  const getTotalPossibleVotes = () => {
    return alivePlayers.reduce((total, player) => {
      return total + (sheriff === player.id ? 1.5 : 1);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center space-x-2 text-gray-900">
          <Vote className="w-5 h-5 text-blue-500" />
          <span>白天投票</span>
        </h3>
        {isAllVoted() && !isCurrentRoundResolved() && (
          <button
            onClick={() => {
              if (confirm("确定要结算白天投票吗？这将统计投票结果并确定出局玩家。")) {
                resolveDayVoting();
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>结算投票</span>
          </button>
        )}
      </div>

      {/* 投票区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-blue-900">玩家投票</h4>
          {isCurrentRoundResolved() && (
            <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
              ✅ 已结算
            </span>
          )}
        </div>

        {/* 玩家投票列表 */}
        <div className="space-y-3">
          {alivePlayers.map((voter) => {
            const hasVoted = voterChoices.hasOwnProperty(voter.id);
            const votedFor = voterChoices[voter.id];
            const currentSelection = voterSelections[voter.id] || null;
            const isSheriff = sheriff === voter.id;

            let votedForName = null;
            if (votedFor === "abstain") {
              votedForName = "弃票";
            } else if (typeof votedFor === "number") {
              const target = alivePlayers.find((p) => p.id === votedFor);
              votedForName = target ? `${target.name || `玩家${target.id}`}` : null;
            }

            return (
              <div key={voter.id} className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {voter.name || `玩家${voter.id}`} ({voter.id}号)
                    </span>
                    {isSheriff && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                        警长 (1.5票)
                      </span>
                    )}
                    {hasVoted && (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
                        已投: {votedForName}
                      </span>
                    )}
                  </div>

                  {!hasVoted && !isCurrentRoundResolved() && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={currentSelection || ""}
                        onChange={(e) =>
                          setVoterSelections((prev) => ({
                            ...prev,
                            [voter.id]: e.target.value
                              ? e.target.value === "abstain"
                                ? "abstain"
                                : parseInt(e.target.value)
                              : null,
                          }))
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900 font-medium"
                      >
                        <option value="" className="text-gray-500">
                          选择投票目标
                        </option>
                        <option value="abstain" className="text-orange-600 font-medium">
                          弃票
                        </option>
                        {alivePlayers.map((target) => (
                          <option
                            key={target.id}
                            value={target.id}
                            className="text-gray-900 font-medium"
                          >
                            {target.name || `玩家${target.id}`} ({target.id}号)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (currentSelection) {
                            handleVote(voter.id, currentSelection);
                          }
                        }}
                        disabled={!currentSelection}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm px-3 py-1 rounded transition-colors duration-200"
                      >
                        投票
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 投票进度 */}
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">投票进度：</span>
            <span className="font-medium">
              {Object.keys(voterChoices).length} / {alivePlayers.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Object.keys(voterChoices).length / alivePlayers.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* 实时票数统计 */}
        {Object.keys(voterChoices).length > 0 && (
          <div className="bg-white rounded-lg p-3 border">
            <h5 className="text-sm font-medium text-gray-800 mb-3">
              当前票数统计：
            </h5>
            <div className="space-y-2">
              {Object.entries(voteCount)
                .filter(([key]) => key !== "abstain")
                .map(([playerId, count]) => {
                  const player = alivePlayers.find((p) => p.id === parseInt(playerId));
                  if (!player) return null;
                  const percentage = (count / getTotalPossibleVotes()) * 100;
                  const isTop = topCandidates.includes(parseInt(playerId));

                  return (
                    <div key={playerId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${isTop ? "text-red-700" : "text-gray-900"}`}>
                          {player.name || `玩家${playerId}`}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isTop ? "text-red-600" : "text-blue-600"}`}>
                            {count}票 ({percentage.toFixed(1)}%)
                          </span>
                          {isTop && isCurrentRoundResolved() && (
                            <button
                              onClick={() => handleEliminate(parseInt(playerId))}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors duration-200"
                            >
                              出局
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isTop ? "bg-red-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}

              {/* 弃票统计 */}
              {voteCount["abstain"] > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-orange-600">弃票</span>
                    <span className="font-bold text-orange-600">
                      {voteCount["abstain"]}票 (
                      {((voteCount["abstain"] / getTotalPossibleVotes()) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(voteCount["abstain"] / getTotalPossibleVotes()) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {topCandidates.length > 1 && maxVotes > 0 && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mt-3">
                <Target className="w-4 h-4 inline mr-2" />
                平票！需要重新投票或由法官/警长决定
              </div>
            )}
          </div>
        )}
      </div>

      {/* 狼人自爆区域 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-3 flex items-center space-x-2">
          <Bomb className="w-4 h-4" />
          <span>狼人自爆</span>
        </h4>
        <p className="text-sm text-red-700 mb-3">
          狼人可以选择自爆，自爆后将直接跳过当前白天，进入下一回合夜晚。
        </p>
        <div className="grid grid-cols-2 gap-2">
          {alivePlayers
            .filter(
              (player) =>
                player.role === "werewolf" ||
                player.role === "dark_wolf_king" ||
                player.role === "white_wolf_king"
            )
            .map((player) => (
              <button
                key={player.id}
                onClick={() => {
                  if (
                    confirm(
                      `确定让 ${player.name || `玩家${player.id}`} 自爆吗？自爆后将直接进入夜晚。`
                    )
                  ) {
                    explodeWerewolf(player.id);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Bomb className="w-3 h-3" />
                <span>
                  {player.name || `玩家${player.id}`} 自爆
                </span>
              </button>
            ))}
          {alivePlayers.filter(
            (player) =>
              player.role === "werewolf" ||
              player.role === "dark_wolf_king" ||
              player.role === "white_wolf_king"
          ).length === 0 && (
            <div className="col-span-2 text-center text-sm text-red-600">
              没有存活的狼人可以自爆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};