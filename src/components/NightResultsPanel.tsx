import React from "react";
import { useGameStore } from "@/store/gameStore";
import { Skull, Sun, Shield, CheckCircle } from "lucide-react";

export const NightResultsPanel: React.FC = () => {
  const {
    currentGame,
    isBadgeLost,
    announceFirstNightResults,
    getCurrentRound,
  } = useGameStore();

  if (!currentGame || currentGame.currentPhase !== "day") return null;

  const isPoliceDestroyed = isBadgeLost();
  const isFirstRound = currentGame.currentRound === 1;
  
  // 检查是否应该显示面板
  const shouldShowPanel = () => {
    if (isPoliceDestroyed) {
      // 狼人自爆情况：总是显示
      return true;
    }
    
    if (isFirstRound) {
      // 第一回合：警长竞选完成后显示
      const currentRound = getCurrentRound();
      const policeElection = currentRound?.policeElection;
      return policeElection?.isCompleted || currentGame.sheriff || policeElection?.badgeLost;
    }
    
    // 其他回合：直接显示前一晚死亡信息
    return true;
  };

  if (!shouldShowPanel()) return null;

  const handleAnnounceResults = () => {
    announceFirstNightResults();
  };

  const getNightDeathsToShow = () => {
    if (isPoliceDestroyed) {
      // 狼人自爆：显示当前回合的夜晚死亡信息
      const currentRound = getCurrentRound();
      return [{ 
        round: currentGame.currentRound, 
        deaths: currentRound?.nightDeaths || [] 
      }];
    }
    
    if (isFirstRound) {
      // 第一回合：显示第一晚的死亡信息
      const firstRound = currentGame.rounds.find(r => r.number === 1);
      return [{ 
        round: 1, 
        deaths: firstRound?.nightDeaths || [] 
      }];
    }
    
    // 其他回合：显示前一晚的死亡信息
    const previousRound = currentGame.rounds.find(r => r.number === currentGame.currentRound - 1);
    return [{ 
      round: currentGame.currentRound - 1, 
      deaths: previousRound?.nightDeaths || [] 
    }];
  };

  const nightDeaths = getNightDeathsToShow();

  return (
    <div className="space-y-6">
      {/* 状态说明 */}
      <div
        className={`p-4 rounded-lg ${
          isPoliceDestroyed
            ? "bg-red-50 border border-red-200"
            : isFirstRound
            ? "bg-blue-50 border border-blue-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {isPoliceDestroyed ? (
            <>
              <Skull className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">狼人自爆 - 警徽流失</span>
            </>
          ) : isFirstRound ? (
            <>
              <Sun className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">第一晚结果公布</span>
            </>
          ) : (
            <>
              <Skull className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">前一晚死亡信息</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-700">
          {isPoliceDestroyed
            ? `狼人自爆导致警徽流失，现在公布第${currentGame.currentRound}晚的死亡信息。`
            : isFirstRound
            ? "警长竞选完成后，现在公布第一晚的死亡结果。"
            : `现在公布第${currentGame.currentRound - 1}晚的死亡信息。`}
        </p>
      </div>

      {/* 死亡信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Skull className="w-5 h-5" />
          <span>夜晚死亡信息</span>
        </h3>

        {nightDeaths.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>今晚是平安夜，没有玩家死亡</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nightDeaths.map(({ round, deaths }) => (
              <div
                key={round}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-800 mb-3">
                  第{round}晚死亡信息
                </h4>
                {deaths.length === 0 ? (
                  <p className="text-gray-500">平安夜</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deaths.map((playerId) => {
                      const player = currentGame.players.find(
                        (p) => p.id === playerId
                      );
                      return (
                        <div
                          key={playerId}
                          className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg"
                        >
                          <Skull className="w-4 h-4 text-red-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {player?.name || `玩家${playerId}`}
                            </div>
                            <div className="text-sm text-gray-700">
                              死因：
                              {player?.deathReason === "werewolf_kill"
                                ? "狼人击杀"
                                : player?.deathReason === "witch_poison"
                                ? "女巫毒杀"
                                : "未知原因"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {!isPoliceDestroyed && isFirstRound && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <button
            onClick={handleAnnounceResults}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>确认公布结果，进入发言环节</span>
          </button>
          <p className="text-sm text-gray-600 mt-2 text-center">
            点击后将进入警长选择发言顺序环节
          </p>
        </div>
      )}

      {/* 狼人自爆的说明 */}
      {isPoliceDestroyed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">游戏流程调整</span>
          </div>
          <p className="text-sm text-yellow-700">
            由于狼人自爆，警徽流失，跳过发言环节，直接进入下一回合夜晚。
          </p>
        </div>
      )}

      {/* 其他回合的说明 */}
      {!isPoliceDestroyed && !isFirstRound && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sun className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">正常流程</span>
          </div>
          <p className="text-sm text-gray-700">
            死亡信息已公布，现在可以开始自由发言和投票环节。
          </p>
        </div>
      )}
    </div>
  );
};
