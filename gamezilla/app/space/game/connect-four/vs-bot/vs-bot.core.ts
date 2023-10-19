import { Posix, Uuid } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { VsBotGame, VsBotSetup } from "gamezilla/app/space/game/@SHARED";
import * as ConnectFour from "../connect-four";

//
//
// Model
//
//

export type CoreModel = {
  events: (Event & WithMeta)[];
};

export type ServerModel = CoreModel;

export type ClientModel = CoreModel & {
  vsBotSetup: VsBotSetup.Model;
  vsBotGame: VsBotGame.Model;
};

export const initCore = ({ player }: { player: UserId | null }): CoreModel => {
  return {
    events: [],
  };
};

//
//
// Msg
//
//

export type ClientMsg =
  | Event
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type ServerMsg = Event;

export type ToClient = Event & WithMeta;

export type ToServer = Event & WithMeta;

export type Event =
  | { t: "user-dropped-disc"; columnIndex: ConnectFour.ColumnIndex }
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

type WithMeta = {
  eventId: Uuid;
  happenedAt: Posix;
};

export const withMeta = (eventNew: Event): Event & WithMeta => {
  return {
    ...eventNew,
    happenedAt: Posix.now(),
    eventId: Uuid.generate(),
  };
};

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
  userPlayerType: ConnectFour.PlayerType;
  botLevel: BotLevel;
  player: UserId | null;
};

export type StateGame = {
  type: "game";
  gameId: number;
  userPlayerType: ConnectFour.PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: ConnectFour.Columns;
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
            player: event.userId,
            userPlayerType: event.playerType,
          };
        }

        case "user-stopped-playing": {
          if (state.player !== event.userId) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }

          return {
            ...state,
            player: null,
          };
        }

        case "user-swapped-sides": {
          if (state.player !== event.userId) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
          };
        }

        case "user-started-game": {
          if (state.player !== event.userId) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }

          return {
            type: "game",
            botLevel: state.botLevel,
            userPlayerType: state.userPlayerType,
            player: state.player,
            gameId: 0,
            columns: ConnectFour.EMPTY_COLUMNS,
            errors: [],
          };
        }

        case "user-changed-bot-level": {
          if (state.player !== event.userId) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }
          return {
            ...state,
            botLevel: event.botLevel,
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
          const moved = ConnectFour.dropDisc(
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
          const moved = ConnectFour.dropDisc(
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

        case "user-stopped-game": {
          if (event.userId !== state.player) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }

          return {
            type: "setup",
            botLevel: state.botLevel,
            userPlayerType: state.userPlayerType,
            player: state.player,
            errors: [],
          };
        }

        case "user-swapped-sides": {
          if (event.userId !== state.player) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-restarted-game": {
          if (event.userId !== state.player) {
            return {
              ...state,
              errors: [...state.errors, { ...event, error: "not-playing" }],
            };
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

export const toState = (ctx: { hostId: UserId }, model: CoreModel): State => {
  return (model.events ?? []).reduce(
    (state, event) => reducer({ ctx, state, event }),
    toInitialState(ctx)
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
  event: Event & WithMeta
): CoreModel => {
  const eventsMap: Map<string, Event & WithMeta> = new Map();

  // Remove duplicates and keep the latest events
  for (const existingEvent of model.events) {
    eventsMap.set(existingEvent.eventId, existingEvent);
  }

  // Add the new event
  eventsMap.set(event.eventId, event);

  // Convert back to array and sort by 'happenedAt'
  const sortedEvents = Array.from(eventsMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  return {
    ...model,
    events: sortedEvents,
  };
};

export const mergeLeftModel = (
  modelLeft: CoreModel,
  modelRight: CoreModel
): CoreModel => {
  const eventsMap: Map<string, Event & WithMeta> = new Map();

  // Add events from modelRight
  for (const event of modelRight.events) {
    eventsMap.set(event.eventId, event);
  }

  // Add events from modelLeft
  for (const event of modelLeft.events) {
    eventsMap.set(event.eventId, event);
  }

  // Convert back to array and sort by 'happenedAt'
  const sortedEvents = Array.from(eventsMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  return {
    events: sortedEvents,
  };
};
