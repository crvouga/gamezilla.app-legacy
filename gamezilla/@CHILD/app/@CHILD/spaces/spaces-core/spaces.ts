/**
 *
 *
 *
 *
 */
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { EventId, WithEventId } from "../@SHARED/event";
import * as SpaceState from "./space-state";
import * as Space from "./space";
import { SpaceEvent } from "./space-event";

//
//
//
//
//
//

export type Model = {
  spaces: {
    [spaceId: SpaceId]: Space.Model;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
};

export const init: Model = {
  spaces: {},
  spaceIdByUserId: {},
};

//
//
//
//
//
//

export const listSpaces = ({
  model,
  limit,
  offset,
}: {
  model: Model;
  limit: number;
  offset: number;
  sort: "newest" | "oldest";
}): Space.Model[] => {
  const spaces: Space.Model[] = [];

  let i = -1;
  for (const spaceId in model.spaces) {
    i += 1;

    if (i < offset) {
      continue;
    }

    const space = model.spaces[spaceId as SpaceId];

    if (!space) {
      continue;
    }

    spaces.push(space);

    if (spaces.length >= limit) {
      break;
    }
  }

  return spaces;
};

export const toSpaceIdByUserId = ({
  model,
  userId,
}: {
  model: Model;
  userId: UserId;
}): SpaceId | null => {
  return model.spaceIdByUserId[userId] ?? null;
};

export const toSpace = (model: Model, spaceId: SpaceId): Space.Model | null => {
  return model.spaces[spaceId] ?? null;
};

export const toSpaceByUserId = ({
  model,
  userId,
}: {
  model: Model;
  userId: UserId;
}): Space.Model | null => {
  const spaceId = model.spaceIdByUserId[userId];

  if (!spaceId) {
    return null;
  }

  const space = model.spaces[spaceId];

  if (!space) {
    return null;
  }

  return space;
};

export const toEventWithMeta = (
  model: Model,
  spaceId: SpaceId,
  eventId: EventId
) => {
  const space = model.spaces[spaceId];

  if (!space) {
    return null;
  }

  return Space.toEventWithMeta(space, eventId);
};

export const toSpaceState = (
  model: Model,
  spaceId: SpaceId
): SpaceState.State => {
  const spaceModel = model.spaces[spaceId];

  if (!spaceModel) {
    return SpaceState.initState;
  }

  const spaceState = Space.deriveState(spaceModel);

  return spaceState;
};

export const toSpaceStarted = (
  model: Model,
  spaceId: SpaceId
): SpaceState.Started | null => {
  const spaceModel = model.spaces[spaceId];

  if (!spaceModel) {
    return null;
  }

  const spaceState = Space.toSpaceStarted(spaceModel);

  return spaceState;
};

//
//
//
//
//
//

type UpdateError = "space-not-found" | "already-in-space";

export const updateFromEvent = ({
  model,
  spaceEvent,
}: {
  model: Model;
  spaceEvent: WithEventId<SpaceEvent>;
}): {
  model: Model;
  err?: UpdateError;
} => {
  switch (spaceEvent.t) {
    case "game": {
      return appendEvent({ model, event: spaceEvent });
    }

    case "user-inputted-game": {
      return appendEvent({ model, event: spaceEvent });
    }

    case "user-ended-space": {
      const userIds = Space.toUserIds(
        model.spaces[spaceEvent.spaceId] ?? Space.init
      );

      const spaceIdByUserIdNew = { ...model.spaceIdByUserId };
      for (const userId of userIds) {
        delete spaceIdByUserIdNew[userId];
      }

      const appended = appendEvent({ model, event: spaceEvent });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }

    case "user-joined-space": {
      const spaceId = model.spaceIdByUserId[spaceEvent.userId];

      if (spaceId) {
        return { model };
      }

      const spaceIdByUserIdNew = {
        ...model.spaceIdByUserId,
        [spaceEvent.userId]: spaceEvent.spaceId,
      };

      const appended = appendEvent({ model, event: spaceEvent });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }

    case "user-left-space": {
      const spaceIdByUserIdNew = { ...model.spaceIdByUserId };

      if (spaceEvent.spaceId === model.spaceIdByUserId[spaceEvent.userId]) {
        delete spaceIdByUserIdNew[spaceEvent.userId];
      }

      const appended = appendEvent({ model, event: spaceEvent });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }

    case "user-started-space": {
      const spaceIdByUserIdNew = {
        ...model.spaceIdByUserId,
        [spaceEvent.userId]: spaceEvent.spaceId,
      };

      const appended = appendEvent({ model, event: spaceEvent });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }
  }
};

const appendEvent = ({
  model,
  event,
}: {
  model: Model;
  event: WithEventId<SpaceEvent>;
}): {
  model: Model;
} => {
  const spaceId = event.spaceId;

  const space = model.spaces[spaceId] ?? Space.init;

  const spaceNew = Space.appendEvent({ event, model: space });

  return {
    model: {
      ...model,
      spaces: {
        ...model.spaces,
        [spaceId]: spaceNew,
      },
    },
  };
};

export const mergeOne = ({
  model,
  space,
}: {
  model: Model;
  space: Space.Model;
}): Model => {
  const spaceState = Space.toSpaceStarted(space);

  if (!spaceState) {
    return model;
  }

  const currentSpace = model.spaces[spaceState.spaceId];

  if (!currentSpace) {
    const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
      model.spaceIdByUserId,
      space
    );

    return {
      ...model,
      spaces: {
        ...model.spaces,
        [spaceState.spaceId]: space,
      },
      spaceIdByUserId: spaceIdByUserIdNew,
    };
  }

  const spaceNew = Space.merge(currentSpace, space);

  const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
    model.spaceIdByUserId,
    spaceNew
  );

  return {
    ...model,
    spaces: {
      ...model.spaces,
      [spaceState.spaceId]: spaceNew,
    },
    spaceIdByUserId: spaceIdByUserIdNew,
  };
};

const updateSpaceIdByUserIdFromSpaceState = (
  spaceIdByUserId: Model["spaceIdByUserId"],
  space: Space.Model
): Model["spaceIdByUserId"] => {
  const spaceState = Space.toSpaceStarted(space);

  if (!spaceState) {
    return spaceIdByUserId;
  }

  const spaceIdByUserIdNew = { ...spaceIdByUserId };

  spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId;

  for (const userId of SpaceState.toUserIds(spaceState)) {
    spaceIdByUserIdNew[userId] = spaceState.spaceId;
  }

  return spaceIdByUserIdNew;
};
