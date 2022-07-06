import * as Route from "Route";
import * as Store from "Store";
import * as Profile from "Store/Profile";
import * as UI from "UI";
import { Cmd } from "Core";

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
  | { type: "UserClickedBackButton" }
  | {
      type: "UserClickedThemeModeOption";
      themeMode: Profile.Profile["themeMode"];
    };

type OutMsg = Store.Action;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back, []];

    case "UserClickedThemeModeOption":
      return [
        model,
        Cmd.None,
        [Store.Profile.Edit(userId, { themeMode: msg.themeMode })],
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
            <UI.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
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
            onChange={(themeMode) =>
              dispatch({
                type: "UserClickedThemeModeOption",
                themeMode,
              })
            }
          />
        </UI.Box>
      </UI.Page>
    );
