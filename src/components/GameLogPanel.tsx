import React, { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { FileText, Eye, EyeOff, User, Shield, Filter } from "lucide-react";

export const GameLogPanel: React.FC = () => {
  const { currentGame, getVisibleLogs, setUserRole } = useGameStore();

  const [isExpanded, setIsExpanded] = useState(true); // 默认展开
  const [filterByRound, setFilterByRound] = useState<number | "all">("all");

  if (!currentGame) return null;

  const allLogs = getVisibleLogs();
  const filteredLogs =
    filterByRound === "all"
      ? allLogs
      : allLogs.filter((log) => log.startsWith(`第${filterByRound}回合`));

  const toggleUserRole = () => {
    const newRole = currentGame.userRole === "god" ? "player" : "god";
    setUserRole(newRole);
  };

  const getRoundNumbers = () => {
    const rounds = new Set<number>();
    currentGame.rounds.forEach((round) => {
      if (round.actionLog.length > 0) {
        rounds.add(round.number);
      }
    });
    return Array.from(rounds).sort((a, b) => a - b);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* 日志面板头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-900">游戏日志</h3>
          <span className="text-sm text-gray-600">
            ({filteredLogs.length}条记录)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* 用户角色切换 */}
          <button
            onClick={toggleUserRole}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentGame.userRole === "god"
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {currentGame.userRole === "god" ? (
              <>
                <Shield className="w-4 h-4" />
                <span>上帝视角</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>玩家视角</span>
              </>
            )}
          </button>

          {/* 展开/折叠按钮 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>折叠</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>展开</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 日志内容 */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 过滤器 */}
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              筛选回合：
            </span>
            <select
              value={filterByRound}
              onChange={(e) =>
                setFilterByRound(
                  e.target.value === "all" ? "all" : parseInt(e.target.value)
                )
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
            >
              <option value="all">全部回合</option>
              {getRoundNumbers().map((round) => (
                <option key={round} value={round}>
                  第{round}回合
                </option>
              ))}
            </select>
          </div>

          {/* 权限说明 */}
          <div
            className={`text-xs p-2 rounded-lg ${
              currentGame.userRole === "god"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {currentGame.userRole === "god"
              ? "🔓 上帝视角：可以查看所有日志记录(包括夜晚私密行动)"
              : "👁️ 玩家视角：只能查看公开的白天讨论日志"}
          </div>

          {/* 日志列表 */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>暂无日志记录</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const isPrivateLog = log.includes("[私密]");
                const roundMatch = log.match(/第(\d+)回合:/);
                const roundNumber = roundMatch ? parseInt(roundMatch[1]) : null;
                const content = log.replace(/第\d+回合:\s*/, "");

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      isPrivateLog
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {roundNumber && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 font-medium">
                            第{roundNumber}回合
                          </span>
                        )}
                        <span className={isPrivateLog ? "font-medium" : ""}>
                          {content.replace("[私密] ", "")}
                        </span>
                      </div>
                      {isPrivateLog && currentGame.userRole === "god" && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-2">
                          私密
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 统计信息 */}
          <div className="border-t border-gray-200 pt-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {currentGame.currentRound}
                </div>
                <div className="text-xs text-gray-600">当前回合</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {currentGame.rounds.length}
                </div>
                <div className="text-xs text-gray-600">总回合数</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {allLogs.length}
                </div>
                <div className="text-xs text-gray-600">总日志数</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
