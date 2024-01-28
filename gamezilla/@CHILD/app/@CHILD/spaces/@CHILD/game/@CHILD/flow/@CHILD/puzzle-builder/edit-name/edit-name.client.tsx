import {
  Button,
  Drawer,
  IconPenToSquare,
  ListItemButton,
  TextField,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "../puzzle-builder.core";

const update: ClientModule["update"] = (input) => {
  const { msg, model, gameState } = input;
  if (gameState.t !== "build") {
    return { model };
  }

  if (msg?.t === "edit-name/user-clicked-button") {
    return {
      model: {
        ...model,
        opened: "edit-name",
        editNameDraft: gameState.puzzle.name,
      },
    };
  }

  if (msg?.t === "edit-name/user-changed-draft") {
    return { model: { ...model, editNameDraft: msg.draft } };
  }

  if (msg?.t === "edit-name/user-closed-drawer") {
    return { model: { ...model, opened: null } };
  }

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { dispatch, model } = input;
  return (
    <>
      <ListItemButton
        icon={(props) => <IconPenToSquare {...props} />}
        label="Edit Name"
        onClick={() => dispatch({ t: "edit-name/user-clicked-button" })}
      />

      <Drawer
        id="edit-name-drawer"
        open={model.opened === "edit-name"}
        onClose={() => dispatch({ t: "edit-name/user-closed-drawer" })}
        position="bottom"
      >
        <p>Edit name</p>
        <TextField
          id="edit-name-input"
          label="Name"
          value={model.editNameDraft}
          onChange={() => {}}
        />
        <div className="flex w-full items-center gap-3">
          <Button text="Cancel" />
          <Button variant="contained" text="Save" />
        </div>
      </Drawer>
    </>
  );
};

export const EditNameClient = {
  update,
  View,
};
