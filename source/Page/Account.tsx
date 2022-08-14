import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedLogout"]
  | ["ClickedDeleteProfile"]
  | ["ClickedUpdateProfile"]
  | ["ClickedAdmin"]

export const update = (
  { userId }: { userId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedAdmin":
      return [model, Route.push(["Admin", "Model" ])]

    case "ClickedBack":
      return [model, Route.back]

    case "ClickedLogout":
      return [model, Route.push(["Logout"])]

    case "ClickedUpdateProfile":
      return [model, Route.push(["ProfileUpdate" ])]

    case "ClickedDeleteProfile":
      return [model, Route.push(["ProfileDelete" ])]
  }
}

//
//
//
// View
//
//
//

export const view =
  ({ username }: { username: string }, _: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header title={username} />

        <UI.List>
          <UI.ListItemButton onClick={() => dispatch(["ClickedUpdateProfile"])}>
            <UI.ListItemIcon>
              <UI.Icons.Edit />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Update Profile" />
            <UI.ListItemSecondaryAction>
              <UI.Icons.ChevronRight />
            </UI.ListItemSecondaryAction>
          </UI.ListItemButton>

          <UI.ListItemButton onClick={() => dispatch(["ClickedDeleteProfile"])}>
            <UI.ListItemIcon>
              <UI.Icons.Delete />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Delete Profile" />
          </UI.ListItemButton>

          <UI.ListItemButton onClick={() => dispatch(["ClickedLogout"])}>
            <UI.ListItemIcon>
              <UI.Icons.Logout />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Logout" />
          </UI.ListItemButton>

          <UI.ListItemButton onClick={() => dispatch(["ClickedAdmin"])}>
            <UI.ListItemIcon>
              <UI.Icons.AdminPanelSettings />
            </UI.ListItemIcon>
            <UI.ListItemText primary="Admin" />
          </UI.ListItemButton>
        </UI.List>
      </UI.FillBox>
    )
