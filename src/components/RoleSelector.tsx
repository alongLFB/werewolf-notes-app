import React from "react";
import { RoleType } from "@/types/game";
import { ROLES, getRoleIcon } from "@/lib/constants";

interface RoleSelectorProps {
  selectedRole?: RoleType;
  onRoleSelect: (role: RoleType) => void;
  availableRoles?: RoleType[];
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
  availableRoles,
  className = "",
}) => {
  const rolesToShow = availableRoles || (Object.keys(ROLES) as RoleType[]);

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}
    >
      {rolesToShow.map((roleType) => {
        const role = ROLES[roleType];
        const isSelected = selectedRole === roleType;

        return (
          <button
            key={roleType}
            onClick={() => onRoleSelect(roleType)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
              ${
                isSelected
                  ? `${role.color} border-gray-800 shadow-lg`
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-900"
              }
            `}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="text-2xl">{getRoleIcon(roleType)}</div>
              <div
                className={`text-sm font-medium ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {role.name}
              </div>
              <div
                className={`text-xs ${
                  isSelected ? "text-white text-opacity-80" : "text-gray-600"
                }`}
              >
                {role.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
