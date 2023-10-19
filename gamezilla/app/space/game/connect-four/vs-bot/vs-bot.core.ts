import { err, ok, Posix, Result, Uuid } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { VsBotGame, VsBotSetup } from "gamezilla/app/space/game/@SHARED";
import {
  BestMoveResult,
  ColumnIndex,
  Columns,
  PlayerType,
  emptyColumns,
  move,
  opposite,
  toStatus,
} from "../connect-four";

//
//
// Model
//
//

export type CoreModel = { meta?: Meta; events?: Event[] } & (
  | SetupModel
  | GameModel
);

export type SetupModel = {
  type: "setup";
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId | null;
};

export type GameModel = {
  type: "game";
  gameId: number;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: Columns;
};

type Meta = {
  updatedAt: Posix;
};

export const isBotTurn = (model: CoreModel): boolean => {
  if (model.type !== "game") {
    return false;
  }
  const status = toStatus(model.columns);
  return (
    status.type === "Playing" && status.turn === opposite[model.userPlayerType]
  );
};

export const toBotPlayer = (model: CoreModel): PlayerType => {
  return opposite[model.userPlayerType];
};

export type ServerModel = CoreModel;

export type ClientModel = CoreModel & {
  vsBotSetup: VsBotSetup.Model;
  vsBotGame: VsBotGame.Model;
};

export const initCore = ({ player }: { player: UserId | null }): CoreModel => {
  return {
    type: "setup",
    botLevel: "Medium",
    player: player,
    userPlayerType: "player-one",
  };
};

//
//
//
//

export type GameOver = { type: "Tie" } | { type: "Winner"; winner: PlayerType };

