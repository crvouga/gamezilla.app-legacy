import { Profile, SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import { EventMeta, Space } from "gamezilla/app/space/@SHARED";
import * as Game from "./game/game.core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  spaceEvents: {
    [spaceId: SpaceId]: SpaceEvents;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
};

export type SpaceEvents = {
  events: EventWithMeta[];
  initialState: State;
};

const updateSpaceEvents = (
  model: CoreModel,
  eventNew: EventWithMeta
): CoreModel => {
  const spaceEvents = model.spaceEvents[eventNew.spaceId] ?? {
    events: [],
    initialState: {
      type: "initial",
    },
  };

  const eventMap = new Map<string, EventWithMeta>();

  for (const event of spaceEvents.events) {
    eventMap.set(event.eventId, event);
  }

  eventMap.set(eventNew.eventId, eventNew);

  const sorted = Array.from(eventMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );

  const spaceEventsNew: SpaceEvents = {
    initialState: spaceEvents.initialState,
    events: sorted,
  };

  return {
    ...model,
    spaceEvents: {
      ...model.spaceEvents,
      [eventNew.spaceId]: spaceEventsNew,
    },
  };
};

export const updateSpaceByUserId = (
  model: CoreModel,
  eventNew: EventWithMeta
): CoreModel => {
  switch (eventNew.t) {
    case "user-started-space": {
      return {
        ...model,
        spaceIdByUserId: {
          ...model.spaceIdByUserId,
          [eventNew.userId]: eventNew.spaceId,
        },
      };
    }
    case "user-joined-space": {
      return {
        ...model,
        spaceIdByUserId: {
          ...model.spaceIdByUserId,
          [eventNew.userId]: eventNew.spaceId,
        },
      };
    }
    case "user-left-space": {
      const spaceIdByUserId = { ...model.spaceIdByUserId };
      delete spaceIdByUserId[eventNew.userId];
      return {
        ...model,
        spaceIdByUserId,
      };
    }
    case "user-ended-space": {
      const space = toState(
        model.spaceIdByUserId,
        model.spaceEvents[eventNew.spaceId] ?? {
          events: [],
          initialState: {
            type: "initial",
          },
        }
      );

      const users =
        space.type === "started"
          ? new Set([...Object.values(space.users), space.hostId])
          : [];

      const spaceIdByUserId = { ...model.spaceIdByUserId };

      for (const userId of users) {
        delete model.spaceIdByUserId[userId];
      }

      return {
        ...model,
        spaceIdByUserId,
      };
    }
    default: {
      return model;
    }
  }
};

export const updateCore = (
  model: CoreModel,
  eventNew: EventWithMeta
): CoreModel => {
  return updateSpaceByUserId(updateSpaceEvents(model, eventNew), eventNew);
};

const mergeEvents = (
  events: EventWithMeta[],
  eventsNew: EventWithMeta[]
): EventWithMeta[] => {
  const eventsNewMap = new Map<string, EventWithMeta>();

  for (const event of events) {
    eventsNewMap.set(event.eventId, event);
  }
  for (const event of eventsNew) {
    eventsNewMap.set(event.eventId, event);
  }
  const sorted = Array.from(eventsNewMap.values()).sort(
    (a, b) => a.happenedAt - b.happenedAt
  );
  return sorted;
};

export const mergeModels = (
  model: CoreModel,
  modelNew: CoreModel
): CoreModel => {
  const spacesNew: CoreModel["spaceEvents"] = {};

  for (const spaceId in modelNew.spaceEvents) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }
    const space = model.spaceEvents[spaceId];
    const spaceNew = modelNew.spaceEvents[spaceId];
    if (!space && !spaceNew) {
      continue;
    }
    if (!space && spaceNew) {
      spacesNew[spaceId] = spaceNew;
      continue;
    }
    if (!spaceNew && space) {
      spacesNew[spaceId] = space;
      continue;
    }

    if (space && spaceNew) {
      spacesNew[spaceId] = {
        ...space,
        events: mergeEvents(space.events, spaceNew.events),
      };
      continue;
    }
  }

  return {
    spaceEvents: spacesNew,
    spaceIdByUserId: {
      ...model.spaceIdByUserId,
      ...modelNew.spaceIdByUserId,
    },
  };
};

export type ServerModel = CoreModel & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
  };
  profileCache: {
    [userId: UserId]: Profile;
  };
};

