"use client";

import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { PlayerCard } from "@/components/PlayerCard";
import { RoleSelector } from "@/components/RoleSelector";
import { GameControlPanel } from "@/components/GameControlPanel";
import { VotingPanel } from "@/components/VotingPanel";
import { NightActionPanel } from "@/components/NightActionPanel";
import { SheriffElectionPanel } from "@/components/SheriffElectionPanel";
import { GameLogPanel } from "@/components/GameLogPanel";
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
} from "lucide-react";

export default function Home() {
  const {
    currentGame,
    games,
    createGame,
    loadGame,
    setPlayerRole,
    finishGame,
  } = useGameStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [showRoles, setShowRoles] = useState(true);
  const [gameName, setGameName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "day" | "night" | "sheriff" | "log"
  >("day");

  const handleCreateGame = () => {
    if (gameName.trim()) {
      const config = ROLE_CONFIGS[selectedConfig];
      createGame(gameName.trim(), config.playerCount);
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
                <span>{currentGame.playerCount}人局</span>
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

            {/* 游戏阶段标签 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab("day")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === "day"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>白天投票</span>
                </button>
                <button
                  onClick={() => setActiveTab("night")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === "night"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>夜间行动</span>
                </button>
                <button
                  onClick={() => setActiveTab("sheriff")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === "sheriff"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>警长竞选</span>
                </button>
                <button
                  onClick={() => setActiveTab("log")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === "log"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>游戏日志</span>
                </button>
              </div>

              {/* 标签内容 */}
              {activeTab === "day" && <VotingPanel />}
              {activeTab === "night" && <NightActionPanel />}
              {activeTab === "sheriff" && <SheriffElectionPanel />}
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
                    finishGame();
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>结束游戏</span>
              </button>
            </div>

            {/* 角色选择 */}
            {selectedPlayer && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">
                  为{" "}
                  {currentGame.players.find((p) => p.id === selectedPlayer)
                    ?.name || `玩家${selectedPlayer}`}{" "}
                  选择身份
                </h3>
                <RoleSelector
                  selectedRole={
                    currentGame.players.find((p) => p.id === selectedPlayer)
                      ?.role
                  }
                  onRoleSelect={handleRoleSelect}
                />
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
