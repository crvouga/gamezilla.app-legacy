import * as Route from "Route"
import * as View from "View"
import { Cmd } from "Core"

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
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedLogoutLink" }
  | { type: "UserClickedDeleteProfileLink" }
  | { type: "UserClickedUpdateProfileLink" }

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back()]

    case "UserClickedLogoutLink":
      return [model, Route.push({ type: "Logout" })]

    case "UserClickedUpdateProfileLink":
      return [model, Route.push({ type: "ProfileUpdate" })]

    case "UserClickedDeleteProfileLink":
      return [model, Route.push({ type: "ProfileDelete" })]
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
  ({ username }: { username: string }, model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={username}
        />

        <View.List>
          <View.ListItemButton
            onClick={() => dispatch({ type: "UserClickedUpdateProfileLink" })}
          >
            <View.ListItemIcon>
              <View.Icons.Edit />
            </View.ListItemIcon>
            <View.ListItemText primary="Update Profile" />
            <View.ListItemSecondaryAction>
              <View.Icons.ChevronRight />
            </View.ListItemSecondaryAction>
          </View.ListItemButton>

          <View.ListItemButton
            onClick={() => dispatch({ type: "UserClickedDeleteProfileLink" })}
          >
            <View.ListItemIcon>
              <View.Icons.Delete />
            </View.ListItemIcon>
            <View.ListItemText primary="Delete Profile" />
          </View.ListItemButton>

          <View.ListItemButton
            onClick={() => dispatch({ type: "UserClickedLogoutLink" })}
          >
            <View.ListItemIcon>
              <View.Icons.Logout />
            </View.ListItemIcon>
            <View.ListItemText primary="Logout" />
          </View.ListItemButton>
        </View.List>
      </View.Page>
    )
