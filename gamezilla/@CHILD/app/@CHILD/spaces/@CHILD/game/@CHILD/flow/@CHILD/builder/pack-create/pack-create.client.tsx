import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "../builder.core";

const update: ClientModule["update"] = (input) => {
  const { model } = input;

  return { model };
};

const ViewCreateButton: ClientModule["View"] = (input) => {
  const { dispatch, model } = input;

  return (
    <Button
      text="Create Pack"
      variant="contained"
      color="primary"
      loading={model.packCreateRequest.t === "loading"}
      start={<IconPlus className="h-8 w-8" />}
      onClick={() => dispatch({ t: "pack-create/user-clicked-create-button" })}
    />
  );
};

export const PackCreateClient = {
  update,
  ViewCreateButton,
};
