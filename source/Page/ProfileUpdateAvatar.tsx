import { LoadingButton } from "@mui/lab";
import { Box, Avatar, List } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as Routes from "../Routes";
import * as View from "../View";

//
//
//
//
// Model
//
//
//
//

export type Model = {
  status: "Idle" | "Loading";
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  return {
    status: "Idle",
    ...ProfileAvatar.parseUrl(avatarUrl),
  };
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { group: "ProfileUpdateAvatar"; type: "Back" }
  | { group: "ProfileUpdateAvatar"; type: "ClickedStyle" }
  | { group: "ProfileUpdateAvatar"; type: "ClickedSeed" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace({ type: "ProfileUpdate" })];

    case "ClickedSeed":
      return [model, Routes.push({ type: "ProfileUpdateAvatarStyle" })];

    case "ClickedStyle":
      return [model, Routes.push({ type: "ProfileUpdateAvatarStyle" })];
  }
};

//
//
//
//
// View
//
//
//
//

export const view =
  (
    profile: { username: string; name: string; avatarUrl: string },
    model: Model
  ): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({ group: "ProfileUpdateAvatar", type: "Back" })
              }
            />
          }
          title="Avatar"
        />

        <Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "150px",
            height: "150px",
            marginBottom: 1,
          }}
        />

        <List>
          <View.Field
            label="Style"
            value={ProfileAvatar.formatStyle(model.style)}
            onClick={() =>
              dispatch({ group: "ProfileUpdateAvatar", type: "ClickedStyle" })
            }
          />

          <View.Field
            label="Seed"
            value={model.seed}
            onClick={() =>
              dispatch({ group: "ProfileUpdateAvatar", type: "ClickedSeed" })
            }
          />
        </List>
        <Box sx={{ paddingX: 2 }}>
          <LoadingButton fullWidth variant="contained">
            Update Avatar
          </LoadingButton>
        </Box>
      </View.Page>
    );
