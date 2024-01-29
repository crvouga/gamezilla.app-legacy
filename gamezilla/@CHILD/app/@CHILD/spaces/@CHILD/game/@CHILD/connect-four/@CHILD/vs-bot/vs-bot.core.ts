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

export type MsgClient =
  | MsgGame
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type MsgServer =
  | {
      t: "bot-found-best-move";
      found: ConnectFour.BestMoveResult;
      startedAt: Posix;
    }
  | {
      t: "time-passed";
    };

export type MsgToClient = { t: null };

export type MsgToServer = { t: null };

export type MsgGame =
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

export const msgGameErrorToString = ({
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

export type ModelGame = (StateSetup | StateGame) & {
  errors: {
    [eventId: EventId]: MsgGame & { error: EventErr };
  };
};

export const initGame = (input: SpaceCtx): ModelGame => {
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
  modelGame,
  msgGame,
}: {
  modelGame: ModelGame;
  msgGame: MsgGame & EventMeta;
}): ModelGame => {
  switch (modelGame.type) {
    case "setup": {
      switch (msgGame.t) {
        case "user-started-playing": {
          return {
            ...modelGame,
            playingUserId: msgGame.userId,
            userPlayerType: msgGame.playerType,
          };
        }

        case "user-stopped-playing": {
          if (modelGame.playingUserId !== msgGame.userId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            playingUserId: null,
          };
        }

        case "user-swapped-sides": {
          if (modelGame.playingUserId !== msgGame.userId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            userPlayerType: ConnectFour.opposite[modelGame.userPlayerType],
          };
        }

        case "user-started-game": {
          if (modelGame.playingUserId !== msgGame.userId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            type: "game",
            playingUserId: modelGame.playingUserId,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-changed-bot-level": {
          if (modelGame.playingUserId !== msgGame.userId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }
          return {
            ...modelGame,
            botLevel: msgGame.botLevel,
          };
        }

        case "bot-dropped-disc": {
          return addError(modelGame, msgGame, { t: "not-playing" });
        }

        default: {
          return modelGame;
        }
      }
    }

    case "game": {
      switch (msgGame.t) {
        case "bot-dropped-disc": {
          const moved = ConnectFour.dropDisc(
            modelGame.columns,
            msgGame.columnIndex,
            toBotPlayer(modelGame)
          );

          if (moved.t === "err") {
            return addError(modelGame, msgGame, {
              t: "move",
              c: moved.error,
            });
          }

          return { ...modelGame, columns: moved.value };
        }

        case "user-dropped-disc": {
          if (modelGame.playingUserId !== msgGame.userId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          const moved = ConnectFour.dropDisc(
            modelGame.columns,
            msgGame.columnIndex,
            modelGame.userPlayerType
          );

          if (moved.t === "err") {
            return addError(modelGame, msgGame, {
              t: "move",
              c: moved.error,
            });
          }

          return { ...modelGame, columns: moved.value };
        }

        case "user-left": {
          if (msgGame.userId === modelGame.playingUserId) {
            return {
              ...modelGame,
              type: "setup",
              botLevel: modelGame.botLevel,
              userPlayerType: modelGame.userPlayerType,
              playingUserId: null,
            };
          }
          return modelGame;
        }

        case "user-stopped-game": {
          if (msgGame.userId !== modelGame.playingUserId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            type: "setup",
            botLevel: modelGame.botLevel,
            userPlayerType: modelGame.userPlayerType,
            playingUserId: modelGame.playingUserId,
          };
        }

        case "user-swapped-sides": {
          if (msgGame.userId !== modelGame.playingUserId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            userPlayerType: ConnectFour.opposite[modelGame.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-restarted-game": {
          if (msgGame.userId !== modelGame.playingUserId) {
            return addError(modelGame, msgGame, { t: "not-playing" });
          }

          return {
            ...modelGame,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        default: {
          return modelGame;
        }
      }
    }
  }
};

const addError = (
  modelGame: ModelGame,
  msgGame: MsgGame & EventMeta,
  error: EventErr
): ModelGame => {
  return {
    ...modelGame,
    errors: {
      ...modelGame.errors,
      [msgGame.eventId]: { ...msgGame, error },
    },
  };
};

export const isBotTurn = (modelGame: ModelGame): boolean => {
  if (modelGame.type !== "game") {
    return false;
  }
  const status = ConnectFour.toStatus(modelGame.columns);
  return (
    status.type === "Playing" &&
    status.turn === ConnectFour.opposite[modelGame.userPlayerType]
  );
};

export const toBotPlayer = (modelGame: ModelGame): ConnectFour.PlayerType => {
  return ConnectFour.opposite[modelGame.userPlayerType];
};

export type GameOver =
  | { type: "Tie" }
  | { type: "Winner"; winner: ConnectFour.PlayerType };

export const toGameOver = (model: ModelGame): GameOver | { type: null } => {
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
