import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ViewBottomButtonBar } from "../../../../../../@SHARED/game";
import { ClientModule } from "../../builder.core";

const update: ClientModule["update"] = (input) => {
  const { model, msg, ctx, msgGame } = input;

  switch (msg?.t) {
    case "pack-builder/user-clicked-exit-button": {
      return {
        model,
        msgGame: [
          withId({ t: "user-exited-pack-builder", userId: ctx.currentUserId }),
        ],
      };
    }
  }

  switch (msgGame?.t) {
    case "user-exited-pack-builder": {
      return {
        model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      };
    }
  }

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { dispatch } = input;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="w-full flex-1"></div>
      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect className="h-6 w-6" />,
            label: "Exit",
            onClick: () =>
              dispatch({ t: "pack-builder/user-clicked-exit-button" }),
          },
        ]}
      />
    </div>
  );
};

export const PackBuilderClient = {
  update,
  View,
};
