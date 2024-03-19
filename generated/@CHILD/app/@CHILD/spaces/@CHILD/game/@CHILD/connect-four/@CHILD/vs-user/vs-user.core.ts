import { Posix } from "gamezilla-app/@SHARED/core";
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { ColumnIndex, Columns, EMPTY_COLUMNS, MoveProblem, PlayerType, dropDisc, toStatus, toTurn, } from "../../@SHARED/connect-four/connect-four";
import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space";
//
//
//
// Model
//
//
//
export type ModelClient = {
    openedModal: "confirm-resign" | null;
    ghostIndex: ColumnIndex | null;
};
export type ModelServer = null;
//
//
//
// Msg
//
//
//
export type MsgServer = {
    t: null;
};
export type MsgClient = MsgSync | {
    t: "hovered-over-columns";
    columnIndex: ColumnIndex;
} | {
    t: "clicked-resign";
    userId: UserId;
} | {
    t: "close-modal";
};
export type MsgToServer = {
    t: null;
};
export type MsgToClient = {
    t: null;
};
//
//
//
//
//
export type MsgSync = 
//
{
    t: "user-stopped-playing";
    userId: UserId;
} | {
    t: "user-started-playing";
    userId: UserId;
    playerType: PlayerType;
} | {
    t: "user-inputted-move-time-limit";
    userId: UserId;
    moveTimeLimit: MoveTimeLimit;
} | {
    t: "user-dropped-disc";
    columnIndex: ColumnIndex;
    userId: UserId;
} | {
    t: "user-started-game";
    userId: UserId;
} | {
    t: "user-stopped-game";
    userId: UserId;
} | {
    t: "user-requested-rematch";
    userId: UserId;
} | {
    t: "user-responded-to-rematch-request";
    userId: UserId;
    response: "Accept" | "Decline";
} | {
    t: "user-cancelled-rematch";
    userId: UserId;
} | {
    t: "user-resigned";
    userId: UserId;
} | {
    t: "time-passed";
    currentTime: Posix;
} | {
    t: "user-left";
    userId: UserId;
};
type EventError = {
    t: "not-playing";
} | {
    t: "move";
    c: MoveProblem;
};
export type ModelSync = StateSetup | StateGame | StateGameOver;
export const initSync = (ctx: SpaceCtx): ModelSync => {
    return {
        type: "setup",
        moveTimeLimit: 5,
        players: {
            "player-one": ctx.space.hostId,
            "player-two": null,
        },
        errors: {},
    };
};
type Errors = {
    errors: {
        [eventId: string]: MsgSync & {
            error: EventError;
        };
    };
};
const addError = (modelSync: ModelSync, msgSync: MsgSync, error: EventError): ModelSync => {
    return {
        ...modelSync,
        errors: {
            ...modelSync.errors,
            [JSON.stringify(msgSync)]: { ...msgSync, error },
        },
    };
};
export type StateSetup = Errors & {
    type: "setup";
    moveTimeLimit: MoveTimeLimit;
    players: {
        [playerType in PlayerType]: UserId | null;
    };
};
export type StateGame = Errors & {
    type: "game";
    moveTimeLimit: MoveTimeLimit;
    columns: Columns;
    gameId: number;
    lastMoveAt: Posix;
    players: {
        [playerType in PlayerType]: UserId;
    };
};
export type StateGameOver = Errors & {
    type: "game-over";
    moveTimeLimit: MoveTimeLimit;
    columns: Columns;
    gameId: number;
    gameOver: GameOver;
    rematch: Rematch;
    players: {
        [playerType in PlayerType]: UserId;
    };
};
export type Rematch = {
    type: "NotAsking";
} | {
    type: "Asking";
    asker: PlayerType;
};
export type GameOver = {
    type: "Draw";
} | {
    type: "Winner";
    winner: PlayerType;
} | {
    type: "resignation";
    resigner: PlayerType;
};
export const toGameOver = (modelSync: ModelSync): GameOver | {
    type: "none";
} => {
    if (modelSync.type === "setup") {
        return { type: "none" };
    }
    const status = toStatus(modelSync.columns);
    if (status.type === "Tie") {
        return { type: "Draw" };
    }
    if (status.type === "Winner") {
        return { type: "Winner", winner: status.winner };
    }
    return { type: "none" };
};
export type MoveTimeLimit = 5 | 7 | 9;
export const allMoveTimeLimit: {
    [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit;
} = {
    "5": 5,
    "7": 7,
    "9": 9,
};
export const reducer = (modelSync: ModelSync, msgSync: MsgSync): ModelSync => {
    switch (modelSync.type) {
        case "setup": {
            switch (msgSync.t) {
                case "user-started-playing": {
                    if (modelSync.players[msgSync.playerType] !== null) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        players: {
                            ...modelSync.players,
                            [msgSync.playerType]: msgSync.userId,
                        },
                    };
                }
                case "user-stopped-playing": {
                    const playerType = toPlayerType(msgSync.userId, modelSync);
                    if (!playerType) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        players: {
                            ...modelSync.players,
                            [playerType]: null,
                        },
                    };
                }
                case "user-inputted-move-time-limit": {
                    return {
                        ...modelSync,
                        moveTimeLimit: msgSync.moveTimeLimit,
                    };
                }
                case "user-started-game": {
                    const playerOne = modelSync.players["player-one"];
                    const playerTwo = modelSync.players["player-two"];
                    if (!playerOne || !playerTwo) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        errors: modelSync.errors,
                        type: "game",
                        columns: EMPTY_COLUMNS,
                        moveTimeLimit: modelSync.moveTimeLimit,
                        lastMoveAt: Posix.now(),
                        gameId: 0,
                        players: {
                            "player-one": playerOne,
                            "player-two": playerTwo,
                        },
                    };
                }
                default: {
                    return modelSync;
                }
            }
        }
        case "game": {
            switch (msgSync.t) {
                case "user-dropped-disc": {
                    const turn = toTurn(modelSync.columns);
                    const dropped = dropDisc(modelSync.columns, msgSync.columnIndex, turn);
                    if (dropped.t === "err") {
                        return addError(modelSync, msgSync, {
                            t: "move",
                            c: dropped.error,
                        });
                    }
                    return {
                        ...modelSync,
                        columns: dropped.value,
                        // lastMoveAt: msgSync.happenedAt,
                    };
                }
                case "user-resigned": {
                    const resignedPlayer = toPlayerType(msgSync.userId, modelSync);
                    if (!resignedPlayer) {
                        return addError(modelSync, msgSync, {
                            t: "not-playing",
                        });
                    }
                    return {
                        ...modelSync,
                        type: "game-over",
                        gameOver: {
                            type: "resignation",
                            resigner: resignedPlayer,
                        },
                        rematch: { type: "NotAsking" },
                    };
                }
                case "time-passed": {
                    return modelSync;
                }
            }
            return modelSync;
        }
        case "game-over": {
            return modelSync;
        }
    }
};
export const toPlayerType = (userId: UserId, modelSync: ModelSync): PlayerType | null => {
    if (modelSync.players["player-one"] === userId) {
        return "player-one";
    }
    if (modelSync.players["player-two"] === userId) {
        return "player-two";
    }
    return null;
};
