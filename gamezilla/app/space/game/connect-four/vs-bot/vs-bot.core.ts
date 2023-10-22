import { Posix, Uuid } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { VsBotGame, VsBotSetup } from "gamezilla/app/space/game/@SHARED";
import * as ConnectFour from "../connect-four";
import { SpaceCtx } from "gamezilla/app/space/@SHARED";
import { EvtMeta } from "gamezilla/app/space/@SHARED/evt";

//
//
// Model
//
//

export type CoreModel = {
  events: (Evt & EvtMeta)[];
  initialState: State;
};

export type ServerModel = CoreModel;

export type ClientModel = CoreModel & {
  opened: "activity-feed-drawer" | null;
  vsBotSetup: VsBotSetup.Model;
  vsBotGame: VsBotGame.Model;
};

export const initCore = (input: { hostId: UserId }): CoreModel => {
  return {
    events: [],
    initialState: initState(input),
  };
};

//
//
// Msg
//
//

export type ClientMsg =
  | Evt
  | { t: "opened-activity-feed-drawer" }
  | { t: "closed-activity-feed-drawer" }
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type ServerMsg = Evt;

export type ToClient = Evt & EvtMeta;

export type ToServer = Evt & EvtMeta;

export type Evt =
  | {
      t: "user-dropped-disc";
      columnIndex: ConnectFour.ColumnIndex;
      userId: UserId;
    }
  | { t: "user-left"; userId: UserId }
  | {
      t: "bot-dropped-disc";
      columnIndex: ConnectFour.ColumnIndex;
    }
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

type EvtError =
  | { t: "not-playing" }
  | { t: "move"; c: ConnectFour.MoveProblem };

export const eventErrorToString = ({ error }: { error: EvtError }): string => {
  switch (error.t) {
    case "not-playing": {
      return "You're not playing";
    }
    case "move": {
      return ConnectFour.moveProblemToString(error.c);
    }
  }
};

export type State = (StateSetup | StateGame) & {
  errors: {
    [eventId: string]: Evt & EvtMeta & { error: EvtError };
  };
};

export const initState = (input: SpaceCtx): State => {
  return {
    type: "setup",
    botLevel: "Medium",
    userPlayerType: "player-one",
    playingUserId: input.hostId,
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

export const reducer = (state: State, event: Evt & EvtMeta): State => {
  switch (state.type) {
    case "setup": {
      switch (event.t) {
        case "user-started-playing": {
          return {
            ...state,
            playingUserId: event.userId,
            userPlayerType: event.playerType,
          };
        }

        case "user-stopped-playing": {
          if (state.playingUserId !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            playingUserId: null,
          };
        }

        case "user-swapped-sides": {
          if (state.playingUserId !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
          };
        }

        case "user-started-game": {
          if (state.playingUserId !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            type: "game",
            playingUserId: state.playingUserId,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-changed-bot-level": {
          if (state.playingUserId !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }
          return {
            ...state,
            botLevel: event.botLevel,
          };
        }

        case "bot-dropped-disc": {
          return addError(state, event, { t: "not-playing" });
        }

        default: {
          return state;
        }
      }
    }

    case "game": {
      switch (event.t) {
        case "bot-dropped-disc": {
          const moved = ConnectFour.dropDisc(
            state.columns,
            event.columnIndex,
            toBotPlayer(state)
          );
          if (moved.t === "err") {
            return addError(state, event, { t: "move", c: moved.error });
          }
          return { ...state, columns: moved.value };
        }

        case "user-dropped-disc": {
          if (state.playingUserId !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          const moved = ConnectFour.dropDisc(
            state.columns,
            event.columnIndex,
            state.userPlayerType
          );
          if (moved.t === "err") {
            return addError(state, event, { t: "move", c: moved.error });
          }
          return { ...state, columns: moved.value };
        }

        case "user-left": {
          if (event.userId === state.playingUserId) {
            return {
              ...state,
              type: "setup",
              botLevel: state.botLevel,
              userPlayerType: state.userPlayerType,
              playingUserId: null,
            };
          }
          return state;
        }

        case "user-stopped-game": {
          if (event.userId !== state.playingUserId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            type: "setup",
            botLevel: state.botLevel,
            userPlayerType: state.userPlayerType,
            playingUserId: state.playingUserId,
          };
        }

        case "user-swapped-sides": {
          if (event.userId !== state.playingUserId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-restarted-game": {
          if (event.userId !== state.playingUserId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        default: {
          return state;
        }
      }
    }
  }
};

const addError = (
  state: State,
  event: Evt & EvtMeta,
  error: EvtError
): State => {
  return {
    ...state,
    errors: {
      ...state.errors,
      [event.eventId]: { ...event, error },
    },
  };
};

export const toState = (ctx: SpaceCtx, model: CoreModel): State => {
  return (model.events ?? []).reduce(
    (state, event) => reducer(state, event),
    initState(ctx)
  );
};

export const isBotTurn = (model: State): boolean => {
  if (model.type !== "game") {
    return false;
  }
  const status = ConnectFour.toStatus(model.columns);
  return (
    status.type === "Playing" &&
    status.turn === ConnectFour.opposite[model.userPlayerType]
  );
};

export const toBotPlayer = (state: State): ConnectFour.PlayerType => {
  return ConnectFour.opposite[state.userPlayerType];
};

export type GameOver =
  | { type: "Tie" }
  | { type: "Winner"; winner: ConnectFour.PlayerType };

export const toGameOver = (model: State): GameOver | { type: null } => {
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

export const appendEvent = (
  model: CoreModel,
  event: Evt & EvtMeta
): CoreModel => {
  const eventsMap: Map<string, Evt & EvtMeta> = new Map();
  for (const event of model.events) {
    eventsMap.set(event.eventId, event);
  }
  eventsMap.set(event.eventId, event);
  const sortedEvents = Array.from(eventsMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );
  return {
    ...model,
    events: sortedEvents,
  };
};

export const mergeModels = (
  modelLeft: CoreModel,
  modelRight: CoreModel
): CoreModel => {
  const eventsMap: Map<string, Evt & EvtMeta> = new Map();

  for (const event of modelLeft.events) {
    eventsMap.set(event.eventId, event);
  }

  for (const event of modelRight.events) {
    if (eventsMap.has(event.eventId)) {
      continue;
    }
    eventsMap.set(event.eventId, event);
  }

  const sortedEvents = Array.from(eventsMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  return {
    initialState: modelRight.initialState,
    events: sortedEvents,
  };
};
