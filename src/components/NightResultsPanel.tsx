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

  const handleAnnounceResults = () => {
    announceFirstNightResults();
  };

  const getCurrentNightDeaths = () => {
    const currentRound = getCurrentRound();
    return currentRound?.nightDeaths || [];
  };

  const getAllNightDeaths = () => {
    // 警徽流失状态需要公布所有夜晚的死亡信息
    const allDeaths: { round: number; deaths: number[] }[] = [];

    for (let i = 1; i <= currentGame.currentRound; i++) {
      const round = currentGame.rounds.find((r) => r.number === i);
      if (round && round.nightDeaths && round.nightDeaths.length > 0) {
        allDeaths.push({
          round: i,
          deaths: round.nightDeaths,
        });
      }
    }

    return allDeaths;
  };

  const nightDeaths = isPoliceDestroyed
    ? getAllNightDeaths()
    : [{ round: currentGame.currentRound, deaths: getCurrentNightDeaths() }];

  return (
    <div className="space-y-6">
      {/* 状态说明 */}
      <div
        className={`p-4 rounded-lg ${
          isPoliceDestroyed
            ? "bg-red-50 border border-red-200"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {isPoliceDestroyed ? (
            <>
              <Skull className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">警徽流失状态</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">第一晚结果公布</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-700">
          {isPoliceDestroyed
            ? `由于狼人自爆，警徽流失。现在公布前${currentGame.currentRound}晚的所有死亡信息。`
            : "警长竞选完成后，现在公布第一晚的死亡结果。"}
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
      {!isPoliceDestroyed && currentGame.currentRound === 1 && (
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

      {/* 警徽流失状态的说明 */}
      {isPoliceDestroyed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">游戏流程调整</span>
          </div>
          <p className="text-sm text-yellow-700">
            由于警徽流失，跳过警长选择发言顺序环节，直接进入自由发言和投票环节。
          </p>
        </div>
      )}
    </div>
  );
};
