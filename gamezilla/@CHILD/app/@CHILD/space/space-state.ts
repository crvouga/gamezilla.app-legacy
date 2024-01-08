import { Space } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as Game from "./@CHILD/game/game.core";
import {
  EventId,
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "./@SHARED/event";

//
//
//
// State
//
//
//

export type State = {
  spaces: {
    [spaceId: SpaceId]: StateSpace;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
  active: {
    [spaceId: SpaceId]: SpaceId;
  };
  errorsByUserId: {
    [userId: UserId]: WithEventId<SpaceEvent> & { error: string };
  };
};

export type SpaceStateInitial = {
  type: "initial";
};

export type SpaceStateStarted = Space & {
  type: "started";
  game: Game.GameState | null;
  latestEvent: EventId;
};

export type SpaceStateEnded = Space & {
  type: "ended";
  latestEvent: EventId;
};

export type StateSpace =
  | SpaceStateInitial
  | SpaceStateStarted
  | SpaceStateEnded;

//
//
//
// Init
//
//
//

export const initState = (): State => {
  return {
    spaces: {},
    spaceIdByUserId: {},
    active: {},
    errorsByUserId: {},
  };
};

//
//
//
// Event
//
//
//

export type SpaceEvent =
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
      c: Game.GameEvent;
    };

//
//
//
// Reducer
//
//
//

export const reducer = ({
  state,
  event,
}: {
  state: State;
  event: WithEventMeta<SpaceEvent>;
}): State => {
  switch (event.t) {
    case "game": {
      const space = state.spaces[event.spaceId];
      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }
      if (space.type === "ended") {
        return state;
      }
      const gameState = space.game ?? Game.initState(event.c.t);
      const gameNew = Game.reducer({
        ctx: { space },
        state: gameState,
        event: { ...event, ...event.c },
      });
      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            game: gameNew,
          },
        },
      };
    }
    case "user-ended-space": {
      const space = state.spaces[event.spaceId];

      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }

      if (space.type === "ended") {
        return state;
      }

      if (event.userId !== space.hostId) {
        return state;
      }

      const spaceIdByUserIdNew = { ...state.spaceIdByUserId };
      for (const userId in space.users) {
        if (UserId.is(userId)) {
          delete spaceIdByUserIdNew[userId];
        }
      }

      const activeNew = { ...state.active };
      delete activeNew[event.spaceId];

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            type: "ended",
          },
        },
        active: activeNew,
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }

    case "user-inputted-game": {
      const space = state.spaces[event.spaceId];

      if (!space) {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }

      if (space.type === "ended") {
        return state;
      }

      if (event.userId !== space.hostId) {
        return state;
      }

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            game: event.game ? Game.initState(event.game) : null,
          },
        },
      };
    }

    case "user-joined-space": {
      const userSpaceId = state.spaceIdByUserId[event.userId];

      if (userSpaceId) {
        return {
          ...state,
          errorsByUserId: {
            ...state.errorsByUserId,
            [event.userId]: {
              ...event,
              error: "already-joined-space",
            },
          },
        };
      }

      const space = state.spaces[event.spaceId];

      if (!space) {
        return state;
      }

      if (space.type === "ended") {
        return state;
      }

      if (space.type === "initial") {
        return state;
      }

      return {
        ...state,
        spaces: {
          ...state.spaces,
          [event.spaceId]: {
            ...space,
            latestEvent: event.eventId,
            users: {
              ...space.users,
              [event.userId]: event.userId,
            },
          },
        },
        spaceIdByUserId: {
          ...state.spaceIdByUserId,
          [event.userId]: event.spaceId,
        },
      };
    }

    case "user-left-space": {
      const userSpaceId = state.spaceIdByUserId[event.userId];
      if (userSpaceId !== event.spaceId) {
        return state;
      }
      const space = state.spaces[userSpaceId];
      if (!space) {
        return state;
      }
      if (space.type === "ended") {
        return state;
      }
      if (space.type === "initial") {
        return state;
      }
      if (space.hostId === event.userId) {
        return state;
      }
      const usersNew = { ...space.users };
      delete usersNew[event.userId];
      const spaceIdByUserIdNew = { ...state.spaceIdByUserId };
      delete spaceIdByUserIdNew[event.userId];
      return {
        ...state,
        spaces: {
          ...state.spaces,
          [userSpaceId]: {
            ...space,
            latestEvent: event.eventId,
            users: usersNew,
          },
        },
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }

    case "user-started-space": {
      const space = state.spaces[event.spaceId];

      if (space) {
        return state;
      }

      const userSpaceId = state.spaceIdByUserId[event.userId];

      if (userSpaceId) {
        return state;
      }

      const spaceIdByUserIdNew: State["spaceIdByUserId"] = {
        ...state.spaceIdByUserId,
      };
      spaceIdByUserIdNew[event.userId] = event.spaceId;

      const activeNew: State["active"] = { ...state.active };
      activeNew[event.spaceId] = event.spaceId;

      const spaceNew: State["spaces"][SpaceId] = {
        type: "started",
        spaceId: event.spaceId,
        hostId: event.userId,
        visibility: "public",
        users: {
          [event.userId]: event.userId,
        },
        game: null,
        latestEvent: event.eventId,
      };

      const spacesNew: State["spaces"] = {
        ...state.spaces,
        [event.spaceId]: spaceNew,
      };

      return {
        ...state,
        active: activeNew,
        spaces: spacesNew,
        spaceIdByUserId: spaceIdByUserIdNew,
      };
    }
  }
};

