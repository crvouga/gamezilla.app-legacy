import * as ProfileAvatar from "ProfileAvatar";
import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, pipe } from "Core";

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

export type Msg =
  | { type: "UserClickedCancelButton" }
  | { type: "UserClickedDoneButton" }
  | { type: "StyleSelectClosed" }
  | { type: "StyleSelectOpened" }
  | { type: "UserSelectedStyle"; style: ProfileAvatar.Style }
  | { type: "UserEnteredSeed"; seed: ProfileAvatar.Seed }
  | { type: "UserClickedRandomSeedButton" }
  | { type: "RandomSeedGenerated"; seed: ProfileAvatar.Seed };

type OutAction = Snackbar.Action | Store.Action;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, Route.back, []];

    case "StyleSelectClosed":
      return [{ ...model, status: "Idle" }, Cmd.None, []];

    case "StyleSelectOpened":
      return [{ ...model, status: "StyleSelectOpened" }, Cmd.None, []];

    case "UserEnteredSeed":
      return [{ ...model, seed: msg.seed }, Cmd.None, []];

    case "UserClickedRandomSeedButton":
      return [
        { ...model, status: "GeneratingSeed" },
        pipe(
          ProfileAvatar.generateRandomSeed,
          Cmd.fromTask((seed) => ({
            type: "RandomSeedGenerated",
            seed,
          })),
        ),
        [],
      ];

    case "RandomSeedGenerated":
      return [{ ...model, status: "Idle", seed: msg.seed }, Cmd.None, []];

    case "UserSelectedStyle":
      return [{ ...model, style: msg.style }, Cmd.None, []];

    case "UserClickedDoneButton":
      return [
        { ...model },
        Route.back,
        [
          Store.Profile.Edit(userId, {
            avatarUrl: ProfileAvatar.toUrl(model),
          }),
        ],
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

export const view = (model: Model): UI.View<Msg> => {
  return (dispatch) => (
    <UI.Page>
      <UI.Header
        left={
          <UI.Button
            sx={{ marginLeft: -1 }}
            onClick={() => dispatch({ type: "UserClickedCancelButton" })}
          >
            Cancel
          </UI.Button>
        }
        title="Avatar"
        right={
          <UI.Button
            sx={{ marginRight: -1 }}
            onClick={() => dispatch({ type: "UserClickedDoneButton" })}
          >
            Done
          </UI.Button>
        }
      />

      <UI.Avatar
        src={ProfileAvatar.toUrl(model)}
        sx={{
          marginX: "auto",
          width: "150px",
          height: "150px",
          marginBottom: 1,
        }}
      />

      <UI.LoadingDialog
        open={model.status === "UpdatingAvatar"}
        title="Updating avatar..."
      />

      <UI.Box sx={{ padding: 2 }}>
        <UI.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </UI.Typography>
        <UI.Select
          sx={{ marginBottom: 2 }}
          open={model.status === "StyleSelectOpened"}
          fullWidth
          value={model.style}
          onOpen={() => dispatch({ type: "StyleSelectOpened" })}
          onClose={() => dispatch({ type: "StyleSelectClosed" })}
          renderValue={(style) => (
            <UI.Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <UI.Avatar
                sx={{ marginRight: 1, width: 24, height: 24 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <UI.Typography>{ProfileAvatar.formatStyle(style)}</UI.Typography>
            </UI.Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <UI.MenuItem
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
              <UI.Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <UI.Typography>{ProfileAvatar.formatStyle(style)}</UI.Typography>
            </UI.MenuItem>
          ))}
        </UI.Select>

        <UI.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </UI.Typography>

        <UI.TextField
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

        <UI.Button
          loading={model.status === "GeneratingSeed"}
          fullWidth
          variant="outlined"
          onClick={() => dispatch({ type: "UserClickedRandomSeedButton" })}
          sx={{ marginBottom: 4 }}
        >
          Random Seed
        </UI.Button>
      </UI.Box>
    </UI.Page>
  );
};
