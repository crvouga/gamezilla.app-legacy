import { cmd } from "Core"
import * as Navigation from "Core/Navigation"
import * as Store from "Store"
import * as Profile from "Store/Profile"
import * as View from "View"

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
  | { type: "UserClickedThemeModeOption"; themeMode: Profile.ThemeMode }

type OutMsg = Store.GroupedMsg

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Navigation.back(), []]

    case "UserClickedThemeModeOption":
      return [
        model,
        cmd.none,
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
              dispatch({ type: "UserClickedThemeModeOption", themeMode })
            }
          />
        </View.Box>
      </View.Page>
    )
