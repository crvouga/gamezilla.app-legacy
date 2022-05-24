import { Avatar, Box, MenuItem, Select, TextField } from "@mui/material";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { attempt, perform } from "Framework/Task";
import * as ProfileAvatar from "ProfileAvatar";
import * as Profile from "Profile";
import * as React from "react";
import * as Snackbar from "Snackbar";
import * as View from "View";
import { either } from "fp-ts";

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
  | { type: "RandomSeedGenerated"; seed: ProfileAvatar.Seed }
  | { type: "AvatarUpdateFailed" }
  | { type: "AvatarUpdateSucceeded" };

type OutMsg = Snackbar.GroupedMsg;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedCancelButton":
      return [model, navigation.back(), []];

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
        { ...model, status: "UpdatingAvatar" },
        pipe(
          Profile.edit({
            userId,
            avatarUrl: ProfileAvatar.toUrl({
              seed: model.seed,
              style: model.style,
            }),
          }),
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "AvatarUpdateFailed" }),
              () => ({ type: "AvatarUpdateSucceeded" })
            )
          )
        ),
        [],
      ];

    case "AvatarUpdateFailed":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "AvatarUpdateSucceeded":
      return [
        { ...model, status: "Idle" },
        navigation.back(),
        [Snackbar.EnqueuedSnackbar("Updated avatar.")],
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

export const view = (model: Model): react.Html<Msg> => {
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

      <Avatar
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

      <Box sx={{ padding: 2 }}>
        <View.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </View.Typography>
        <Select
          sx={{ marginBottom: 2 }}
          open={model.status === "StyleSelectOpened"}
          fullWidth
          value={model.style}
          onOpen={() => dispatch({ type: "StyleSelectOpened" })}
          onClose={() => dispatch({ type: "StyleSelectClosed" })}
          renderValue={(style) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <View.Typography>
                {ProfileAvatar.formatStyle(style)}
              </View.Typography>
            </Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <MenuItem
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
              <Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <View.Typography>
                {ProfileAvatar.formatStyle(style)}
              </View.Typography>
            </MenuItem>
          ))}
        </Select>

        <View.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </View.Typography>

        <TextField
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
      </Box>
    </View.Page>
  );
};
