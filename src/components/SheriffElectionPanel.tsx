import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Crown, UserPlus, UserMinus, Vote } from "lucide-react";

export const SheriffElectionPanel: React.FC = () => {
  const {
    currentGame,
    getAlivePlayers,
    addPoliceCandidate,
    removePoliceCandidate,
    electSheriff,
  } = useGameStore();

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

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
          <h4 className="font-medium text-gray-800">上警候选人</h4>
          <div className="space-y-2">
            {candidates.map((playerId) => {
              const player = currentGame.players.find((p) => p.id === playerId);
              const isCurrentSheriff = currentGame.sheriff === playerId;

              return (
                <div
                  key={playerId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCurrentSheriff
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isCurrentSheriff && (
                      <Crown className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {player?.name || `玩家${playerId}`} ({playerId}号)
                    </span>
                    {player?.role && (
                      <span className="text-xs text-gray-600">
                        ({player.role})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCurrentSheriff && (
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
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
};
