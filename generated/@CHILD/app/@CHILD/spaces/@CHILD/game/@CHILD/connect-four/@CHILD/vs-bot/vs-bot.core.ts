import { VsBotGame, VsBotSetup, } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot";
import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { Posix, TimeSpan } from "gamezilla-app/@SHARED/core";
import { EventMeta, EventId, } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event";
import * as ConnectFour from "../../@SHARED/connect-four";
//
//
// Model
//
//
export type ModelServer = {
    botStartedFindingMoveAt: Posix | null;
};
export function isBotMoving(now: Posix, model: ModelServer) {
    if (!model.botStartedFindingMoveAt) {
        return false;
    }
    return TimeSpan.lte(Posix.diff(now, model.botStartedFindingMoveAt), TimeSpan.fromSeconds(5));
}
export type ModelClient = {
    vsBotSetup: VsBotSetup.Model;
    vsBotGame: VsBotGame.Model;
};
//
//
// Msg
//
//
export type MsgClient = MsgSync | {
    t: "vs-bot-setup";
    c: VsBotSetup.Msg;
} | {
    t: "vs-bot-game";
    c: VsBotGame.Msg;
};
export type MsgServer = {
    t: "bot-found-best-move";
    found: ConnectFour.BestMoveResult;
    startedAt: Posix;
} | {
    t: "time-passed";
};
export type MsgToClient = {
    t: null;
};
export type MsgToServer = {
    t: null;
};
export type MsgSync = {
    t: "user-dropped-disc";
    columnIndex: ConnectFour.ColumnIndex;
    userId: UserId;
} | {
    t: "user-left";
    userId: UserId;
} | {
    t: "bot-dropped-disc";
    columnIndex: ConnectFour.ColumnIndex;
} | {
    t: "user-started-playing";
    userId: UserId;
    playerType: ConnectFour.PlayerType;
} | {
    t: "user-stopped-playing";
    userId: UserId;
} | {
    t: "user-started-game";
    userId: UserId;
} | {
    t: "user-stopped-game";
    userId: UserId;
} | {
    t: "user-swapped-sides";
    userId: UserId;
} | {
    t: "user-changed-bot-level";
    botLevel: BotLevel;
    userId: UserId;
} | {
    t: "time-passed";
    now: Posix;
} | {
    t: "user-restarted-game";
    userId: UserId;
};
type EventErr = {
    t: "not-playing";
} | {
    t: "move";
    c: ConnectFour.MoveProblem;
};
export const msgSyncErrorToString = ({ error, }: {
    error: EventErr;
}): string => {
    switch (error.t) {
        case "not-playing": {
            return "You're not playing";
        }
        case "move": {
            return ConnectFour.moveProblemToString(error.c);
        }
    }
};
export type ModelSync = (StateSetup | StateGame) & {
    errors: {
        [eventId: EventId]: MsgSync & {
            error: EventErr;
        };
    };
};
export const initSync = (input: SpaceCtx): ModelSync => {
    return {
        type: "setup",
        botLevel: "Medium",
        userPlayerType: "player-one",
        playingUserId: input.space.hostId,
        errors: {},
    };
};
export type StateSetup = {
    type: "setup";
    userPlayerType: ConnectFour.PlayerType;
    botLevel: BotLevel;
    playingUserId: UserId | null;
};
export type StateGame = {
    type: "game";
    userPlayerType: ConnectFour.PlayerType;
    botLevel: BotLevel;
    playingUserId: UserId;
    columns: ConnectFour.Columns;
};
export const reducer = ({ modelSync, msgSync, }: {
    modelSync: ModelSync;
    msgSync: MsgSync & EventMeta;
}): ModelSync => {
    switch (modelSync.type) {
        case "setup": {
            switch (msgSync.t) {
                case "user-started-playing": {
                    return {
                        ...modelSync,
                        playingUserId: msgSync.userId,
                        userPlayerType: msgSync.playerType,
                    };
                }
                case "user-stopped-playing": {
                    if (modelSync.playingUserId !== msgSync.userId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        playingUserId: null,
                    };
                }
                case "user-swapped-sides": {
                    if (modelSync.playingUserId !== msgSync.userId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        userPlayerType: ConnectFour.opposite[modelSync.userPlayerType],
                    };
                }
                case "user-started-game": {
                    if (modelSync.playingUserId !== msgSync.userId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        type: "game",
                        playingUserId: modelSync.playingUserId,
                        columns: ConnectFour.EMPTY_COLUMNS,
                    };
                }
                case "user-changed-bot-level": {
                    if (modelSync.playingUserId !== msgSync.userId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        botLevel: msgSync.botLevel,
                    };
                }
                case "bot-dropped-disc": {
                    return addError(modelSync, msgSync, { t: "not-playing" });
                }
                default: {
                    return modelSync;
                }
            }
        }
        case "game": {
            switch (msgSync.t) {
                case "bot-dropped-disc": {
                    const moved = ConnectFour.dropDisc(modelSync.columns, msgSync.columnIndex, toBotPlayer(modelSync));
                    if (moved.t === "err") {
                        return addError(modelSync, msgSync, {
                            t: "move",
                            c: moved.error,
                        });
                    }
                    return { ...modelSync, columns: moved.value };
                }
                case "user-dropped-disc": {
                    if (modelSync.playingUserId !== msgSync.userId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    const moved = ConnectFour.dropDisc(modelSync.columns, msgSync.columnIndex, modelSync.userPlayerType);
                    if (moved.t === "err") {
                        return addError(modelSync, msgSync, {
                            t: "move",
                            c: moved.error,
                        });
                    }
                    return { ...modelSync, columns: moved.value };
                }
                case "user-left": {
                    if (msgSync.userId === modelSync.playingUserId) {
                        return {
                            ...modelSync,
                            type: "setup",
                            botLevel: modelSync.botLevel,
                            userPlayerType: modelSync.userPlayerType,
                            playingUserId: null,
                        };
                    }
                    return modelSync;
                }
                case "user-stopped-game": {
                    if (msgSync.userId !== modelSync.playingUserId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        type: "setup",
                        botLevel: modelSync.botLevel,
                        userPlayerType: modelSync.userPlayerType,
                        playingUserId: modelSync.playingUserId,
                    };
                }
                case "user-swapped-sides": {
                    if (msgSync.userId !== modelSync.playingUserId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        userPlayerType: ConnectFour.opposite[modelSync.userPlayerType],
                        columns: ConnectFour.EMPTY_COLUMNS,
                    };
                }
                case "user-restarted-game": {
                    if (msgSync.userId !== modelSync.playingUserId) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        columns: ConnectFour.EMPTY_COLUMNS,
                    };
                }
                default: {
                    return modelSync;
                }
            }
        }
    }
};
const addError = (modelSync: ModelSync, msgSync: MsgSync & EventMeta, error: EventErr): ModelSync => {
    return {
        ...modelSync,
        errors: {
            ...modelSync.errors,
            [msgSync.eventId]: { ...msgSync, error },
        },
    };
};
export const isBotTurn = (modelSync: ModelSync): boolean => {
    if (modelSync.type !== "game") {
        return false;
    }
    const status = ConnectFour.toStatus(modelSync.columns);
    return (status.type === "Playing" &&
        status.turn === ConnectFour.opposite[modelSync.userPlayerType]);
};
export const toBotPlayer = (modelSync: ModelSync): ConnectFour.PlayerType => {
    return ConnectFour.opposite[modelSync.userPlayerType];
};
export type GameOver = {
    type: "Tie";
} | {
    type: "Winner";
    winner: ConnectFour.PlayerType;
};
export const toGameOver = (model: ModelSync): GameOver | {
    type: null;
} => {
    switch (model.type) {
        case "game": {
            const status = ConnectFour.toStatus(model.columns);
            switch (status.type) {
                case "Playing": {
                    return { type: null };
                }
                case "Tie": {
                    return { type: "Tie" };
                }
                case "Winner": {
                    return { type: "Winner", winner: status.winner };
                }
                default: {
                    return { type: null };
                }
            }
        }
        case "setup": {
            return { type: null };
        }
    }
};
export type BotLevel = "Easy" | "Medium" | "Hard";
export const botLevel: {
    [botLevel in BotLevel]: BotLevel;
} = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
};
export const allBotLevels: BotLevel[] = ["Easy", "Medium", "Hard"];
