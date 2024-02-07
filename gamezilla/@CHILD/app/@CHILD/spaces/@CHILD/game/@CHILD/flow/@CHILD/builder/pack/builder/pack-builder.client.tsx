import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "../../builder.core";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";

const update: ClientModule["update"] = (input) => {
  const { model, msg, ctx } = input;

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

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { dispatch } = input;

  return (
    <div>
      <Button
        text="Exit"
        variant="contained"
        color="primary"
        start={<IconPlus className="h-8 w-8" />}
        onClick={() => dispatch({ t: "pack-builder/user-clicked-exit-button" })}
      />
    </div>
  );
};

export const PackBuilderClient = {
  update,
  View,
};
