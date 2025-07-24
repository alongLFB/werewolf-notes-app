import React from "react";
import { useGameStore } from "@/store/gameStore";
import { SkipForward, Users, Clock, Sun, Moon, Trophy } from "lucide-react";

export const GameControlPanel: React.FC = () => {
  const { currentGame, nextPhase, getCampCounts, getAlivePlayers } =
    useGameStore();

  if (!currentGame) return null;

  const campCounts = getCampCounts();
  const alivePlayers = getAlivePlayers();
  const isDay = currentGame.currentPhase === "day";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* 游戏基本信息 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{currentGame.name}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{currentGame.playerCount}人局</span>
        </div>
      </div>

      {/* 当前回合和阶段 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="font-medium">
            第 {currentGame.currentRound} 回合
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isDay ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-600 font-medium">白天讨论</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600 font-medium">夜晚行动</span>
            </>
          )}
        </div>
      </div>

      {/* 阵营统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-800">
            {campCounts.villagers}
          </div>
          <div className="text-sm text-green-700 font-medium">好人阵营</div>
        </div>

        <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-800">
            {campCounts.werewolves}
          </div>
          <div className="text-sm text-red-700 font-medium">狼人阵营</div>
        </div>

        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-800">
            {campCounts.thirdParty}
          </div>
          <div className="text-sm text-purple-700 font-medium">第三方</div>
        </div>
      </div>

      {/* 存活玩家数 */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-800 font-medium">存活玩家</span>
          <span className="font-bold text-gray-900">
            {alivePlayers.length} / {currentGame.playerCount}
          </span>
        </div>
      </div>

      {/* 游戏控制按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={nextPhase}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <SkipForward className="w-4 h-4" />
          <span>{isDay ? "进入夜晚" : "进入白天"}</span>
        </button>

        {currentGame.status === "finished" && (
          <div className="flex-1 bg-yellow-100 border border-yellow-300 text-yellow-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>游戏结束</span>
          </div>
        )}
      </div>

      {/* 游戏状态提示 */}
      <div className="text-sm text-gray-600 text-center">
        {isDay ? "白天阶段：玩家讨论并进行投票" : "夜晚阶段：记录各角色行动"}
      </div>
    </div>
  );
};
