import React, { useState } from "react";
import { Player } from "@/types/game";
import { ROLES, getRoleIcon } from "@/lib/constants";
import { useGameStore } from "@/store/gameStore";
import { User, Skull, Edit, MessageCircle } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  showRoles?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  showRoles = true,
  onClick,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name || "");
  const { setPlayerName } = useGameStore();

  const handleSaveName = () => {
    setPlayerName(player.id, editName);
    setIsEditing(false);
  };

  const role = player.role ? ROLES[player.role] : null;
  const isAlive = player.isAlive;

  return (
    <div
      className={`
        relative border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer
        ${
          isAlive
            ? "border-gray-300 bg-white"
            : "border-red-300 bg-red-50 opacity-75"
        }
        ${role && showRoles ? role.color : "bg-gray-100"}
        hover:shadow-lg
        ${className}
      `}
      onClick={onClick}
    >
      {/* 死亡标识 */}
      {!isAlive && (
        <div className="absolute top-2 right-2">
          <Skull className="w-5 h-5 text-red-500" />
        </div>
      )}

      {/* 座位号 */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
        {player.id}
      </div>

      {/* 玩家头像区域 */}
      <div className="flex flex-col items-center space-y-2 mt-4">
        {/* 角色图标 */}
        {role && showRoles ? (
          <div className="text-2xl">{getRoleIcon(role.type)}</div>
        ) : (
          <User className="w-8 h-8 text-gray-400" />
        )}

        {/* 玩家姓名编辑 */}
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-center border rounded px-2 py-1 text-sm text-gray-900 bg-white"
              placeholder="输入姓名"
              autoFocus
              onBlur={handleSaveName}
              onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
            />
          </div>
        ) : (
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <span
              className={`text-sm font-medium ${
                role && showRoles ? "text-white" : "text-gray-900"
              }`}
            >
              {player.name || `玩家${player.id}`}
            </span>
            <Edit
              className={`w-3 h-3 ${
                role && showRoles
                  ? "text-white text-opacity-70"
                  : "text-gray-400"
              }`}
            />
          </div>
        )}

        {/* 角色名称 */}
        {role && showRoles && (
          <div className="text-xs font-medium text-center">
            <div className="px-2 py-1 rounded-full bg-black bg-opacity-20 text-white">
              {role.name}
            </div>
          </div>
        )}

        {/* 死亡信息 */}
        {!isAlive && player.deathReason && (
          <div className="text-xs text-red-700 text-center font-medium bg-white bg-opacity-80 px-2 py-1 rounded">
            {getDeathReasonText(player.deathReason)}
            {player.deathRound && ` (第${player.deathRound}回合)`}
          </div>
        )}

        {/* 笔记提示 */}
        {player.notes && (
          <div className="flex items-center space-x-1">
            <MessageCircle
              className={`w-3 h-3 ${
                role && showRoles ? "text-white" : "text-blue-500"
              }`}
            />
            <span
              className={`text-xs ${
                role && showRoles ? "text-white" : "text-blue-600"
              }`}
            >
              有笔记
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 死亡原因文本转换
function getDeathReasonText(reason: string): string {
  const reasonMap = {
    vote: "投票出局",
    werewolf_kill: "狼人击杀",
    witch_poison: "女巫毒死",
    hunter_revenge: "猎人复仇",
  };
  return reasonMap[reason as keyof typeof reasonMap] || reason;
}
