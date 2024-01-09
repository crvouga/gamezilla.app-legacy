import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { WithEventId } from "../@SHARED/event";
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

//
//
//
//
//
//

type UpdateError = "space-not-found" | "already-in-space";

export const updateFromEvent = ({
  model,
  event,
}: {
  model: Model;
  event: WithEventId<SpaceEvent>;
}): {
  model: Model;
  err?: UpdateError;
} => {
  switch (event.t) {
    case "game": {
      return appendEvent({ model, event });
    }

    case "user-inputted-game": {
      return appendEvent({ model, event });
    }

    case "user-ended-space": {
      const userIds = Space.toUserIds(
        model.spaces[event.spaceId] ?? Space.init
      );

      const spaceIdByUserIdNew = { ...model.spaceIdByUserId };
      for (const userId of userIds) {
        delete spaceIdByUserIdNew[userId];
      }

      const appended = appendEvent({ model, event });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }

    case "user-joined-space": {
      const spaceId = model.spaceIdByUserId[event.userId];

      if (spaceId) {
        return { model };
      }

      const spaceIdByUserIdNew = {
        ...model.spaceIdByUserId,
        [event.userId]: event.spaceId,
      };

      const appended = appendEvent({ model, event });

      return {
        model: {
          ...appended.model,
          spaceIdByUserId: spaceIdByUserIdNew,
        },
      };
    }

    case "user-left-space": {
      const spaceIdByUserIdNew = { ...model.spaceIdByUserId };

      if (event.spaceId === model.spaceIdByUserId[event.userId]) {
        delete spaceIdByUserIdNew[event.userId];
      }

      const appended = appendEvent({ model, event });

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
        [event.userId]: event.spaceId,
      };

      const appended = appendEvent({ model, event });

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
