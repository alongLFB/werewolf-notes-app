import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Vote, Target, Users } from "lucide-react";

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

  const [selectedVoter, setSelectedVoter] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<
    number | "abstain" | null
  >(null);
  const [showResults, setShowResults] = useState(false);

  if (!currentGame || currentGame.currentPhase !== "day") return null;

  const alivePlayers = getAlivePlayers();
  const currentRound = getCurrentRound();
  const votes = currentRound?.votes || [];

  // 统计投票结果
  const voteCount: { [key: number]: number } = {};
  const abstainCount = { abstain: 0 };
  const voterChoices: { [key: number]: number | "abstain" } = {};

  votes.forEach((vote) => {
    if (vote.targetId === "abstain") {
      abstainCount.abstain += 1;
    } else {
      voteCount[vote.targetId as number] =
        (voteCount[vote.targetId as number] || 0) + 1;
    }
    voterChoices[vote.voterId] = vote.targetId;
  });

  const handleVote = () => {
    if (selectedVoter && selectedTarget) {
      addVote(selectedVoter, selectedTarget);
      setSelectedVoter(null);
      setSelectedTarget(null);
    }
  };

  const handleEliminate = (playerId: number) => {
    eliminatePlayer(playerId);
    setShowResults(false);
  };

  // 找出得票最多的玩家
  const maxVotes = Math.max(...Object.values(voteCount), 0);
  const topCandidates = Object.entries(voteCount)
    .filter(([, count]) => count === maxVotes && maxVotes > 0)
    .map(([playerId]) => parseInt(playerId));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center space-x-2 text-gray-900">
          <Vote className="w-5 h-5 text-blue-500" />
          <span>投票记录</span>
        </h3>
        <button
          onClick={() => setShowResults(!showResults)}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg transition-colors duration-200 text-gray-900 font-medium"
        >
          {showResults ? "隐藏结果" : "显示结果"}
        </button>
      </div>

      {/* 投票记录表单 */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 投票者选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              投票者
            </label>
            <select
              value={selectedVoter || ""}
              onChange={(e) =>
                setSelectedVoter(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择投票者</option>
              {alivePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name || `玩家${player.id}`} ({player.id}号)
                </option>
              ))}
            </select>
          </div>

          {/* 投票目标选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              投票目标
            </label>
            <select
              value={selectedTarget || ""}
              onChange={(e) =>
                setSelectedTarget(
                  e.target.value === ""
                    ? null
                    : e.target.value === "abstain"
                    ? "abstain"
                    : parseInt(e.target.value)
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择投票目标</option>
              {alivePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name || `玩家${player.id}`} ({player.id}号)
                </option>
              ))}
              <option value="abstain">弃票</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={!selectedVoter || !selectedTarget}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          记录投票
        </button>

        {/* 白天结算按钮 */}
        <button
          onClick={() => {
            if (
              confirm("确定要结算白天投票吗？这将统计投票结果并确定出局玩家。")
            ) {
              resolveDayVoting();
            }
          }}
          disabled={votes.length === 0 || isCurrentRoundResolved()}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>
            {isCurrentRoundResolved() ? "白天已结算" : "结算白天投票"}
          </span>
        </button>
      </div>

      {/* 狼人自爆 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">狼人自爆</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              选择自爆的狼人
            </label>
            <select
              onChange={(e) => {
                const playerId = parseInt(e.target.value);
                if (
                  playerId &&
                  confirm(
                    `确定让 ${
                      alivePlayers.find((p) => p.id === playerId)?.name ||
                      `玩家${playerId}`
                    } 自爆吗？自爆后将影响警长竞选规则。`
                  )
                ) {
                  explodeWerewolf(playerId);
                }
                e.target.value = ""; // 重置选择
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择要自爆的狼人...</option>
              {alivePlayers
                .filter(
                  (p) =>
                    p.role === "werewolf" ||
                    p.role === "dark_wolf_king" ||
                    p.role === "white_wolf_king"
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name || `玩家${player.id}`} (
                    {player.role === "werewolf"
                      ? "狼人"
                      : player.role === "dark_wolf_king"
                      ? "黑狼王"
                      : "白狼王"}
                    )
                  </option>
                ))}
            </select>
          </div>
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            ⚠️ 狼人自爆会影响后续的警长竞选规则，请谨慎操作
          </div>
        </div>
      </div>

      {/* 当前投票状态 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">当前投票状态</h4>
        <div className="grid grid-cols-1 gap-2">
          {alivePlayers.map((player) => {
            const votedFor = voterChoices[player.id];
            let displayText = "未投票";

            if (votedFor === "abstain") {
              displayText = "弃票";
            } else if (typeof votedFor === "number") {
              const targetPlayer = alivePlayers.find((p) => p.id === votedFor);
              displayText = targetPlayer
                ? `→ ${targetPlayer.name || `玩家${targetPlayer.id}`}`
                : "未投票";
            }

            return (
              <div
                key={player.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-100 border border-gray-200 rounded"
              >
                <span className="font-medium text-gray-900">
                  {player.name || `玩家${player.id}`}
                </span>
                <span className="text-sm text-gray-700 font-medium">
                  {displayText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 投票结果统计 */}
      {showResults && votes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">投票结果统计</h4>
          <div className="space-y-2">
            {Object.entries(voteCount)
              .sort(([, a], [, b]) => b - a)
              .map(([playerId, count]) => {
                const player = alivePlayers.find(
                  (p) => p.id === parseInt(playerId)
                );
                if (!player) return null;

                const isTopCandidate = topCandidates.includes(
                  parseInt(playerId)
                );

                return (
                  <div
                    key={playerId}
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      isTopCandidate
                        ? "bg-red-100 border border-red-300"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isTopCandidate ? "text-red-900" : "text-gray-900"
                      }`}
                    >
                      {player.name || `玩家${player.id}`}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-bold ${
                          isTopCandidate ? "text-red-700" : "text-gray-700"
                        }`}
                      >
                        {count} 票
                      </span>
                      {isTopCandidate && maxVotes > 0 && (
                        <button
                          onClick={() => handleEliminate(parseInt(playerId))}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200 font-medium"
                        >
                          出局
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* 显示弃票统计 */}
            {abstainCount.abstain > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-yellow-100 border border-yellow-300 rounded">
                <span className="font-medium text-yellow-900">弃票</span>
                <span className="font-bold text-yellow-700">
                  {abstainCount.abstain} 票
                </span>
              </div>
            )}
          </div>

          {topCandidates.length > 1 && maxVotes > 0 && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              <Target className="w-4 h-4 inline mr-2" />
              平票！需要重新投票或由法官决定
            </div>
          )}
        </div>
      )}

      {/* 投票统计信息 */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Users className="w-4 h-4 inline mr-2" />
        已投票: {Object.keys(voterChoices).length} / {alivePlayers.length}
      </div>
    </div>
  );
};
