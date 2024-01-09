import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { WithEventId } from "./@SHARED/event";
import * as Space from "./space/space";
import { SpaceEvent } from "./spaces-state";

export type CoreModel = {
  spaces: {
    [spaceId: SpaceId]: Space.Model;
  };
  spaceIdByUserId: {
    [userId: UserId]: SpaceId;
  };
};

type UpdateError = "space-not-found" | "already-in-space";

export const init = (): CoreModel => {
  return {
    spaces: {},
    spaceIdByUserId: {},
  };
};

export const updateFromEvent = ({
  model,
  event,
}: {
  model: CoreModel;
  event: WithEventId<SpaceEvent>;
}): {
  model: CoreModel;
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
  model: CoreModel;
  event: WithEventId<SpaceEvent>;
}): {
  model: CoreModel;
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
