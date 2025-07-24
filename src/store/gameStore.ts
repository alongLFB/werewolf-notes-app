import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Game,
  Player,
  Round,
  Note,
  GamePhase,
  RoleType,
  Vote,
  NightAction,
  DeathReason,
} from "@/types/game";

interface GameStore {
  // 当前游戏状态
  currentGame: Game | null;
  games: Game[];

  // 游戏操作
  createGame: (name: string, playerCount: number) => void;
  loadGame: (gameId: string) => void;
  saveCurrentGame: () => void;
  deleteGame: (gameId: string) => void;
  finishGame: (winner?: string) => void;

  // 玩家操作
  setPlayerRole: (playerId: number, role: RoleType) => void;
  setPlayerName: (playerId: number, name: string) => void;
  setPlayerAlive: (
    playerId: number,
    isAlive: boolean,
    deathReason?: DeathReason
  ) => void;
  addPlayerNote: (playerId: number, note: string) => void;

  // 游戏流程
  nextPhase: () => void;
  addVote: (voterId: number, targetId: number | "abstain") => void;
  addNightAction: (action: NightAction) => void;
  eliminatePlayer: (playerId: number) => void;

  // 警长相关
  addPoliceCandidate: (playerId: number) => void;
  removePoliceCandidate: (playerId: number) => void;
  electSheriff: (playerId: number) => void;

  // 夜晚死亡
  addNightDeath: (playerId: number, reason: string) => void;

  // 夜晚结算 - 处理所有夜间行动的结果
  resolveNightActions: () => void;

  // 白天结算 - 处理投票结果
  resolveDayVoting: () => void;

  // 检查当前回合是否已结算
  isCurrentRoundResolved: () => boolean;

  // 日志系统
  addActionLog: (message: string, isPrivate?: boolean) => void;
  getVisibleLogs: () => string[];

  // 用户角色
  setUserRole: (role: "god" | "player") => void;

  // 笔记系统
  addGameNote: (content: string, playerId?: number, tags?: string[]) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;

  // 工具函数
  getAlivePlayers: () => Player[];
  getCampCounts: () => {
    villagers: number;
    werewolves: number;
    thirdParty: number;
  };
  getCurrentRound: () => Round | null;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      games: [],

      createGame: (name: string, playerCount: number) => {
        const gameId = Date.now().toString();
        const players: Player[] = Array.from(
          { length: playerCount },
          (_, i) => ({
            id: i + 1,
            isAlive: true,
            notes: "",
            tags: [],
          })
        );

        const newGame: Game = {
          id: gameId,
          name,
          playerCount,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "setup",
          players,
          rounds: [
            {
              number: 1,
              phase: "night",
              votes: [],
              nightActions: [],
              actionLog: [`游戏开始！${playerCount}人局狼人杀开始`], // 添加初始日志
            },
          ],
          notes: [],
          currentRound: 1,
          currentPhase: "night", // 从夜晚开始
          userRole: "god", // 默认为上帝视角
        };

        set((state) => ({
          currentGame: newGame,
          games: [...state.games, newGame],
        }));
      },

      loadGame: (gameId: string) => {
        const game = get().games.find((g) => g.id === gameId);
        if (game) {
          set({ currentGame: game });
        }
      },

      saveCurrentGame: () => {
        const { currentGame, games } = get();
        if (!currentGame) return;

        const updatedGame = {
          ...currentGame,
          updatedAt: new Date(),
        };

        set({
          currentGame: updatedGame,
          games: games.map((g) => (g.id === currentGame.id ? updatedGame : g)),
        });
      },

