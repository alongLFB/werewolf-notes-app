import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { NightAction } from "@/types/game";
import { ROLES } from "@/lib/constants";
import { Moon, Eye, Zap, Shield, Target, Plus } from "lucide-react";

export const NightActionPanel: React.FC = () => {
  const {
    currentGame,
    getAlivePlayers,
    addNightAction,
    addNightDeath,
    addActionLog,
  } = useGameStore();

  const [selectedActor, setSelectedActor] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [actionType, setActionType] = useState<NightAction["actionType"] | "">(
    ""
  );
  const [actionResult, setActionResult] = useState("");

  if (!currentGame || currentGame.currentPhase !== "night") return null;

  const alivePlayers = getAlivePlayers();

  const handleAddAction = () => {
    if (!selectedActor || !actionType) return;

    const action: NightAction = {
      actorId: selectedActor,
      targetId: selectedTarget || undefined,
      actionType: actionType as NightAction["actionType"],
      result: actionResult || undefined,
    };

    addNightAction(action);

    // 添加日志
    const actorName =
      currentGame.players.find((p) => p.id === selectedActor)?.name ||
      `玩家${selectedActor}`;
    const targetName = selectedTarget
      ? currentGame.players.find((p) => p.id === selectedTarget)?.name ||
        `玩家${selectedTarget}`
      : "无目标";

    let logMessage = "";
    switch (actionType) {
      case "werewolf_kill":
        logMessage = `${actorName}(狼人)击杀了${targetName}`;
        if (selectedTarget) {
          addNightDeath(selectedTarget, "狼人击杀");
        }
        break;
      case "seer_check":
        logMessage = `${actorName}(预言家)查验了${targetName}，结果：${
          actionResult || "未知"
        }`;
        break;
      case "witch_save":
        logMessage = `${actorName}(女巫)使用解药救了${targetName}`;
        break;
      case "witch_poison":
        logMessage = `${actorName}(女巫)使用毒药毒死了${targetName}`;
        if (selectedTarget) {
          addNightDeath(selectedTarget, "女巫毒死");
        }
        break;
      case "guard_protect":
        logMessage = `${actorName}(守卫)保护了${targetName}`;
        break;
    }

    addActionLog(logMessage, true);

    // 重置表单
    setSelectedActor(null);
    setSelectedTarget(null);
    setActionType("");
    setActionResult("");
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "werewolf_kill":
        return <Target className="w-4 h-4 text-red-500" />;
      case "seer_check":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "witch_save":
      case "witch_poison":
        return <Zap className="w-4 h-4 text-purple-500" />;
      case "guard_protect":
        return <Shield className="w-4 h-4 text-cyan-500" />;
      default:
        return <Moon className="w-4 h-4" />;
    }
  };

  const getActionName = (type: string) => {
    const names = {
      werewolf_kill: "狼人击杀",
      seer_check: "预言家查验",
      witch_save: "女巫救人",
      witch_poison: "女巫毒人",
      guard_protect: "守卫保护",
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Moon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">夜晚行动</h3>
      </div>

      {/* 行动记录表单 */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 行动者选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              行动者
            </label>
            <select
              value={selectedActor || ""}
              onChange={(e) =>
                setSelectedActor(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择行动者</option>
              {alivePlayers
                .filter((p) => p.role)
                .map((player) => {
                  const role = player.role ? ROLES[player.role] : null;
                  return (
                    <option key={player.id} value={player.id}>
                      {player.name || `玩家${player.id}`} ({role?.name})
                    </option>
                  );
                })}
            </select>
          </div>

          {/* 行动类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              行动类型
            </label>
            <select
              value={actionType}
              onChange={(e) =>
                setActionType(e.target.value as NightAction["actionType"] | "")
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择行动类型</option>
              <option value="werewolf_kill">狼人击杀</option>
              <option value="seer_check">预言家查验</option>
              <option value="witch_save">女巫救人</option>
              <option value="witch_poison">女巫毒人</option>
              <option value="guard_protect">守卫保护</option>
            </select>
          </div>
        </div>

        {/* 目标选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            目标玩家
          </label>
          <select
            value={selectedTarget || ""}
            onChange={(e) =>
              setSelectedTarget(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">选择目标(可选)</option>
            {alivePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name || `玩家${player.id}`} ({player.id}号)
              </option>
            ))}
          </select>
        </div>

        {/* 行动结果(仅预言家查验需要) */}
        {actionType === "seer_check" && (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              查验结果
            </label>
            <select
              value={actionResult}
              onChange={(e) => setActionResult(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择结果</option>
              <option value="好人">好人</option>
              <option value="狼人">狼人</option>
            </select>
          </div>
        )}

        <button
          onClick={handleAddAction}
          disabled={!selectedActor || !actionType}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>记录行动</span>
        </button>
      </div>

      {/* 当前回合夜晚行动列表 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">本回合夜晚行动</h4>
        <div className="space-y-2">
          {currentGame.rounds
            .find((r) => r.number === currentGame.currentRound)
            ?.nightActions.map((action, index) => {
              const actor = currentGame.players.find(
                (p) => p.id === action.actorId
              );
              const target = action.targetId
                ? currentGame.players.find((p) => p.id === action.targetId)
                : null;

              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-200 rounded-lg"
                >
                  {getActionIcon(action.actionType)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {getActionName(action.actionType)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {actor?.name || `玩家${action.actorId}`} →{" "}
                      {target?.name || `玩家${action.targetId}` || "无目标"}
                      {action.result && ` (${action.result})`}
                    </div>
                  </div>
                </div>
              );
            }) || []}
        </div>
      </div>
    </div>
  );
};
