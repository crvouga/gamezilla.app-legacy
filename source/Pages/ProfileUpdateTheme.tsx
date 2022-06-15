import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { attempt } from "Framework/Task";
import * as Navigation from "Framework/Navigation";
import * as Profile from "Profile";
import * as Snackbar from "Snackbar";
import * as View from "View";

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
  | { type: "UpdateThemeFailed" }
  | { type: "UpdateThemeSucceeded" }
  | { type: "UserClickedThemeModeOption"; themeMode: Profile.ThemeMode };

type OutMsg = Snackbar.GroupedMsg;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UpdateThemeSucceeded":
      return [
        { ...model, status: "Idle" },
        cmd.none,
        [Snackbar.EnqueuedSnackbar("Updated name.")],
      ];

    case "UpdateThemeFailed":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "UserClickedBackButton":
      return [model, Navigation.back(), []];

    case "UserClickedThemeModeOption":
      return [
        { ...model, status: "Updating" },
        pipe(
          Profile.edit({
            userId,
            themeMode: msg.themeMode,
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "UpdateThemeFailed" }),
              () => ({ type: "UpdateThemeSucceeded" })
            )
          )
        ),
        [],
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
    );
