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
    addActionLog,
  } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  if (!currentGame || currentGame.currentPhase !== "day") return null;

  const alivePlayers = getAlivePlayers();
  const currentRound = currentGame.rounds.find(
    (r) => r.number === currentGame.currentRound
  );
  const policeElection = currentRound?.policeElection;
  const candidates = policeElection?.candidates || [];

  const handleAddCandidate = () => {
    if (!selectedPlayer) return;

    addPoliceCandidate(selectedPlayer);
    const playerName =
      currentGame.players.find((p) => p.id === selectedPlayer)?.name ||
      `玩家${selectedPlayer}`;
    addActionLog(`${playerName}上警竞选警长`);
    setSelectedPlayer(null);
  };

  const handleRemoveCandidate = (playerId: number) => {
    removePoliceCandidate(playerId);
    const playerName =
      currentGame.players.find((p) => p.id === playerId)?.name ||
      `玩家${playerId}`;
    addActionLog(`${playerName}退出警长竞选`);
  };

  const handleElectSheriff = (playerId: number) => {
    electSheriff(playerId);
    const playerName =
      currentGame.players.find((p) => p.id === playerId)?.name ||
      `玩家${playerId}`;
    addActionLog(`${playerName}当选警长`);
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
            添加上警候选人
          </label>
          <div className="flex space-x-3">
            <select
              value={selectedPlayer || ""}
              onChange={(e) =>
                setSelectedPlayer(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择玩家</option>
              {alivePlayers
                .filter((player) => !candidates.includes(player.id))
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name || `玩家${player.id}`} ({player.id}号)
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddCandidate}
              disabled={!selectedPlayer}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>上警</span>
            </button>
          </div>
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
