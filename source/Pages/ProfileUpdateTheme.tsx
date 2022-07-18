import * as Route from "../Route";
import * as Store from "../Store";
import * as Profile from "../Store/Profile";
import * as UI from "../UI";
import { Cmd } from "../Core";

//
//
//
// Model
//
//
//

export type Model = { status: "Idle" | "Updating" };

export const init: Model = {
  status: "Idle",
};

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedThemeMode", Profile.Profile["themeMode"]];

type OutMsg = ["Store", Store.Action];

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back, []];

    case "ClickedThemeMode":
      return [
        model,
        Cmd.None,
        [["Store", Store.Profile.Edit(userId, { themeMode: msg[1] })]],
      ];
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
  (profile: Profile.Profile, model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
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
      </UI.Page>
    );
