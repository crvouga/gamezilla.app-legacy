import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui";
import { isErr } from "gamezilla/@SHARED/core";
import { ClientModule } from "../builder.core";
import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";

const update: ClientModule["update"] = (input) => {
  const { gameEvent, model, msg } = input;

  switch (msg?.t) {
    case "puzzle-create/user-clicked-create-button": {
      return {
        model,
        cmd: [sendToServer({ t: "puzzle-create/user-clicked-create-button" })],
      };
    }

    default: {
      break;
    }
  }

  switch (gameEvent?.t) {
    case "user-created-puzzle": {
      if (isErr(gameEvent.created)) {
        return { model };
      }
      const puzzleNew = gameEvent.created.value;

      return {
        model: {
          ...model,
          puzzles: { ...model.puzzles, [puzzleNew.id]: puzzleNew },
        },
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
      text="Create New"
      variant="contained"
      color="primary"
      disabled={typeof model.total !== "number"}
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
