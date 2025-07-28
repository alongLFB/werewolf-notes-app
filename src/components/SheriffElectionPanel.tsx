import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  Crown,
  UserPlus,
  UserMinus,
  Vote,
  Bomb,
  CheckCircle,
  Users,
} from "lucide-react";

export const SheriffElectionPanel: React.FC = () => {
  const {
    currentGame,
    getAlivePlayers,
    addPoliceCandidate,
    removePoliceCandidate,
    electSheriff,
    completeSheriffElection,
    addSheriffVote,
    startSheriffVoting,
    processSheriffVoteResults,
    explodeWerewolf,
  } = useGameStore();

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);

  if (!currentGame || currentGame.currentPhase !== "day") return null;

  const alivePlayers = getAlivePlayers();
  const currentRound = currentGame.rounds.find(
    (r) => r.number === currentGame.currentRound
  );
  const policeElection = currentRound?.policeElection;
  const candidates = policeElection?.candidates || [];

  const handleTogglePlayer = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleAddCandidates = () => {
    if (selectedPlayers.length === 0) return;

    selectedPlayers.forEach((playerId) => {
      if (!candidates.includes(playerId)) {
        addPoliceCandidate(playerId);
      }
    });
    setSelectedPlayers([]);
  };

  const handleRemoveCandidate = (playerId: number) => {
    removePoliceCandidate(playerId);
  };

  const handleElectSheriff = (playerId: number) => {
    electSheriff(playerId);
  };

  const handleStartVoting = () => {
    startSheriffVoting();
  };

  const handleVoteForSheriff = (voterId: number, candidateId: number) => {
    addSheriffVote(voterId, candidateId);
    setSelectedVote(null);
  };

  const handleProcessVoteResults = () => {
    processSheriffVoteResults();
  };

  const handleWerewolfExplosion = (playerId: number) => {
    if (
      confirm(`确认玩家${playerId}狼人自爆？自爆后将直接进入下一回合夜晚。`)
    ) {
      explodeWerewolf(playerId);
    }
  };

  // 获取可以投票的玩家（活着的非上警玩家，且未退警）
  const getEligibleVoters = () => {
    if (!policeElection) return [];
    return alivePlayers.filter(
      (player) =>
        !policeElection.candidates.includes(player.id) &&
        !policeElection.withdrawnCandidates.includes(player.id)
    );
  };

  // 获取有效候选人（上警且未退警）
  const getValidCandidates = () => {
    if (!policeElection) return [];
    return policeElection.candidates.filter(
      (candidateId) => !policeElection.withdrawnCandidates.includes(candidateId)
    );
  };

  // 检查是否所有有效投票者都已投票
  const isAllVoted = () => {
    if (!policeElection?.isVotingPhase) return false;
    const eligibleVoters = getEligibleVoters();
    const votedPlayers = Object.keys(policeElection.votes).map((id) =>
      parseInt(id)
    );
    return eligibleVoters.every((voter) => votedPlayers.includes(voter.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">警长选举</h3>
      </div>

      {/* 当前警长显示 */}
      {currentGame.sheriff && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              当前警长：
              {currentGame.players.find((p) => p.id === currentGame.sheriff)
                ?.name || `玩家${currentGame.sheriff}`}
            </span>
          </div>
        </div>
      )}

      {/* 添加候选人 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            选择上警候选人（可多选）
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {alivePlayers
              .filter((player) => !candidates.includes(player.id))
              .map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleTogglePlayer(player.id)}
                  className={`p-2 border rounded-lg text-sm transition-colors duration-200 ${
                    selectedPlayers.includes(player.id)
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {player.name || `玩家${player.id}`} ({player.id}号)
                </button>
              ))}
          </div>
          <button
            onClick={handleAddCandidates}
            disabled={selectedPlayers.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>批量上警 ({selectedPlayers.length}人)</span>
          </button>
        </div>
      </div>

      {/* 候选人列表 */}
      {candidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">上警候选人</h4>
            {policeElection &&
              !policeElection.isVotingPhase &&
              !policeElection.isCompleted &&
              getValidCandidates().length >= 2 && (
                <button
                  onClick={handleStartVoting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
                >
                  <Users className="w-3 h-3" />
                  <span>开始投票</span>
                </button>
              )}
          </div>
          <div className="space-y-2">
            {candidates.map((playerId) => {
              const player = currentGame.players.find((p) => p.id === playerId);
              const isCurrentSheriff = currentGame.sheriff === playerId;
              const isWithdrawn =
                policeElection?.withdrawnCandidates.includes(playerId);

              return (
                <div
                  key={playerId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCurrentSheriff
                      ? "bg-yellow-50 border-yellow-300"
                      : isWithdrawn
                      ? "bg-red-50 border-red-300"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isCurrentSheriff && (
                      <Crown className="w-4 h-4 text-yellow-600" />
                    )}
                    <span
                      className={`font-medium ${
                        isWithdrawn
                          ? "text-red-600 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {player?.name || `玩家${playerId}`} ({playerId}号)
                    </span>
                    {player?.role && (
                      <span className="text-xs text-gray-600">
                        ({player.role})
                      </span>
                    )}
                    {isWithdrawn && (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                        已退警
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCurrentSheriff &&
                      !isWithdrawn &&
                      !policeElection?.isVotingPhase && (
                        <>
                          <button
                            onClick={() => handleElectSheriff(playerId)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
                          >
                            <Vote className="w-3 h-3" />
                            <span>当选</span>
                          </button>
                          <button
                            onClick={() => handleRemoveCandidate(playerId)}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
                          >
                            <UserMinus className="w-3 h-3" />
                            <span>退警</span>
                          </button>
                        </>
                      )}
                    {!isCurrentSheriff &&
                      !isWithdrawn &&
                      policeElection?.isVotingPhase && (
                        <button
                          onClick={() => handleRemoveCandidate(playerId)}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
                        >
                          <UserMinus className="w-3 h-3" />
                          <span>退警</span>
                        </button>
                      )}
                    {/* 狼人自爆按钮 */}
                    {player?.role === "werewolf" && player.isAlive && (
                      <button
                        onClick={() => handleWerewolfExplosion(playerId)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Bomb className="w-3 h-3" />
                        <span>自爆</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 投票区域 */}
      {policeElection?.isVotingPhase && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-900">
              警长竞选投票 - 第{policeElection.votingRound}轮
            </h4>
            {isAllVoted() && (
              <button
                onClick={handleProcessVoteResults}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>统计结果</span>
              </button>
            )}
          </div>

          {/* 可投票玩家列表 */}
          <div className="space-y-3">
            <p className="text-sm text-blue-800">请各位非上警玩家投票：</p>
            {getEligibleVoters().map((voter) => {
              const hasVoted = policeElection.votes.hasOwnProperty(voter.id);
              const votedFor = hasVoted ? policeElection.votes[voter.id] : null;
              const votedForName = votedFor
                ? currentGame.players.find((p) => p.id === votedFor)?.name ||
                  `玩家${votedFor}`
                : null;

              return (
                <div key={voter.id} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {voter.name || `玩家${voter.id}`} ({voter.id}号)
                      </span>
                      {hasVoted && (
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          已投: {votedForName}
                        </span>
                      )}
                    </div>

                    {!hasVoted && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedVote || ""}
                          onChange={(e) =>
                            setSelectedVote(parseInt(e.target.value))
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">选择候选人</option>
                          {getValidCandidates().map((candidateId) => {
                            const candidate = currentGame.players.find(
                              (p) => p.id === candidateId
                            );
                            return (
                              <option key={candidateId} value={candidateId}>
                                {candidate?.name || `玩家${candidateId}`} (
                                {candidateId}号)
                              </option>
                            );
                          })}
                        </select>
                        <button
                          onClick={() =>
                            selectedVote &&
                            handleVoteForSheriff(voter.id, selectedVote)
                          }
                          disabled={!selectedVote}
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
                {Object.keys(policeElection.votes).length} /{" "}
                {getEligibleVoters().length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (Object.keys(policeElection.votes).length /
                      getEligibleVoters().length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* 当前投票情况统计 */}
          {Object.keys(policeElection.votes).length > 0 && (
            <div className="bg-white rounded-lg p-3 border">
              <h5 className="text-sm font-medium text-gray-800 mb-2">
                当前票数统计：
              </h5>
              <div className="space-y-1">
                {getValidCandidates().map((candidateId) => {
                  const candidate = currentGame.players.find(
                    (p) => p.id === candidateId
                  );
                  const voteCount = Object.values(policeElection.votes).filter(
                    (v) => v === candidateId
                  ).length;
                  return (
                    <div
                      key={candidateId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{candidate?.name || `玩家${candidateId}`}</span>
                      <span className="font-medium">{voteCount}票</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 警长职责说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">警长职责：</div>
          <ul className="text-xs space-y-1">
            <li>• 拥有1.5票投票权</li>
            <li>• 可以决定平票时的去留</li>
            <li>• 死亡时可以移交警徽</li>
            <li>• 可以安排发言顺序</li>
          </ul>
        </div>
      </div>

      {/* 完成警长竞选 */}
      {(currentGame.sheriff ||
        policeElection?.badgeLost ||
        policeElection?.isCompleted ||
        (candidates.length === 0 && !policeElection?.isVotingPhase)) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <button
            onClick={() => {
              completeSheriffElection();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>完成警长竞选</span>
          </button>
          <p className="text-sm text-green-700 mt-2 text-center">
            {currentGame.sheriff
              ? "警长已产生，点击完成竞选进入下一环节"
              : policeElection?.badgeLost
              ? "警徽流失，点击完成竞选进入下一环节"
              : "无人上警，点击完成竞选进入下一环节"}
          </p>
        </div>
      )}

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
            .filter((player) => player.role === "werewolf")
            .map((player) => (
              <button
                key={player.id}
                onClick={() => handleWerewolfExplosion(player.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Bomb className="w-3 h-3" />
                <span>{player.name || `玩家${player.id}`} 自爆</span>
              </button>
            ))}
          {alivePlayers.filter((player) => player.role === "werewolf")
            .length === 0 && (
            <div className="col-span-2 text-center text-sm text-red-600">
              没有存活的狼人可以自爆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
