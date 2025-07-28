import React from "react";
import { RoleType } from "@/types/game";
import { ROLES, getRoleIcon } from "@/lib/constants";

interface RoleSelectorProps {
  selectedRole?: RoleType;
  onRoleSelect: (role: RoleType) => void;
  availableRoles?: RoleType[];
  className?: string;
  roleConfig?: { [key in RoleType]?: number }; // 角色配置数量
  selectedRoleCounts?: { [key in RoleType]?: number }; // 已选择的角色数量
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
  availableRoles,
  className = "",
  roleConfig,
  selectedRoleCounts = {},
}) => {
  const rolesToShow = availableRoles || (Object.keys(ROLES) as RoleType[]);

  // 检查角色是否可选择
  const isRoleAvailable = (roleType: RoleType): boolean => {
    if (!roleConfig) return true;

    const maxCount = roleConfig[roleType] || 0;
    const currentCount = selectedRoleCounts[roleType] || 0;

    return currentCount < maxCount;
  };

  // 获取角色的剩余可选数量
  const getRemainingCount = (roleType: RoleType): number => {
    if (!roleConfig) return 999;

    const maxCount = roleConfig[roleType] || 0;
    const currentCount = selectedRoleCounts[roleType] || 0;

    return Math.max(0, maxCount - currentCount);
  };

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}
    >
      {rolesToShow.map((roleType) => {
        const role = ROLES[roleType];
        const isSelected = selectedRole === roleType;
        const available = isRoleAvailable(roleType);
        const remainingCount = getRemainingCount(roleType);
        const isDisabled = !available;

        return (
          <button
            key={roleType}
            onClick={() => !isDisabled && onRoleSelect(roleType)}
            disabled={isDisabled}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
              ${
                isSelected
                  ? `${role.color} border-gray-800 shadow-lg`
                  : isDisabled
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-900"
              }
            `}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="text-2xl">{getRoleIcon(roleType)}</div>
              <div
                className={`text-sm font-medium ${
                  isSelected
                    ? "text-white"
                    : isDisabled
                    ? "text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {role.name}
              </div>
              <div
                className={`text-xs ${
                  isSelected
                    ? "text-white text-opacity-80"
                    : isDisabled
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {role.description}
              </div>
              {roleConfig && (
                <div
                  className={`text-xs font-medium ${
                    isSelected
                      ? "text-white"
                      : isDisabled
                      ? "text-gray-400"
                      : remainingCount === 0
                      ? "text-red-500"
                      : "text-blue-600"
                  }`}
                >
                  剩余: {remainingCount}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
