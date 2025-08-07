import React from "react";
import { RoleType } from "@/types/game";
import { ROLES, getRoleIcon } from "@/lib/constants";
import { X } from "lucide-react";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  selectedRole?: RoleType;
  onRoleSelect: (role: RoleType) => void;
  availableRoles?: RoleType[];
  roleConfig?: { [key in RoleType]?: number };
  selectedRoleCounts?: { [key in RoleType]?: number };
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  playerName,
  selectedRole,
  onRoleSelect,
  availableRoles,
  roleConfig,
  selectedRoleCounts = {},
}) => {
  if (!isOpen) return null;

  const rolesToShow = availableRoles || (Object.keys(ROLES) as RoleType[]);

  const isRoleAvailable = (roleType: RoleType): boolean => {
    if (!roleConfig) return true;
    const maxCount = roleConfig[roleType] || 0;
    const currentCount = selectedRoleCounts[roleType] || 0;
    return currentCount < maxCount;
  };

  const getRemainingCount = (roleType: RoleType): number => {
    if (!roleConfig) return 999;
    const maxCount = roleConfig[roleType] || 0;
    const currentCount = selectedRoleCounts[roleType] || 0;
    return Math.max(0, maxCount - currentCount);
  };

  const handleRoleClick = (roleType: RoleType) => {
    if (isRoleAvailable(roleType)) {
      onRoleSelect(roleType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-11/12 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            为 {playerName} 选择身份
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rolesToShow.map((roleType) => {
              const role = ROLES[roleType];
              const isSelected = selectedRole === roleType;
              const available = isRoleAvailable(roleType);
              const remainingCount = getRemainingCount(roleType);
              const isDisabled = !available;

              return (
                <button
                  key={roleType}
                  onClick={() => handleRoleClick(roleType)}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${
                      isSelected
                        ? `${role.color} border-gray-800 shadow-lg scale-105`
                        : isDisabled
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        : "bg-white border-gray-300 hover:border-gray-400 hover:shadow-md active:scale-95"
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-3xl">{getRoleIcon(roleType)}</div>
                    <div
                      className={`text-sm font-bold ${
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
                          ? "text-white text-opacity-90"
                          : isDisabled
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {role.description}
                    </div>
                    {roleConfig && (
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          isSelected
                            ? "bg-white bg-opacity-20 text-white"
                            : isDisabled
                            ? "bg-gray-200 text-gray-400"
                            : remainingCount === 0
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
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
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>
  );
};