import {
  APP_SOUND,
  playSound,
  pushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceClientModule } from "../architechure/space-client";
import { Button } from "gamezilla/@CHILD/app/@SHARED/ui";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import { withId } from "../@SHARED/event";
import { SpaceEvent } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateStartSpaceButton({ ...input, model })
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

//
//
//
//
//
//

const updateStartSpaceButton: SpaceClientModule["update"] = (input) => {
  const { ctx, msg, model } = input;

  switch (msg?.t) {
    case "clicked-start-space-button": {
      if (!ctx.currentUserId) {
        return { model };
      }

      const spaceEventNew = withId<SpaceEvent>({
        t: "user-started-space",
        spaceId: msg.spaceId,
        userId: ctx.currentUserId,
      });

      return {
        model,
        msgSpaceEvent: [spaceEventNew],
      };
    }
    default: {
      return { model };
    }
  }
};

const ViewStartSpaceButton: SpaceClientModule["View"] = ({ dispatch }) => {
  return (
    <Button
      size="lg"
      className="w-full"
      color="primary"
      onClick={() =>
        dispatch({
          t: "clicked-start-space-button",
          spaceId: SpaceId.generate(),
        })
      }
      text="Start space"
    />
  );
};

export const StartSpaceClient = {
  ViewStartSpaceButton,
  update,
};