export const mergeLeft = (left: State, right: State): State => {
  return {
    active: { ...left.active, ...right.active },
    errorsByUserId: { ...left.errorsByUserId, ...right.errorsByUserId },
    spaceIdByUserId: {
      ...left.spaceIdByUserId,
      ...right.spaceIdByUserId,
    },
    spaces: { ...left.spaces, ...right.spaces },
  };
};

export const toSpaceSubState = (
  state: State,
  spaceId: SpaceId
): State | null => {
  const space = state.spaces[spaceId] ?? {
    type: "initial",
  };

  if (space.type !== "started") {
    return null;
  }

  const spaceIdByUserId = Object.keys(space.users).reduce(
    (acc, userId) => ({
      ...acc,
      [userId]: space.spaceId,
    }),
    {}
  );

  return {
    active: state.active[spaceId] ? { [spaceId]: spaceId } : {},
    errorsByUserId: {},
    spaceIdByUserId,
    spaces: {
      [spaceId]: space,
    },
  };
};

//
//
//
//
// Selectors
//
//
//

export const toSpaceState = (state: State, spaceId: SpaceId): StateSpace => {
  const spaceState: StateSpace = state.spaces[spaceId] ?? {
    type: "initial",
  };

  return spaceState;
};

export const toStartedSpace = (
  state: State,
  spaceId: SpaceId
): SpaceStateStarted | null => {
  const spaceState: StateSpace = state.spaces[spaceId] ?? {
    type: "initial",
  };

  switch (spaceState.type) {
    case "initial":
    case "ended":
      return null;
    case "started":
      return spaceState;
  }
};

export type UserState = {
  userId: UserId;
  spaceId: SpaceId | null;
};

export const toUserState = (state: State, userId: UserId): UserState => {
  const userSpaceId = state.spaceIdByUserId[userId];

  const stateUser: UserState = {
    userId,
    spaceId: userSpaceId ?? null,
  };

  return stateUser;
};

//
//
//
//
//

export const initStateSpace = (): StateSpace => {
  return {
    type: "initial",
  };
};

export const reducerSpace = ({
  state,
  event,
}: {
  state: StateSpace;
  event: SpaceEvent & EventMeta;
}): StateSpace => {
  switch (state.type) {
    case "ended": {
      return state;
    }
    case "initial": {
      switch (event.t) {
        case "user-started-space": {
          return {
            type: "started",
            game: null,
            hostId: event.userId,
            latestEvent: event.eventId,
            spaceId: event.spaceId,
            users: {
              [event.userId]: event.userId,
            },
            visibility: "public",
          };
        }
        default: {
          return state;
        }
      }
    }
    case "started": {
      switch (event.t) {
        case "game": {
          const game = state.game ?? Game.initState(event.c.t);
          const gameNew = Game.reducer({
            ctx: { space: state },
            state: game,
            event: { ...event, ...event.c },
          });
          return {
            ...state,
            game: gameNew,
          };
        }
        case "user-ended-space": {
          if (event.userId !== state.hostId) {
            return state;
          }
          return {
            ...state,
            type: "ended",
          };
        }

        case "user-inputted-game": {
          return {
            ...state,
            game: event.game ? Game.initState(event.game) : null,
          };
        }

        case "user-joined-space": {
          return {
            ...state,
            users: {
              ...state.users,
              [event.userId]: event.userId,
            },
          };
        }

        case "user-left-space": {
          if (event.userId === state.hostId) {
            return state;
          }
          const usersNew = { ...state.users };
          delete usersNew[event.userId];
          return {
            ...state,
            users: usersNew,
          };
        }

        case "user-started-space": {
          return state;
        }
      }
    }
  }
};
