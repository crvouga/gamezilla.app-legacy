import * as UI from "@gamezilla/ui"

//
//
//
// Model
//
//
//

export type Model = null

export const init: Model = null

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



//
//
//
// View
//
//
//

export const View = ({
  username,
  $send,
}: {
  username: string
  $send: (msg: Msg) => void
  model: Model
}) => (
  <UI.FillBox>
    <UI.Header title={username} />

    <UI.List>
      <UI.ListItemButton onClick={() => $send(["ClickedUpdateProfile"])}>
        <UI.ListItemIcon>
          <UI.Icons.Edit />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Update Profile" />
        <UI.ListItemSecondaryAction>
          <UI.Icons.ChevronRight />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $send(["ClickedDeleteProfile"])}>
        <UI.ListItemIcon>
          <UI.Icons.Delete />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Delete Profile" />
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $send(["ClickedLogout"])}>
        <UI.ListItemIcon>
          <UI.Icons.Logout />
        </UI.ListItemIcon>
        <UI.ListItemText primary="Logout" />
      </UI.ListItemButton>

      <UI.ListItemButton onClick={() => $send(["ClickedDebug"])}>
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
