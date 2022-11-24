import { Cmd } from "../Core"
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
  | ["ClickedDebug"]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]

    case "ClickedLogout":
      return [model, Route.push(["Logout"])]

    case "ClickedUpdateProfile":
      return [model, Route.push(["ProfileUpdate"])]

    case "ClickedDeleteProfile":
      return [model, Route.push(["ProfileDelete"])]

    case "ClickedDebug":
      return [model, Cmd.None]
  }
}

//
//
//
// View
//
//
//

export const View = ({
  username,
  $d,
}: {
  username: string
  $d: (msg: Msg) => void
  model: Model
}) => (
  <UI.FillBox>
    <UI.Header title={username} />

    <UI.List>
      <UI.ListItemButton onClick={() => $d(["ClickedUpdateProfile"])}>
        <UI.ListItemIcon>
          <UI.Icons.Edit />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Update Profile" />
        <UI.ListItemSecondaryAction>
          <UI.Icons.ChevronRight />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $d(["ClickedDeleteProfile"])}>
        <UI.ListItemIcon>
          <UI.Icons.Delete />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Delete Profile" />
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $d(["ClickedLogout"])}>
        <UI.ListItemIcon>
          <UI.Icons.Logout />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Logout" />
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $d(["ClickedDebug"])}>
        <UI.ListItemIcon>
          <UI.Icons.BugReport />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Debug" />
        <UI.ListItemSecondaryAction>
          <UI.Icons.ChevronRight />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>
    </UI.List>
  </UI.FillBox>
)
