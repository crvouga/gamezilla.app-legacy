import {
  VsBotGame,
  VsBotSetup,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix, TimeSpan } from "gamezilla/@SHARED/core";
import {
  EventMeta,
  EventId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import * as ConnectFour from "../../@SHARED/connect-four";

//
//
// Model
//
//

export type ServerModel = {
  botStartedFindingMoveAt: Posix | null;
};

export function isBotMoving(now: Posix, model: ServerModel) {
  if (!model.botStartedFindingMoveAt) {
    return false;
  }
  return TimeSpan.lte(
    Posix.diff(now, model.botStartedFindingMoveAt),
    TimeSpan.fromSeconds(5)
  );
}

export type ClientModel = {
  vsBotSetup: VsBotSetup.Model;
  vsBotGame: VsBotGame.Model;
};

//
//
// Msg
//
//

export type ClientMsg =
  | GameEvent
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type ServerMsg =
  | {
      t: "bot-found-best-move";
      found: ConnectFour.BestMoveResult;
      startedAt: Posix;
    }
  | {
      t: "time-passed";
    };

export type ToClient = { t: null };

export type ToServer = { t: null };

export type GameEvent =
  | {
      t: "user-dropped-disc";
      columnIndex: ConnectFour.ColumnIndex;
      userId: UserId;
    }
  | { t: "user-left"; userId: UserId }
  | { t: "bot-dropped-disc"; columnIndex: ConnectFour.ColumnIndex }
  | {
      t: "user-started-playing";
      userId: UserId;
      playerType: ConnectFour.PlayerType;
    }
  | { t: "user-stopped-playing"; userId: UserId }
  | { t: "user-started-game"; userId: UserId }
  | { t: "user-stopped-game"; userId: UserId }
  | { t: "user-swapped-sides"; userId: UserId }
  | { t: "user-changed-bot-level"; botLevel: BotLevel; userId: UserId }
  | { t: "time-passed"; now: Posix }
  | { t: "user-restarted-game"; userId: UserId };

type EventErr =
  | { t: "not-playing" }
  | { t: "move"; c: ConnectFour.MoveProblem };

export const msgEventErrorToString = ({
  error,
}: {
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

export type GameState = (StateSetup | StateGame) & {
  errors: {
    [msgEventId: EventId]: GameEvent & { error: EventErr };
  };
};

export const initState = (input: SpaceCtx): GameState => {
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

export const reducer = ({
  modelGameState,
  msgGameEvent,
}: {
  modelGameState: GameState;
  msgGameEvent: GameEvent & EventMeta;
}): GameState => {
  switch (modelGameState.type) {
    case "setup": {
      switch (msgGameEvent.t) {
        case "user-started-playing": {
          return {
            ...modelGameState,
            playingUserId: msgGameEvent.userId,
            userPlayerType: msgGameEvent.playerType,
          };
        }

        case "user-stopped-playing": {
          if (modelGameState.playingUserId !== msgGameEvent.userId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            playingUserId: null,
          };
        }

        case "user-swapped-sides": {
          if (modelGameState.playingUserId !== msgGameEvent.userId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            userPlayerType: ConnectFour.opposite[modelGameState.userPlayerType],
          };
        }

        case "user-started-game": {
          if (modelGameState.playingUserId !== msgGameEvent.userId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            type: "game",
            playingUserId: modelGameState.playingUserId,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-changed-bot-level": {
          if (modelGameState.playingUserId !== msgGameEvent.userId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }
          return {
            ...modelGameState,
            botLevel: msgGameEvent.botLevel,
          };
        }

        case "bot-dropped-disc": {
          return addError(modelGameState, msgGameEvent, { t: "not-playing" });
        }

        default: {
          return modelGameState;
        }
      }
    }

    case "game": {
      switch (msgGameEvent.t) {
        case "bot-dropped-disc": {
          const moved = ConnectFour.dropDisc(
            modelGameState.columns,
            msgGameEvent.columnIndex,
            toBotPlayer(modelGameState)
          );

          if (moved.t === "err") {
            return addError(modelGameState, msgGameEvent, {
              t: "move",
              c: moved.error,
            });
          }

          return { ...modelGameState, columns: moved.value };
        }

        case "user-dropped-disc": {
          if (modelGameState.playingUserId !== msgGameEvent.userId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          const moved = ConnectFour.dropDisc(
            modelGameState.columns,
            msgGameEvent.columnIndex,
            modelGameState.userPlayerType
          );

          if (moved.t === "err") {
            return addError(modelGameState, msgGameEvent, {
              t: "move",
              c: moved.error,
            });
          }

          return { ...modelGameState, columns: moved.value };
        }

        case "user-left": {
          if (msgGameEvent.userId === modelGameState.playingUserId) {
            return {
              ...modelGameState,
              type: "setup",
              botLevel: modelGameState.botLevel,
              userPlayerType: modelGameState.userPlayerType,
              playingUserId: null,
            };
          }
          return modelGameState;
        }

        case "user-stopped-game": {
          if (msgGameEvent.userId !== modelGameState.playingUserId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            type: "setup",
            botLevel: modelGameState.botLevel,
            userPlayerType: modelGameState.userPlayerType,
            playingUserId: modelGameState.playingUserId,
          };
        }

        case "user-swapped-sides": {
          if (msgGameEvent.userId !== modelGameState.playingUserId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            userPlayerType: ConnectFour.opposite[modelGameState.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-restarted-game": {
          if (msgGameEvent.userId !== modelGameState.playingUserId) {
            return addError(modelGameState, msgGameEvent, { t: "not-playing" });
          }

          return {
            ...modelGameState,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        default: {
          return modelGameState;
        }
      }
    }
  }
};

const addError = (
  state: GameState,
  msgEvent: GameEvent & EventMeta,
  error: EventErr
): GameState => {
  return {
    ...state,
    errors: {
      ...state.errors,
      [msgEvent.msgEventId]: { ...msgEvent, error },
    },
  };
};

export const isBotTurn = (state: GameState): boolean => {
  if (state.type !== "game") {
    return false;
  }
  const status = ConnectFour.toStatus(state.columns);
  return (
    status.type === "Playing" &&
    status.turn === ConnectFour.opposite[state.userPlayerType]
  );
};

export const toBotPlayer = (state: GameState): ConnectFour.PlayerType => {
  return ConnectFour.opposite[state.userPlayerType];
};

export type GameOver =
  | { type: "Tie" }
  | { type: "Winner"; winner: ConnectFour.PlayerType };

export const toGameOver = (model: GameState): GameOver | { type: null } => {
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

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

export const allBotLevels: BotLevel[] = ["Easy", "Medium", "Hard"];
