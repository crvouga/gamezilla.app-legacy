import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrorToast,
  showOkToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Result, isErr, loading } from "gamezilla/@SHARED/core";
import { ClientModule } from "../builder.core";

const update: ClientModule["update"] = (input) => {
  const { msgGame, model, msg } = input;

  switch (msg?.t) {
    case "puzzle-create/user-clicked-create-button": {
      return {
        model: { ...model, puzzleCreateRequest: loading },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({ t: "puzzle-create/user-clicked-create-button" }),
        ],
      };
    }

    default: {
      break;
    }
  }

  switch (msgGame?.t) {
    case "user-created-puzzle": {
      if (isErr(msgGame.created)) {
        return {
          model: { ...model, puzzleCreateRequest: msgGame.created },
          msgCmd: showErrorToast(msgGame.created.error),
        };
      }

      const puzzleNew = msgGame.created.value;

      return {
        model: {
          ...model,
          puzzleCreateRequest: Result.mapOk(msgGame.created, () => null),
          puzzles: { ...model.puzzles, [puzzleNew.id]: puzzleNew },
        },
        msgCmd: showOkToast("Puzzle created"),
      };
    }

    default: {
      break;
    }
  }

  return { model };
};

const ViewCreateButton: ClientModule["View"] = (input) => {
  const { model, dispatch } = input;

  return (
    <Button
      text="Create Puzzle"
      variant="contained"
      color="primary"
      loading={model.puzzleCreateRequest.t === "loading"}
      start={<IconPlus className="h-8 w-8" />}
      onClick={() =>
        dispatch({ t: "puzzle-create/user-clicked-create-button" })
      }
    />
  );
};

export const PuzzleCreateClient = {
  update,
  ViewCreateButton,
};
