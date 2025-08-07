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
    resolveNightActions,
    isCurrentRoundResolved,
    getWitchPotionStatus,
  } = useGameStore();

  const [selectedActor, setSelectedActor] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [actionType, setActionType] = useState<NightAction["actionType"] | "">(
    ""
  );
  const [actionResult, setActionResult] = useState("");

  if (!currentGame || currentGame.currentPhase !== "night") return null;

  const alivePlayers = getAlivePlayers();

  // 根据角色获取可执行的行动类型
  const getAvailableActions = (role: string | undefined, playerId?: number) => {
    if (!role) return [];

    switch (role) {
      case "werewolf":
      case "dark_wolf_king":
      case "white_wolf_king":
        return [{ value: "werewolf_kill", label: "击杀" }];
      case "seer":
        return [{ value: "seer_check", label: "查验身份" }];
      case "witch":
        const actions = [];
        if (playerId) {
          const potionStatus = getWitchPotionStatus(playerId);
          if (potionStatus?.hasAntidote) {
            actions.push({ value: "witch_save", label: "使用解药救人" });
          }
          if (potionStatus?.hasPoison) {
            actions.push({ value: "witch_poison", label: "使用毒药毒人" });
          }
        }
        return actions;
      case "guard":
        return [{ value: "guard_protect", label: "守护保护" }];
      default:
        return [];
    }
  };

  // 获取选中行动者的可用行动
  const selectedActorPlayer = selectedActor
    ? alivePlayers.find((p) => p.id === selectedActor)
    : null;
  const availableActions = getAvailableActions(selectedActorPlayer?.role, selectedActorPlayer?.id);

  // 当选择行动者时，自动重置行动类型
  const handleActorChange = (actorId: number | null) => {
    setSelectedActor(actorId);
    setActionType(""); // 重置行动类型
    setSelectedTarget(null); // 重置目标
    setActionResult(""); // 重置结果
  };

  const handleAddAction = () => {
    if (!selectedActor || !actionType) return;

    // 检查是否需要目标玩家
    const needsTarget = [
      "werewolf_kill",
      "seer_check",
      "witch_save",
      "witch_poison",
      "guard_protect",
    ].includes(actionType);
    if (needsTarget && !selectedTarget) {
      alert("该行动需要选择目标玩家");
      return;
    }

    const action: NightAction = {
      actorId: selectedActor,
      targetId: selectedTarget || undefined,
      actionType: actionType as NightAction["actionType"],
      result: actionResult || undefined,
    };

    addNightAction(action);

    // 不在这里处理死亡，所有死亡都在夜晚结算时统一处理
    // 这样可以确保优先级和相互作用的正确处理

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
      witch_save: "女巫救人（解药）",
      witch_poison: "女巫毒人（毒药）",
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
                handleActorChange(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">选择行动者</option>
              {alivePlayers
                .filter(
                  (p) =>
                    p.role &&
                    [
                      "werewolf",
                      "dark_wolf_king",
                      "white_wolf_king",
                      "seer",
                      "witch",
                      "guard",
                    ].includes(p.role)
                )
                .map((player) => {
                  const role = player.role ? ROLES[player.role] : null;
                  let displayText = `${player.name || `玩家${player.id}`} (${role?.name})`;
                  
                  // 为女巫显示药品状态
                  if (player.role === "witch") {
                    const potionStatus = getWitchPotionStatus(player.id);
                    const potions = [];
                    if (potionStatus?.hasAntidote) potions.push("解药");
                    if (potionStatus?.hasPoison) potions.push("毒药");
                    if (potions.length > 0) {
                      displayText += ` [${potions.join("、")}]`;
                    } else {
                      displayText += " [无药品]";
                    }
                  }
                  
                  return (
                    <option key={player.id} value={player.id}>
                      {displayText}
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
              disabled={!selectedActor}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">
                {selectedActor ? "选择行动类型" : "请先选择行动者"}
              </option>
              {availableActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 目标选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            目标玩家
            {actionType === "witch_save" && " (通常是被狼人击杀的玩家)"}
            {actionType === "witch_poison" && " (选择要毒杀的玩家)"}
          </label>
          
          {/* 女巫救人的特殊提示 */}
          {actionType === "witch_save" && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              💡 提示：女巫救人需要在狼人击杀后进行。请先记录狼人击杀行动，再选择是否使用解药救人。
            </div>
          )}
          
          <select
            value={selectedTarget || ""}
            onChange={(e) =>
              setSelectedTarget(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            disabled={!actionType}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {actionType ? "选择目标玩家" : "请先选择行动类型"}
            </option>
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
          disabled={
            !selectedActor ||
            !actionType ||
            ([
              "werewolf_kill",
              "seer_check",
              "witch_save",
              "witch_poison",
              "guard_protect",
            ].includes(actionType) &&
              !selectedTarget) ||
            (actionType === "seer_check" && !actionResult)
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>记录行动</span>
        </button>

        {/* 夜晚结算说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Moon className="w-4 h-4 mr-2" />
            夜晚结算规则
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 1. 女巫毒杀：优先级最高，无法阻挡</li>
            <li>• 2. 狼人击杀：会被女巫解药或守卫保护阻止</li>
            <li>• 3. 守卫+解药：同时作用会导致目标死亡</li>
            <li>• 4. 结算后女巫使用的药品将消失</li>
          </ul>
        </div>

        {/* 夜晚结算按钮 */}
        <button
          onClick={() => {
            if (confirm("确定要结算夜晚行动吗？这将处理所有夜间行动的结果，并消耗女巫使用的药品。")) {
              resolveNightActions();
            }
          }}
          disabled={isCurrentRoundResolved()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:text-gray-200 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Moon className="w-4 h-4" />
          <span>
            {isCurrentRoundResolved() ? "夜晚已结算" : "结算夜晚行动"}
          </span>
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
