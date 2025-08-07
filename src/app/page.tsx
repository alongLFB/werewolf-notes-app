"use client";

import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { PlayerCard } from "@/components/PlayerCard";
import { RoleSelectorModal } from "@/components/RoleSelectorModal";
import { GameControlPanel } from "@/components/GameControlPanel";
import { VotingPanel } from "@/components/VotingPanel";
import { NightActionPanel } from "@/components/NightActionPanel";
import { SheriffElectionPanel } from "@/components/SheriffElectionPanel";
import { GameLogPanel } from "@/components/GameLogPanel";
import { NightResultsPanel } from "@/components/NightResultsPanel";
import { GameSummary } from "@/components/GameSummary";
import { RoleType } from "@/types/game";
import { ROLE_CONFIGS } from "@/lib/constants";
import {
  Plus,
  Settings,
  Users,
  Eye,
  EyeOff,
  GamepadIcon,
  Sun,
  Moon,
  Shield,
  FileText,
  RotateCcw,
  Trophy,
} from "lucide-react";

export default function Home() {
  const {
    currentGame,
    games,
    createGame,
    loadGame,
    setPlayerRole,
    finishGame,
    getSelectedRoleCounts,
    shouldShowSheriffElection,
    shouldShowVoting,
    shouldShowNightResults,
    isBadgeLost,
  } = useGameStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [showRoles, setShowRoles] = useState(true);
  const [gameName, setGameName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [showGameLog, setShowGameLog] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);

  // 根据游戏状态自动设置活动标签页
  const getActiveTab = (): "day" | "night" | "sheriff" | "log" | "results" => {
    if (!currentGame) return "day";

    // 如果用户要查看日志，直接返回log
    if (showGameLog) return "log";

    if (currentGame.currentPhase === "night") {
      return "night";
    } else if (currentGame.currentPhase === "day") {
      // 白天阶段的优先级：警长竞选 > 夜晚结果公布 > 投票
      if (shouldShowSheriffElection()) {
        return "sheriff";
      } else if (shouldShowNightResults()) {
        return "results";
      } else if (shouldShowVoting()) {
        return "day";
      }
    }

    return "day";
  };

  const activeTab = getActiveTab();

  const handleCreateGame = () => {
    if (gameName.trim()) {
      const config = ROLE_CONFIGS[selectedConfig];
      createGame(gameName.trim(), config.playerCount, config.roles);
      setShowCreateForm(false);
      setGameName("");
    }
  };

  const handleRoleSelect = (role: RoleType) => {
    if (selectedPlayer && currentGame) {
      setPlayerRole(selectedPlayer, role);
      setSelectedPlayer(null);
    }
  };

  // 如果没有当前游戏，显示游戏选择界面
  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🐺 狼人杀笔记
            </h1>
            <p className="text-gray-600">记录游戏过程，提升游戏体验</p>
          </div>

          {/* 创建新游戏 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">创建新游戏</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>新游戏</span>
              </button>
            </div>

            {showCreateForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    游戏名称
                  </label>
                  <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="输入游戏名称"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    游戏配置
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ROLE_CONFIGS.map((config, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedConfig(index)}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          selectedConfig === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {config.name}
                        </div>
                        <div className="text-sm text-gray-700">
                          {config.description}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {config.playerCount}人局
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          {config.roles_description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateGame}
                  disabled={!gameName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  创建游戏
                </button>
              </div>
            )}
          </div>

          {/* 历史游戏 */}
          {games.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">历史游戏</h2>
              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadGame(game.id)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {game.name}
                      </div>
                      <div className="text-sm text-gray-700">
                        {game.playerCount}人局 ·{" "}
                        {game.status === "ongoing" ? "进行中" : "已结束"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(game.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <GamepadIcon className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                🐺 {currentGame.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium">
                <Users className="w-4 h-4" />
                <span>{currentGame.playerCount}人局-狼</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium">
                <span>第{currentGame.currentRound}回合</span>
                <span>·</span>
                <span>
                  {currentGame.currentPhase === "day" ? "白天" : "夜晚"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentGame.status === "finished" && (
                <button
                  onClick={() => setShowGameSummary(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Trophy className="w-4 h-4" />
                  <span>查看总结</span>
                </button>
              )}

              <button
                onClick={() => setShowRoles(!showRoles)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 text-gray-900 font-medium"
              >
                {showRoles ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>隐藏身份</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>显示身份</span>
                  </>
                )}
              </button>

              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 text-gray-900 font-medium">
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 主游戏区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 玩家座位图 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900">玩家座位</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentGame.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    showRoles={showRoles}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={
                      selectedPlayer === player.id ? "ring-2 ring-blue-500" : ""
                    }
                  />
                ))}
              </div>
            </div>

            {/* 游戏阶段面板 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* 当前阶段标题和控制 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  {activeTab === "day" && !showGameLog && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                      <Sun className="w-4 h-4" />
                      <span>白天投票</span>
                    </div>
                  )}
                  {activeTab === "night" && !showGameLog && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                      <Moon className="w-4 h-4" />
                      <span>夜间行动</span>
                    </div>
                  )}
                  {activeTab === "sheriff" && !showGameLog && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                      <Shield className="w-4 h-4" />
                      <span>警长竞选</span>
                    </div>
                  )}
                  {activeTab === "results" && !showGameLog && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium">
                      <Sun className="w-4 h-4" />
                      <span>
                        {isBadgeLost()
                          ? "警徽流失 - 公布死亡信息"
                          : "公布夜晚结果"}
                      </span>
                    </div>
                  )}
                  {(activeTab === "log" || showGameLog) && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                      <FileText className="w-4 h-4" />
                      <span>游戏日志</span>
                    </div>
                  )}
                </div>

                {/* 右侧按钮 */}
                <div className="flex items-center space-x-2">
                  {!showGameLog ? (
                    <button
                      onClick={() => setShowGameLog(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      <span>查看日志</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowGameLog(false)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>返回游戏</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 标签内容 */}
              {activeTab === "day" && <VotingPanel />}
              {activeTab === "night" && <NightActionPanel />}
              {activeTab === "sheriff" && <SheriffElectionPanel />}
              {activeTab === "results" && <NightResultsPanel />}
              {activeTab === "log" && <GameLogPanel />}
            </div>
          </div>

          {/* 右侧控制面板 */}
          <div className="space-y-6">
            {/* 游戏控制 */}
            <GameControlPanel />

            {/* 结束游戏按钮 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => {
                  if (confirm("确定要结束当前游戏吗？")) {
                    const winner = prompt("请输入获胜阵营 (villagers/werewolves):");
                    if (winner === "villagers" || winner === "werewolves") {
                      finishGame(winner);
                      setShowGameSummary(true);
                    } else if (winner !== null) {
                      alert("请输入正确的阵营: villagers 或 werewolves");
                    }
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>结束游戏</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 角色选择弹窗 */}
      <RoleSelectorModal
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
        playerName={
          currentGame.players.find((p) => p.id === selectedPlayer)?.name ||
          `玩家${selectedPlayer}`
        }
        selectedRole={
          currentGame.players.find((p) => p.id === selectedPlayer)?.role
        }
        onRoleSelect={handleRoleSelect}
        roleConfig={currentGame.roleConfig}
        selectedRoleCounts={getSelectedRoleCounts()}
      />

      {/* 游戏总结弹窗 */}
      {showGameSummary && (
        <GameSummary
          game={currentGame}
          onClose={() => setShowGameSummary(false)}
        />
      )}
    </div>
  );
}