      deleteGame: (gameId: string) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
          currentGame:
            state.currentGame?.id === gameId ? null : state.currentGame,
        }));
      },

      setPlayerRole: (playerId: number, role: RoleType) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((p) =>
          p.id === playerId ? { ...p, role } : p
        );

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
            status: "ongoing",
          },
        });
      },

      setPlayerName: (playerId: number, name: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((p) =>
          p.id === playerId ? { ...p, name } : p
        );

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
          },
        });
      },

      setPlayerAlive: (
        playerId: number,
        isAlive: boolean,
        deathReason?: DeathReason
      ) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                isAlive,
                deathReason: !isAlive ? deathReason : undefined,
                deathRound: !isAlive ? currentGame.currentRound : undefined,
              }
            : p
        );

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
          },
        });
      },

      addPlayerNote: (playerId: number, note: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((p) =>
          p.id === playerId ? { ...p, notes: note } : p
        );

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
          },
        });
      },

      nextPhase: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        let newPhase: GamePhase;
        let newRound = currentGame.currentRound;

        if (currentGame.currentPhase === "day") {
          newPhase = "night";
        } else {
          newPhase = "day";
          newRound += 1;
        }

        set({
          currentGame: {
            ...currentGame,
            currentPhase: newPhase,
            currentRound: newRound,
          },
        });
      },

      addVote: (voterId: number, targetId: number | "abstain") => {
        const { currentGame } = get();
        if (!currentGame) return;

        const vote: Vote = {
          voterId,
          targetId,
          round: currentGame.currentRound,
        };

        const currentRound = currentGame.rounds.find(
          (r) => r.number === currentGame.currentRound
        );

        if (currentRound) {
          // 移除该投票者之前的投票
          const updatedVotes = currentRound.votes.filter(
            (v) => v.voterId !== voterId
          );
          updatedVotes.push(vote);

          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, votes: updatedVotes }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });

          // 添加投票日志
          const voterName =
            currentGame.players.find((p) => p.id === voterId)?.name ||
            `玩家${voterId}`;
          if (targetId === "abstain") {
            get().addActionLog(`${voterName} 选择弃票`);
          } else {
            const targetName =
              currentGame.players.find((p) => p.id === targetId)?.name ||
              `玩家${targetId}`;
            get().addActionLog(`${voterName} 投票给 ${targetName}`);
          }
        } else {
          // 创建新回合
          const newRound: Round = {
            number: currentGame.currentRound,
            phase: currentGame.currentPhase,
            votes: [vote],
            nightActions: [],
            actionLog: [],
          };

          set({
            currentGame: {
              ...currentGame,
              rounds: [...currentGame.rounds, newRound],
            },
          });
        }
      },

      addNightAction: (action: NightAction) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = currentGame.rounds.find(
          (r) => r.number === currentGame.currentRound
        );

        if (currentRound) {
          const updatedActions = [...currentRound.nightActions, action];

          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, nightActions: updatedActions }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        } else {
          // 创建新回合
          const newRound: Round = {
            number: currentGame.currentRound,
            phase: currentGame.currentPhase,
            votes: [],
            nightActions: [action],
            actionLog: [],
          };

          set({
            currentGame: {
              ...currentGame,
              rounds: [...currentGame.rounds, newRound],
            },
          });
        }

        // 添加夜间行动日志
        const actorName =
          currentGame.players.find((p) => p.id === action.actorId)?.name ||
          `玩家${action.actorId}`;
        const targetName = action.targetId
          ? currentGame.players.find((p) => p.id === action.targetId)?.name ||
            `玩家${action.targetId}`
          : "";

        let logMessage = "";
        switch (action.actionType) {
          case "werewolf_kill":
            logMessage = `狼人 ${actorName} 选择击杀 ${targetName}`;
            // 不立即设置死亡，等白天结算
            break;
          case "seer_check":
            logMessage = `预言家 ${actorName} 查验 ${targetName}`;
            if (action.result) {
              // 处理中文结果，保持与UI一致
              let resultText = action.result;
              if (action.result === "good") resultText = "好人";
              if (action.result === "werewolf") resultText = "狼人";
              logMessage += `，结果：${resultText}`;
            }
            break;
          case "witch_save":
            logMessage = `女巫 ${actorName} 使用解药救 ${targetName}`;
            break;
          case "witch_poison":
            logMessage = `女巫 ${actorName} 使用毒药毒 ${targetName}`;
            break;
          case "guard_protect":
            logMessage = `守卫 ${actorName} 保护 ${targetName}`;
            break;
        }

        get().addActionLog(logMessage, true); // 夜间行动为私密日志
      },

      eliminatePlayer: (playerId: number) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = currentGame.rounds.find(
          (r) => r.number === currentGame.currentRound
        );

        if (currentRound) {
          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, eliminated: playerId }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        }

        // 同时更新玩家存活状态
        get().setPlayerAlive(playerId, false, "vote");

        // 添加出局日志
        const playerName =
          currentGame.players.find((p) => p.id === playerId)?.name ||
          `玩家${playerId}`;
        get().addActionLog(`${playerName} 被投票出局`);
      },

      addGameNote: (
        content: string,
        playerId?: number,
        tags: string[] = []
      ) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const newNote: Note = {
          id: Date.now().toString(),
          playerId,
          content,
          tags,
          timestamp: new Date(),
          round: currentGame.currentRound,
        };

        set({
          currentGame: {
            ...currentGame,
            notes: [...currentGame.notes, newNote],
          },
        });
      },

      updateNote: (noteId: string, content: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedNotes = currentGame.notes.map((note) =>
          note.id === noteId ? { ...note, content } : note
        );

        set({
          currentGame: {
            ...currentGame,
            notes: updatedNotes,
          },
        });
      },

      deleteNote: (noteId: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedNotes = currentGame.notes.filter(
          (note) => note.id !== noteId
        );

        set({
          currentGame: {
            ...currentGame,
            notes: updatedNotes,
          },
        });
      },

      getAlivePlayers: () => {
        const { currentGame } = get();
        return currentGame?.players.filter((p) => p.isAlive) || [];
      },

      getCampCounts: () => {
        const { currentGame } = get();
        if (!currentGame) return { villagers: 0, werewolves: 0, thirdParty: 0 };

        const alivePlayers = currentGame.players.filter(
          (p) => p.isAlive && p.role
        );

        return {
          villagers: alivePlayers.filter((p) => {
            const role = p.role;
            return (
              role &&
              [
                "villager",
                "seer",
                "witch",
                "hunter",
                "guard",
                "idiot",
                "mayor",
              ].includes(role)
            );
          }).length,
          werewolves: alivePlayers.filter((p) => p.role === "werewolf").length,
          thirdParty: alivePlayers.filter(
            (p) => p.role && ["cupid", "thief"].includes(p.role)
          ).length,
        };
      },

      getCurrentRound: () => {
        const { currentGame } = get();
        if (!currentGame) return null;
        return (
          currentGame.rounds.find(
            (r) => r.number === currentGame.currentRound
          ) || null
        );
      },

      // 新增功能实现
      finishGame: (winner?: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedGame = {
          ...currentGame,
          status: "finished" as const,
          winner: winner as
            | "villagers"
            | "werewolves"
            | "third_party"
            | undefined,
        };

        // 先保存游戏状态
        const updatedGames = get().games.map((g) =>
          g.id === updatedGame.id ? updatedGame : g
        );

        set({
          currentGame: null, // 清除当前游戏，返回首页
          games: updatedGames,
        });
      },

      addPoliceCandidate: (playerId: number) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = get().getCurrentRound();
        if (currentRound) {
          const policeElection = currentRound.policeElection || {
            candidates: [],
            votes: {},
          };
          if (!policeElection.candidates.includes(playerId)) {
            policeElection.candidates.push(playerId);

            const updatedRounds = currentGame.rounds.map((r) =>
              r.number === currentGame.currentRound
                ? { ...r, policeElection }
                : r
            );

            set({
              currentGame: {
                ...currentGame,
                rounds: updatedRounds,
              },
            });

            // 添加上警日志
            const playerName =
              currentGame.players.find((p) => p.id === playerId)?.name ||
              `玩家${playerId}`;
            get().addActionLog(`${playerName} 上警竞选警长`);
          }
        }
      },

      removePoliceCandidate: (playerId: number) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = get().getCurrentRound();
        if (currentRound?.policeElection) {
          const policeElection = {
            ...currentRound.policeElection,
            candidates: currentRound.policeElection.candidates.filter(
              (id) => id !== playerId
            ),
          };

          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound ? { ...r, policeElection } : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });

          // 添加退警日志
          const playerName =
            currentGame.players.find((p) => p.id === playerId)?.name ||
            `玩家${playerId}`;
          get().addActionLog(`${playerName} 退出警长竞选`);
        }
      },

      electSheriff: (playerId: number) => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            sheriff: playerId,
          },
        });

        // 添加警长当选日志
        const playerName =
          currentGame.players.find((p) => p.id === playerId)?.name ||
          `玩家${playerId}`;
        get().addActionLog(`${playerName} 当选警长`);
      },

      addNightDeath: (playerId: number, reason: string) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = get().getCurrentRound();
        if (currentRound) {
          const nightDeaths = currentRound.nightDeaths || [];
          if (!nightDeaths.includes(playerId)) {
            nightDeaths.push(playerId);

            const updatedRounds = currentGame.rounds.map((r) =>
              r.number === currentGame.currentRound ? { ...r, nightDeaths } : r
            );

            set({
              currentGame: {
                ...currentGame,
                rounds: updatedRounds,
              },
            });

            // 同时设置玩家死亡状态
            get().setPlayerAlive(playerId, false, "werewolf_kill");
            get().addActionLog(`玩家${playerId}在夜晚死亡：${reason}`, true);
          }
        }
      },

      addActionLog: (message: string, isPrivate: boolean = false) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const logMessage = isPrivate ? `[私密] ${message}` : message;
        const currentRound = get().getCurrentRound();

        if (currentRound) {
          const updatedActionLog = [...currentRound.actionLog, logMessage];

          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, actionLog: updatedActionLog }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        }
      },

      getVisibleLogs: () => {
        const { currentGame } = get();
        if (!currentGame) return [];

        const allLogs: string[] = [];
        currentGame.rounds.forEach((round) => {
          round.actionLog.forEach((log) => {
            if (currentGame.userRole === "god" || !log.startsWith("[私密]")) {
              allLogs.push(`第${round.number}回合: ${log}`);
            }
          });
        });

        return allLogs;
      },

      setUserRole: (role: "god" | "player") => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            userRole: role,
          },
        });
      },

      resolveNightActions: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = get().getCurrentRound();
        if (!currentRound || !currentRound.nightActions) return;

        // 检查是否已经结算过
        if (currentRound.isNightResolved) {
          alert("当前夜晚已经结算过，不能重复结算！");
          return;
        }

        // 获取所有夜间行动
        const werewolfKills = currentRound.nightActions.filter(
          (action) => action.actionType === "werewolf_kill"
        );
        const witchSaves = currentRound.nightActions.filter(
          (action) => action.actionType === "witch_save"
        );
        const witchPoisons = currentRound.nightActions.filter(
          (action) => action.actionType === "witch_poison"
        );
        const guardProtects = currentRound.nightActions.filter(
          (action) => action.actionType === "guard_protect"
        );

        const finalDeaths: number[] = [];

        // 第一步：处理女巫毒杀（最高优先级，无法阻挡）
        witchPoisons.forEach((poison) => {
          if (poison.targetId && !finalDeaths.includes(poison.targetId)) {
            finalDeaths.push(poison.targetId);
            get().addActionLog(
              `女巫毒死了 ${
                currentGame.players.find((p) => p.id === poison.targetId)
                  ?.name || `玩家${poison.targetId}`
              }`,
              true
            );
          }
        });

        // 第二步：处理狼人击杀
        werewolfKills.forEach((kill) => {
          if (kill.targetId && !finalDeaths.includes(kill.targetId)) {
            // 检查女巫是否救了这个人
            const isSaved = witchSaves.some(
              (save) => save.targetId === kill.targetId
            );

            // 检查守卫是否保护了这个人
            const isProtected = guardProtects.some(
              (protect) => protect.targetId === kill.targetId
            );

            let isKilled = true;
            let deathReason = "";

            if (isSaved && isProtected) {
              // 规则：如果守卫守了某人，女巫同时也救了这个人，那么这个人也会死
              isKilled = true;
              deathReason = "守卫保护和女巫解药同时作用导致死亡";
              get().addActionLog(
                `${
                  currentGame.players.find((p) => p.id === kill.targetId)
                    ?.name || `玩家${kill.targetId}`
                } 同时受到守卫保护和女巫解药，相互抵消导致死亡`,
                true
              );
            } else if (isSaved) {
              // 只有女巫救药，成功救活
              isKilled = false;
              get().addActionLog(
                `女巫使用解药救了 ${
                  currentGame.players.find((p) => p.id === kill.targetId)
                    ?.name || `玩家${kill.targetId}`
                }`,
                true
              );
            } else if (isProtected) {
              // 只有守卫保护，成功保护
              isKilled = false;
              get().addActionLog(
                `守卫保护了 ${
                  currentGame.players.find((p) => p.id === kill.targetId)
                    ?.name || `玩家${kill.targetId}`
                }`,
                true
              );
            }

            if (isKilled) {
              finalDeaths.push(kill.targetId);
              if (!deathReason) {
                get().addActionLog(
                  `狼人击杀了 ${
                    currentGame.players.find((p) => p.id === kill.targetId)
                      ?.name || `玩家${kill.targetId}`
                  }`,
                  true
                );
              }
            }
          }
        });

        // 执行最终死亡
        finalDeaths.forEach((playerId) => {
          get().setPlayerAlive(playerId, false, "werewolf_kill");
          const playerName =
            currentGame.players.find((p) => p.id === playerId)?.name ||
            `玩家${playerId}`;
          get().addActionLog(`${playerName} 在夜晚死亡`);
        });

        // 如果没有人死亡
        if (finalDeaths.length === 0) {
          get().addActionLog("昨夜是平安夜，没有人死亡");
        }

        // 标记夜晚已结算
        const updatedRounds = currentGame.rounds.map((r) =>
          r.number === currentGame.currentRound
            ? { ...r, isNightResolved: true }
            : r
        );

        set({
          currentGame: {
            ...currentGame,
            rounds: updatedRounds,
          },
        });
      },

      resolveDayVoting: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentRound = get().getCurrentRound();
        if (
          !currentRound ||
          !currentRound.votes ||
          currentRound.votes.length === 0
        ) {
          get().addActionLog("今天没有进行投票");
          return;
        }

        // 检查是否已经结算过
        if (currentRound.isDayResolved) {
          alert("当前白天已经结算过，不能重复结算！");
          return;
        }

        // 统计投票结果
        const voteCount: { [key: number]: number } = {};
        const abstainCount = { abstain: 0 };

        currentRound.votes.forEach((vote) => {
          if (vote.targetId === "abstain") {
            abstainCount.abstain += 1;
          } else {
            voteCount[vote.targetId as number] =
              (voteCount[vote.targetId as number] || 0) + 1;
          }
        });

        // 找出得票最多的玩家
        const maxVotes = Math.max(...Object.values(voteCount), 0);
        const topCandidates = Object.entries(voteCount)
          .filter(([, count]) => count === maxVotes && count > 0)
          .map(([playerId]) => parseInt(playerId));

        // 记录投票结果到日志
        let resultLog = "投票结果统计：";
        Object.entries(voteCount).forEach(([playerId, count]) => {
          const playerName =
            currentGame.players.find((p) => p.id === parseInt(playerId))
              ?.name || `玩家${playerId}`;
          resultLog += ` ${playerName}(${count}票)`;
        });
        if (abstainCount.abstain > 0) {
          resultLog += ` 弃票(${abstainCount.abstain}票)`;
        }
        get().addActionLog(resultLog);

        if (topCandidates.length === 1 && maxVotes > 0) {
          // 有明确的出局者
          const eliminatedId = topCandidates[0];
          const playerName =
            currentGame.players.find((p) => p.id === eliminatedId)?.name ||
            `玩家${eliminatedId}`;

          get().setPlayerAlive(eliminatedId, false, "vote");
          get().addActionLog(`${playerName} 被投票出局`);

          // 更新回合的出局记录
          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, eliminated: eliminatedId, isDayResolved: true }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        } else if (topCandidates.length > 1) {
          // 平票情况
          const tiedPlayers = topCandidates
            .map(
              (id) =>
                currentGame.players.find((p) => p.id === id)?.name ||
                `玩家${id}`
            )
            .join("、");
          get().addActionLog(
            `平票！${tiedPlayers} 各得 ${maxVotes} 票，需要重新投票或法官决定`
          );

          // 平票情况也标记为已结算，但不设置出局者
          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, isDayResolved: true }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        } else {
          // 没有人得票或全部弃票
          get().addActionLog("没有玩家得票，今天没有人出局");

          // 标记为已结算
          const updatedRounds = currentGame.rounds.map((r) =>
            r.number === currentGame.currentRound
              ? { ...r, isDayResolved: true }
              : r
          );

          set({
            currentGame: {
              ...currentGame,
              rounds: updatedRounds,
            },
          });
        }
      },

      isCurrentRoundResolved: () => {
        const { currentGame } = get();
        if (!currentGame) return false;

        const currentRound = get().getCurrentRound();
        if (!currentRound) return false;

        if (currentGame.currentPhase === "day") {
          return currentRound.isDayResolved || false;
        } else {
          return currentRound.isNightResolved || false;
        }
      },
    }),
    {
      name: "werewolf-game-storage",
      partialize: (state) => ({ games: state.games }),
    }
  )
);