export const toGameOver = (model: CoreModel): GameOver | { type: null } => {
  switch (model.type) {
    case "game": {
      const status = toStatus(model.columns);
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

//
//
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type ServerMsg = BotMoved;

export type ToClient = Res | Evt;

type BotMoved = { t: "bot-moved"; moved: BestMoveResult };

export type Evt = { t: "player-left"; userId: string } | BotMoved;

export type ToServer = Req;

export type Req =
  | { t: "start-playing"; playerType: PlayerType }
  | { t: "stop-playing" }
  | { t: "input-bot-level"; botLevel: BotLevel }
  | { t: "start-game" }
  | { t: "input-move"; columnIndex: ColumnIndex }
  | { t: "stop-game" }
  | { t: "swap-sides" }
  | { t: "restart" };

export type Res = Req & { result: Result<string, CoreModel> };

export type CoreMsg = Req | Evt;

type CoreCtx = { currentUserId: UserId; hostId: UserId };

//
//
//
//

export const updateCore = ({
  ctx,
  msg,
  model,
}: {
  ctx: CoreCtx;
  msg: Req;
  model: CoreModel;
}): Result<string, CoreModel> => {
  switch (model.type) {
    case "setup": {
      switch (msg.t) {
        case "start-playing": {
          return ok({
            ...model,
            userPlayerType: msg.playerType,
            player: ctx.currentUserId,
          });
        }

        case "stop-playing": {
          if (model.player !== ctx.currentUserId) {
            return err("not-allowed");
          }

          return ok({
            ...model,
            player: null,
          });
        }

        case "input-bot-level": {
          if (
            model.player !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.hostId
          ) {
            return err("not-allowed");
          }

          const modelNew: CoreModel = {
            ...model,
            botLevel: msg.botLevel,
          };

          return ok(modelNew);
        }

        case "start-game": {
          if (
            model.player !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.hostId
          ) {
            return err("not-allowed");
          }

          if (model.player === null) {
            return err("missing-player");
          }

          const modelNew: CoreModel = {
            type: "game",
            gameId: 0,
            botLevel: model.botLevel,
            player: model.player,
            userPlayerType: model.userPlayerType,
            columns: emptyColumns,
          };

          return ok(modelNew);
        }

        default: {
          return err("unhandled-request");
        }
      }
    }

    case "game": {
      switch (msg.t) {
        case "stop-game": {
          if (
            model.player !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.hostId
          ) {
            return err("not-playing");
          }

          const modelNew: CoreModel = {
            type: "setup",
            botLevel: model.botLevel,
            player: model.player,
            userPlayerType: model.userPlayerType,
          };

          return ok(modelNew);
        }

        case "swap-sides": {
          if (model.player !== ctx.currentUserId) {
            return err("not-playing");
          }

          const modelNew: CoreModel = {
            ...model,
            columns: emptyColumns,
            gameId: model.gameId + 1,
            userPlayerType: opposite[model.userPlayerType],
          };

          return ok(modelNew);
        }

        case "input-move": {
          if (model.player !== ctx.currentUserId) {
            return err("not-playing");
          }

          const result = move(
            model.columns,
            msg.columnIndex,
            model.userPlayerType
          );

          if (result.t === "err") {
            return result;
          }

          const modelNew: CoreModel = {
            ...model,
            columns: result.value,
          };

          return ok(modelNew);
        }

        case "restart": {
          if (model.player !== ctx.currentUserId) {
            return err("not-playing");
          }

          const modelNew: GameModel = {
            ...model,
            columns: emptyColumns,
            gameId: model.gameId + 1,
          };

          return ok(modelNew);
        }

        default: {
          return err("unhandled-request");
        }
      }
    }
  }
};

export const updateCoreEvent = ({
  msg,
  model,
}: {
  msg: Evt;
  model: CoreModel;
}): Result<string, CoreModel> => {
  if (msg.t === "bot-moved") {
    if (model.type !== "game") {
      return err("not-game");
    }

    const bestMoveResult = msg.moved;

    if (bestMoveResult.t === "err") {
      return bestMoveResult;
    }

    const columnIndex = bestMoveResult.value.columnIndex;

    if (typeof columnIndex !== "number") {
      return err("no-move-available");
    }

    const moveResult = move(
      model.columns,
      columnIndex,
      opposite[model.userPlayerType]
    );

    if (moveResult.t === "err") {
      return moveResult;
    }

    const modelNew: CoreModel = {
      ...model,
      columns: moveResult.value,
    };

    return ok(modelNew);
  }

  if (msg.t === "player-left") {
    if (model.player !== msg.userId) {
      return ok(model);
    }

    const modelNew: CoreModel = {
      type: "setup",
      botLevel: model.botLevel,
      userPlayerType: model.userPlayerType,
      player: null,
    };

    return ok(modelNew);
  }

  return err("unhandled-event");
};

type Event =
  | { t: "user-dropped-disc"; columnIndex: ColumnIndex }
  | { t: "user-left"; userId: UserId }
  | { t: "bot-dropped-disc"; columnIndex: ColumnIndex }
  | { t: "user-started-playing"; playerUserId: UserId; playerType: PlayerType }
  | { t: "user-stopped-playing"; playerUserId: UserId }
  | { t: "user-started-game" }
  | { t: "user-stopped-game" }
  | { t: "user-swapped-sides" }
  | { t: "user-changed-bot-level" }
  | { t: "time-passed"; now: Posix };

export type State = (StateSetup | StateGame) & {
  errors: (Event & { error: string })[];
};

const toInitialState = (input: { hostId: UserId }): State => {
  return {
    type: "setup",
    botLevel: "Medium",
    userPlayerType: "player-one",
    player: input.hostId,
    errors: [],
  };
};

export type StateSetup = {
  type: "setup";
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId | null;
};

export type StateGame = {
  type: "game";
  gameId: number;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: Columns;
};

export const reducer = (input: {
  ctx: { hostId: UserId };
  state: State;
  event: Event;
}): State => {
  const { state, event } = input;

  switch (state.type) {
    case "setup": {
      switch (event.t) {
        case "user-started-playing": {
          if (state.player !== null) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "already-playing" }],
            };
          }

          return {
            ...state,
            player: event.playerUserId,
            userPlayerType: event.playerType,
          };
        }
        default: {
          return state;
        }
      }
    }

    case "game": {
      switch (event.t) {
        case "bot-dropped-disc": {
          const moved = move(
            state.columns,
            event.columnIndex,
            toBotPlayer(state)
          );
          if (moved.t === "err") {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: moved.error }],
            };
          }
          return { ...state, columns: moved.value };
        }

        case "user-dropped-disc": {
          const moved = move(
            state.columns,
            event.columnIndex,
            state.userPlayerType
          );
          if (moved.t === "err") {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: moved.error }],
            };
          }
          return { ...state, columns: moved.value };
        }

        case "user-left": {
          if (event.userId === state.player) {
            return {
              type: "setup",
              botLevel: state.botLevel,
              userPlayerType: state.userPlayerType,
              player: null,
              errors: [],
            };
          }
          return state;
        }

        default: {
          return state;
        }
      }
    }
  }
};

const toState = (ctx: { hostId: UserId }, model: CoreModel): State => {
  return (model.events ?? []).reduce(
    (state, event) => reducer({ ctx, state, event }),
    toInitialState(ctx)
  );
};

type EventMeta = {
  id: Uuid;
  createdAt: Posix;
};

function appendEvent(
  ctx: { hostId: UserId },
  model: CoreModel,
  event: Event & EventMeta
): CoreModel {
  const eventsNew = [...(model.events ?? []), event];

  return {
    ...model,
    events: [...(model.events ?? []), event],
  };
}
