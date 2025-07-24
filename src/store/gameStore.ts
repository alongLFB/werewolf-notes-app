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
  PoliceElection,
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
              break;
            case "seer_check":
              logMessage = `预言家 ${actorName} 查验 ${targetName}`;
              if (action.result) {
                logMessage += `，结果：${
                  action.result === "good" ? "好人" : "狼人"
                }`;
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
        }
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
    }),
    {
      name: "werewolf-game-storage",
      partialize: (state) => ({ games: state.games }),
    }
  )
);