export type ClientModel = CoreModel & {
  games: {
    [spaceId: SpaceId]: Game.ClientModel;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

type ModalModel = null | "user-preview" | "users";

//
//
//
// Msg
//
//
//

export type ToClient = ToClientExtra &
  (
    | EventWithMeta
    | { t: "game-msg"; spaceId: SpaceId; c: Game.ToClient }
    | { t: "sync"; model: CoreModel }
  );

export type ToServer = ToServerExtra &
  (EventWithMeta | { t: "game-msg"; spaceId: SpaceId; c: Game.ToServer });

export type ToClientExtra = {
  profiles?: { [userId: UserId]: Profile };
};

export type ToServerExtra = {
  profile?: Profile | null;
};

export type ServerMsg = { t: "game-msg"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | EventWithMeta
  | { t: "game-msg"; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
  | { t: "clicked-user"; userId: UserId };

//
//
//
// Msg
//
//
//

export type Event =
  | {
      t: "user-started-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-ended-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-joined-space";
      userId: UserId;
      spaceId: SpaceId;
      profile?: Profile;
    }
  | {
      t: "user-left-space";
      userId: UserId;
      spaceId: SpaceId;
    }
  | {
      t: "user-inputted-game";
      userId: UserId;
      spaceId: SpaceId;
      game: Game.GameName | null;
    }
  | {
      t: "game";
      spaceId: SpaceId;
      c: Game.Event;
    };

export type EventWithMeta = Event & EventMeta;

export type StateInitial = {
  type: "initial";
};

export type StateStarted = Space & {
  type: "started";
  game: Game.State | null;
};

export type StateEnded = Space & {
  type: "ended";
};

export type State = StateInitial | StateStarted | StateEnded;

export const reducer = ({
  state,
  event,
}: {
  state: State;
  event: EventWithMeta;
}): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }
    case "initial": {
      switch (event.t) {
        case "user-started-space": {
          return {
            type: "started",
            spaceId: event.spaceId,
            hostId: event.userId,
            visibility: "public",
            users: {
              [event.userId]: event.userId,
            },
            game: null,
          };
        }
        default: {
          return state;
        }
      }
    }
    case "started": {
      switch (event.t) {
        case "user-started-space": {
          return {
            type: "started",
            spaceId: event.spaceId,
            hostId: event.userId,
            visibility: "public",
            users: {
              [event.userId]: event.userId,
            },
            game: null,
          };
        }

        case "user-ended-space": {
          return {
            ...state,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          if (!event.game) {
            return {
              ...state,
              game: null,
            };
          }
          return {
            ...state,
            game: Game.initState(event.game),
          };
        }

        case "user-joined-space": {
          return {
            ...state,
          };
        }

        case "user-left-space": {
          return {
            ...state,
            users: {
              ...state.users,
              [event.userId]: undefined,
            },
          };
        }

        case "game": {
          if (!state.game) {
            return state;
          }

          const gameNew = Game.reducer({
            ctx: { space: state },
            state: state.game,
            event: { ...event, ...event.c },
          });

          return {
            ...state,
            game: gameNew,
          };
        }
      }
    }
  }
};

type SpaceIdByUserId = {
  [userId: UserId]: SpaceId;
};

export const toSpaceIdByUserId = (model: CoreModel): SpaceIdByUserId => {
  const allEvents = toAllEvents(model);

  const spaceIdByUserId: SpaceIdByUserId = {};

  for (const event of allEvents) {
    switch (event.t) {
      case "user-started-space": {
        spaceIdByUserId[event.userId] = event.spaceId;
        break;
      }
      case "user-joined-space": {
        spaceIdByUserId[event.userId] = event.spaceId;
        break;
      }
      case "user-left-space": {
        delete spaceIdByUserId[event.userId];
        break;
      }
      case "user-ended-space": {
        delete spaceIdByUserId[event.userId];
        break;
      }
    }
  }

  return spaceIdByUserId;
};

const toAllEvents = (model: CoreModel): EventWithMeta[] => {
  const events: EventWithMeta[] = [];
  for (const spaceId in model.spaceEvents) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }
    const space = model.spaceEvents[spaceId];
    if (!space) {
      continue;
    }
    events.push(...space.events);
  }
  events.sort((a, b) => a.happenedAt - b.happenedAt);
  return events;
};

export const toState = (
  spaceByUserId: CoreModel["spaceIdByUserId"],
  model: SpaceEvents
): State => {
  return model.events.reduce(
    (state, event) => reducer({ event, state }),
    model.initialState
  );
};
