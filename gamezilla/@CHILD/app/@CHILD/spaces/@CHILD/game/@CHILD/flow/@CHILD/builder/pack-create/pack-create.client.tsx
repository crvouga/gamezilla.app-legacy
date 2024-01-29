import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "../builder.core";

const update: ClientModule["update"] = (input) => {
  const { model } = input;

  return { model };
};

const ViewCreateButton: ClientModule["View"] = (input) => {
  const { dispatch } = input;

  return (
    <Button
      text="Create Pack"
      variant="contained"
      color="primary"
      // loading={model.packCreateLoading.t === "loading"}
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
