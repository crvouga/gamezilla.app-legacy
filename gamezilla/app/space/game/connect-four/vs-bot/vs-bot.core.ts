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
  events: (Evt & WithMeta)[];
};

export type ServerModel = CoreModel;

export type ClientModel = CoreModel & {
  opened: "activity-feed-drawer" | null;
  vsBotSetup: VsBotSetup.Model;
  vsBotGame: VsBotGame.Model;
};

export const initCore = ({ player }: { player: UserId | null }): CoreModel => {
  if (player) {
    return {
      events: [
        withMeta({
          t: "user-started-playing",
          playerType: "player-one",
          userId: player,
        }),
      ],
    };
  }
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
  | Evt
  | { t: "opened-activity-feed-drawer" }
  | { t: "closed-activity-feed-drawer" }
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }
  | { t: "vs-bot-game"; c: VsBotGame.Msg };

export type ServerMsg = Evt;

export type ToClient = Evt & WithMeta;

export type ToServer = Evt & WithMeta;

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

export type WithMeta = {
  eventId: string;
  happenedAt: Posix;
};

const generateEventId = (): string => {
  const uuid = Uuid.generate();
  return `event:${uuid}`;
};

export const withMeta = (eventNew: Evt): Evt & WithMeta => {
  return {
    ...eventNew,
    happenedAt: Posix.now(),
    eventId: generateEventId(),
  };
};

type EventError =
  | { t: "not-playing" }
  | { t: "not-your-turn" }
  | { t: "move"; c: ConnectFour.MoveProblem };

export const eventErrorToString = ({
  error,
}: {
  error: EventError;
}): string => {
  switch (error.t) {
    case "not-playing": {
      return "You're not playing";
    }
    case "move": {
      return ConnectFour.moveProblemToString(error.c);
    }
    case "not-your-turn": {
      return "It's not your turn";
    }
  }
};

export type State = (StateSetup | StateGame) & {
  errors: {
    [eventId: string]: Evt & WithMeta & { error: EventError };
  };
};

const toInitialState = (input: { hostId: UserId }): State => {
  return {
    type: "setup",
    botLevel: "Medium",
    userPlayerType: "player-one",
    player: input.hostId,
    errors: {},
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
  event: Evt & WithMeta;
}): State => {
  const { state, event } = input;

  switch (state.type) {
    case "setup": {
      switch (event.t) {
        case "user-started-playing": {
          return {
            ...state,
            player: event.userId,
            userPlayerType: event.playerType,
          };
        }

        case "user-stopped-playing": {
          if (state.player !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            player: null,
          };
        }

        case "user-swapped-sides": {
          if (state.player !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
          };
        }

        case "user-started-game": {
          if (state.player !== event.userId) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            type: "game",
            botLevel: state.botLevel,
            userPlayerType: state.userPlayerType,
            player: state.player,
            gameId: 0,
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-changed-bot-level": {
          if (state.player !== event.userId) {
            return addError(state, event, { t: "not-playing" });
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
            return addError(state, event, { t: "move", c: moved.error });
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
            return addError(state, event, { t: "move", c: moved.error });
          }
          return { ...state, columns: moved.value };
        }

        case "user-left": {
          if (event.userId === state.player) {
            return {
              ...state,
              type: "setup",
              botLevel: state.botLevel,
              userPlayerType: state.userPlayerType,
              player: null,
            };
          }
          return state;
        }

        case "user-stopped-game": {
          if (event.userId !== state.player) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            type: "setup",
            botLevel: state.botLevel,
            userPlayerType: state.userPlayerType,
            player: state.player,
          };
        }

        case "user-swapped-sides": {
          if (event.userId !== state.player) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            userPlayerType: ConnectFour.opposite[state.userPlayerType],
            columns: ConnectFour.EMPTY_COLUMNS,
          };
        }

        case "user-restarted-game": {
          if (event.userId !== state.player) {
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
  event: Evt & WithMeta,
  error: EventError
): State => {
  return {
    ...state,
    errors: {
      ...state.errors,
      [event.eventId]: { ...event, error },
    },
  };
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
  event: Evt & WithMeta
): CoreModel => {
  return mergeModels(model, { events: [event] });
};

export const mergeModels = (
  modelLeft: CoreModel,
  modelRight: CoreModel
): CoreModel => {
  const eventsMap: Map<string, Evt & WithMeta> = new Map();

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
    events: sortedEvents,
  };
};
