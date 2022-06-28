import * as Route from "Route"
import * as Store from "Store"
import * as Profile from "Store/Profile"
import * as View from "View"
import { Cmd } from "Core"

//
//
//
// Model
//
//
//

export type Model = { status: "Idle" | "Updating" }

export const init: Model = {
  status: "Idle",
}

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | {
      type: "UserClickedThemeModeOption"
      themeMode: Profile.Profile["themeMode"]
    }

type OutMsg = Store.Action

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back, []]

    case "UserClickedThemeModeOption":
      return [
        model,
        Cmd.None,
        [Store.Profile.Edit(userId, { themeMode: msg.themeMode })],
      ]
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
  (profile: Profile.Profile, model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Theme"
        />

        <View.LoadingDialog
          open={model.status === "Updating"}
          title="Updating theme..."
        />

        <View.Box sx={{ padding: 2 }}>
          <View.ThemeModeToggleButtons
            themeMode={profile.themeMode}
            onChange={(themeMode) =>
              dispatch({
                type: "UserClickedThemeModeOption",
                themeMode,
              })
            }
          />
        </View.Box>
      </View.Page>
    )
