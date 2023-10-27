import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { SpaceId } from "gamezilla/app/@SHARED/data/space-id";
import { Space } from "gamezilla/app/space/@SHARED";
import { EventMeta } from "gamezilla/app/space/@SHARED/evt";
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

export const appendEvent = (
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

  return {
    spaceIdByUserId: model.spaceIdByUserId,
    spaceEvents: {
      ...model.spaceEvents,
      [eventNew.spaceId]: {
        initialState: spaceEvents.initialState,
        events: sorted,
      },
    },
  };
};

const mergeEvents = (
  events: EventWithMeta[],
  eventsNew: EventWithMeta[]
): EventWithMeta[] => {
  const eventsNewMap = new Map<string, EventWithMeta>();

  for (const evt of events) {
    eventsNewMap.set(evt.eventId, evt);
  }
  for (const evt of eventsNew) {
    eventsNewMap.set(evt.eventId, evt);
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
      c: Game.Evt;
    };

export type EventWithMeta = Event & EventMeta;

export type StateInitial = {
  type: "initial";
};

export type StateStarted = {
  type: "started";
  space: Space;
  game: Game.State | null;
};

export type StateEnded = {
  type: "ended";
  space: Space;
};

export type State = StateInitial | StateStarted | StateEnded;

export const reducer = (
  spacesByUserId: CoreModel["spaceIdByUserId"],
  state: State,
  evt: Event & EventMeta
): State => {
  switch (state.type) {
    case "ended": {
      return state;
    }
    case "initial": {
      switch (evt.t) {
        case "user-started-space": {
          return {
            type: "started",
            space: {
              spaceId: evt.spaceId,
              hostId: evt.userId,
              visibility: "public",
              users: {
                [evt.userId]: evt.userId,
              },
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
      switch (evt.t) {
        case "user-started-space": {
          return {
            type: "started",
            space: {
              spaceId: evt.spaceId,
              hostId: evt.userId,
              visibility: "public",
              users: {
                [evt.userId]: evt.userId,
              },
            },
            game: null,
          };
        }

        case "user-ended-space": {
          return {
            type: "ended",
            space: state.space,
          };
        }

        case "user-inputted-game": {
          if (!evt.game) {
            return {
              ...state,
              game: null,
            };
          }
          return {
            ...state,
            game: Game.initState(evt.game),
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
            space: {
              ...state.space,
              users: {
                ...state.space.users,
                [evt.userId]: undefined,
              },
            },
          };
        }

        case "game": {
          if (!state.game) {
            return state;
          }

          const gameNew = Game.reducer({
            ctx: state,
            state: state.game,
            evt: { ...evt, ...evt.c },
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

  for (const evt of allEvents) {
    switch (evt.t) {
      case "user-started-space": {
        spaceIdByUserId[evt.userId] = evt.spaceId;
        break;
      }
      case "user-joined-space": {
        spaceIdByUserId[evt.userId] = evt.spaceId;
        break;
      }
      case "user-left-space": {
        delete spaceIdByUserId[evt.userId];
        break;
      }
      case "user-ended-space": {
        delete spaceIdByUserId[evt.userId];
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
    (acc, event) => reducer(spaceByUserId, acc, event),
    model.initialState
  );
};
