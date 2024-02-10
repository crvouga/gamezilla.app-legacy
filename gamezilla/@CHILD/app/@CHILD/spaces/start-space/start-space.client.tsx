import {
  APP_SOUND,
  playSound,
  pushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceClientModule } from "../architechure/space-client";

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromSpaceEvent({ ...input, model })
  );
};

const updateFromSpaceEvent: SpaceClientModule["update"] = ({
  model,
  msgSpaceEvent,
  ctx,
}) => {
  switch (msgSpaceEvent?.t) {
    case "user-started-space": {
      if (msgSpaceEvent.userId === ctx.currentUserId) {
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({
              t: "spaces",
              c: { t: "space", spaceId: msgSpaceEvent.spaceId },
            }),
          ],
        };
      }

      return { model };
    }
    default: {
      return { model };
    }
  }
};

export const StartSpaceClient = {
  update,
};
