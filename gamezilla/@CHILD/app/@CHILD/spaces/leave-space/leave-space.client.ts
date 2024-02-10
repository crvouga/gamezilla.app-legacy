import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceClientModule } from "../architechure/space-client";
import { Spaces } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates({ model: input.model }, (model) =>
    updateFromSpaceEvent({ ...input, model })
  );
};

const updateFromSpaceEvent: SpaceClientModule["update"] = ({
  model,
  msgSpaceEvent,
  ctx,
}) => {
  switch (msgSpaceEvent?.t) {
    case "user-left-space": {
      if (!ctx.currentUserId) {
        return { model };
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId
      );

      if (msgSpaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navBackward)],
        };
      }
      return { model };
    }
    default: {
      return { model };
    }
  }
};

export const LeaveSpaceClient = {
  update,
};
