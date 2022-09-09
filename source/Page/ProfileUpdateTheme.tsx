import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as Store from "../Store"
import * as Profile from "../Store/Profile"
import * as UI from "../UI"

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
  | ["ClickedBack"]
  | ["ClickedThemeMode", Profile.Profile["themeMode"]]

type OutMsg = Store.Action

export const update = (
  { userId }: { userId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back, []]

    case "ClickedThemeMode":
      const themeMode = msg[1]
      return [
        model,
        Cmd.None,
        [["Store", ["Profile", ["Edit", { userId, edits: { themeMode } }]]]],
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

export const View = ({
  profile,
  model,
  dispatch,
}: {
  profile: Profile.Profile
  model: Model
  dispatch: (msg: Msg) => void
}) => (
  <UI.FillBox>
    <UI.Header
      left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
      title="Theme"
    />

    <UI.LoadingDialog
      open={model.status === "Updating"}
      title="Updating theme..."
    />

    <UI.Box sx={{ padding: 2 }}>
      <UI.ThemeModeToggleButtons
        themeMode={profile.themeMode}
        onChange={(themeMode) => dispatch(["ClickedThemeMode", themeMode])}
      />
    </UI.Box>
  </UI.FillBox>
)
