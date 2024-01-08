import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as Game from "./@CHILD/game/game.core";
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
  modal: Modal;
};

type Modal = null | "user-preview" | "users";

export const updateFromEvent = ({
  model,
  event,
}: {
  model: CoreModel;
  event: WithEventId<SpaceEvent>;
}): {
  model: CoreModel;
} => {
  switch (event.t) {
    case "game": {
      return appendEvent({ model, event });
    }
    case "user-ended-space": {
      return appendEvent({ model, event });
    }
  }
  return { model };
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
