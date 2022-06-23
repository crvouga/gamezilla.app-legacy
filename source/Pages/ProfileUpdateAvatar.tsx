import { pipe } from "fp-ts/lib/function";
import { cmd } from "Core";
import * as Navigation from "Core/Navigation";
import { perform } from "Core/Task";
import * as ProfileAvatar from "ProfileAvatar";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = {
  status: "Idle" | "GeneratingSeed" | "StyleSelectOpened" | "UpdatingAvatar";
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  const { seed, style } = ProfileAvatar.parseUrl(avatarUrl);

  return {
    status: "Idle",
    seed,
    style,
  };
};

//
//
//
// Update
//
//
//

export type GroupedMsg = { group: "ProfileUpdateAvatar" } & Msg;

export type Msg =
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedDoneButton" }
  | { type: "StyleSelectClosed" }
  | { type: "StyleSelectOpened" }
  | { type: "UserSelectedStyle"; style: ProfileAvatar.Style }
  | { type: "UserEnteredSeed"; seed: ProfileAvatar.Seed }
  | { type: "UserClickedRandomSeedButton" }
  | { type: "RandomSeedGenerated"; seed: ProfileAvatar.Seed };

type OutMsg = Snackbar.GroupedMsg | Store.GroupedMsg;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Navigation.back(), []];

    case "StyleSelectClosed":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "StyleSelectOpened":
      return [{ ...model, status: "StyleSelectOpened" }, cmd.none, []];

    case "UserEnteredSeed":
      return [{ ...model, seed: msg.seed }, cmd.none, []];

    case "UserClickedRandomSeedButton":
      return [
        { ...model, status: "GeneratingSeed" },
        pipe(
          ProfileAvatar.generateRandomSeed,
          perform((seed) => ({ type: "RandomSeedGenerated", seed }))
        ),
        [],
      ];

    case "RandomSeedGenerated":
      return [{ ...model, status: "Idle", seed: msg.seed }, cmd.none, []];

    case "UserSelectedStyle":
      return [{ ...model, style: msg.style }, cmd.none, []];

    case "UserClickedDoneButton":
      return [
        { ...model },
        Navigation.back(),
        [Store.Profile.Edit(userId, { avatarUrl: ProfileAvatar.toUrl(model) })],
      ];
  }
};

//
//
//
// Update
//
//
//

export const view = (model: Model): View.View<Msg> => {
  return (dispatch) => (
    <View.Page>
      <View.Header
        left={
          <View.Button
            sx={{ marginLeft: -1 }}
            onClick={() => dispatch({ type: "UserClickedCancelButton" })}
          >
            Cancel
          </View.Button>
        }
        title="Avatar"
        right={
          <View.Button
            sx={{ marginRight: -1 }}
            onClick={() => dispatch({ type: "UserClickedDoneButton" })}
          >
            Done
          </View.Button>
        }
      />

      <View.Avatar
        src={ProfileAvatar.toUrl(model)}
        sx={{
          marginX: "auto",
          width: "150px",
          height: "150px",
          marginBottom: 1,
        }}
      />

      <View.LoadingDialog
        open={model.status === "UpdatingAvatar"}
        title="Updating avatar..."
      />

      <View.Box sx={{ padding: 2 }}>
        <View.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </View.Typography>
        <View.Select
          sx={{ marginBottom: 2 }}
          open={model.status === "StyleSelectOpened"}
          fullWidth
          value={model.style}
          onOpen={() => dispatch({ type: "StyleSelectOpened" })}
          onClose={() => dispatch({ type: "StyleSelectClosed" })}
          renderValue={(style) => (
            <View.Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View.Avatar
                sx={{ marginRight: 1, width: 24, height: 24 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <View.Typography>
                {ProfileAvatar.formatStyle(style)}
              </View.Typography>
            </View.Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <View.MenuItem
              key={style}
              value={style}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              onClick={() =>
                dispatch({
                  type: "UserSelectedStyle",
                  style,
                })
              }
            >
              <View.Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <View.Typography>
                {ProfileAvatar.formatStyle(style)}
              </View.Typography>
            </View.MenuItem>
          ))}
        </View.Select>

        <View.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </View.Typography>

        <View.TextField
          fullWidth
          value={model.seed}
          onChange={(event) =>
            dispatch({
              type: "UserEnteredSeed",
              seed: ProfileAvatar.toSeed(event.currentTarget.value),
            })
          }
          sx={{ marginBottom: 2 }}
        />

        <View.Button
          loading={model.status === "GeneratingSeed"}
          fullWidth
          variant="outlined"
          onClick={() => dispatch({ type: "UserClickedRandomSeedButton" })}
          sx={{ marginBottom: 4 }}
        >
          Random Seed
        </View.Button>
      </View.Box>
    </View.Page>
  );
};
