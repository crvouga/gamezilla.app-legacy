import * as Route from "Route";
import * as UI from "UI";
import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedLogoutLink" }
  | { type: "UserClickedDeleteProfileLink" }
  | { type: "UserClickedUpdateProfileLink" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back];

    case "UserClickedLogoutLink":
      return [model, Route.push({ type: "Logout" })];

    case "UserClickedUpdateProfileLink":
      return [model, Route.push({ type: "ProfileUpdate" })];

    case "UserClickedDeleteProfileLink":
      return [model, Route.push({ type: "ProfileDelete" })];
  }
};

//
//
//
// View
//
//
//

export const view =
  ({ username }: { username: string }, model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.Page>
        <UI.Header title={username} />

        <UI.List>
          <UI.ListItemButton
            onClick={() => dispatch({ type: "UserClickedUpdateProfileLink" })}
          >
            <UI.ListItemIcon>
              <UI.Icons.Edit />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Update Profile" />
            <UI.ListItemSecondaryAction>
              <UI.Icons.ChevronRight />
            </UI.ListItemSecondaryAction>
          </UI.ListItemButton>

          <UI.ListItemButton
            onClick={() => dispatch({ type: "UserClickedDeleteProfileLink" })}
          >
            <UI.ListItemIcon>
              <UI.Icons.Delete />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Delete Profile" />
          </UI.ListItemButton>

          <UI.ListItemButton
            onClick={() => dispatch({ type: "UserClickedLogoutLink" })}
          >
            <UI.ListItemIcon>
              <UI.Icons.Logout />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Logout" />
          </UI.ListItemButton>
        </UI.List>
      </UI.Page>
    );
