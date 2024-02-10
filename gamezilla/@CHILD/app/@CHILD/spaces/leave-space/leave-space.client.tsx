import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceClientModule } from "../architechure/space-client";
import { SpaceEvent, Spaces } from "../spaces-core";
import { Button } from "gamezilla/@CHILD/app/@SHARED/ui";
import { withId } from "../@SHARED/event";

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateLeaveSpaceButton({ ...input, model })
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

const updateLeaveSpaceButton: SpaceClientModule["update"] = ({
  ctx,
  model,
  msg,
}) => {
  switch (msg?.t) {
    case "clicked-leave-space-button": {
      if (!ctx.currentUserId) {
        return { model };
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId
      );

      if (!currentUserSpaceId) {
        return { model };
      }

      const spaceEventNew = withId<SpaceEvent>({
        t: "user-left-space",
        spaceId: currentUserSpaceId,
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

const ViewLeaveSpaceButton: SpaceClientModule["View"] = ({ dispatch }) => {
  return (
    <Button
      color="danger"
      variant="contained"
      size="sm"
      text="Leave"
      onClick={() => dispatch({ t: "clicked-leave-space-button" })}
    />
  );
};

export const LeaveSpaceClient = {
  update,
  ViewLeaveSpaceButton,
};
