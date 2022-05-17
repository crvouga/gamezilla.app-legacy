import { LoadingButton } from "@mui/lab";
import {
  ListItemText,
  Box,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
} from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as Routes from "../Routes";
import * as View from "../View";

// 88b           d88                        88              88
// 888b         d888                        88              88
// 88`8b       d8'88                        88              88
// 88 `8b     d8' 88   ,adPPYba,    ,adPPYb,88   ,adPPYba,  88
// 88  `8b   d8'  88  a8"     "8a  a8"    `Y88  a8P_____88  88
// 88   `8b d8'   88  8b       d8  8b       88  8PP"""""""  88
// 88    `888'    88  "8a,   ,a8"  "8a,   ,d88  "8b,   ,aa  88
// 88     `8'     88   `"YbbdP"'    `"8bbdP"Y8   `"Ybbd8"'  88

export type Model = {
  status: "Idle" | "Loading";
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
  page: "Main" | "Style" | "Seed";
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  return {
    status: "Idle",
    page: "Main",
    ...ProfileAvatar.parseUrl(avatarUrl),
  };
};

// 88        88                        88
// 88        88                        88                ,d
// 88        88                        88                88
// 88        88  8b,dPPYba,    ,adPPYb,88  ,adPPYYba,  MM88MMM  ,adPPYba,
// 88        88  88P'    "8a  a8"    `Y88  ""     `Y8    88    a8P_____88
// 88        88  88       d8  8b       88  ,adPPPPP88    88    8PP"""""""
// Y8a.    .a8P  88b,   ,a8"  "8a,   ,d88  88,    ,88    88,   "8b,   ,aa
//  `"Y8888Y"'   88`YbbdP"'    `"8bbdP"Y8  `"8bbdP"Y8    "Y888  `"Ybbd8"'
//               88
//               88

export type Msg =
  | { type: "ClickedBackButton" }
  | { type: "ClickedStyle" }
  | { type: "ClickedSeed" }
  | { type: "ClickedStyleListItem"; style: ProfileAvatar.Style };

export const update = (
  {
    userId,
    location: { pathname: string },
  }: { userId: string; location: { pathname: string } },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedStyleListItem":
      return [{ ...model, style: msg.style }, cmd.none];

    case "ClickedBackButton":
      return [model, Routes.replace({ type: "ProfileUpdate" })];

    case "ClickedSeed":
      return [model, Routes.push({ type: "ProfileUpdateAvatarStyle" })];

    case "ClickedStyle":
      return [model, Routes.push({ type: "ProfileUpdateAvatarStyle" })];
  }
};

// 8b           d8  88
// `8b         d8'  ""
//  `8b       d8'
//   `8b     d8'    88   ,adPPYba,  8b      db      d8
//    `8b   d8'     88  a8P_____88  `8b    d88b    d8'
//     `8b d8'      88  8PP"""""""   `8b  d8'`8b  d8'
//      `888'       88  "8b,   ,aa    `8bd8'  `8bd8'
//       `8'        88   `"Ybbd8"'      YP      YP

type Profile = { username: string; name: string; avatarUrl: string };

export const view = (profile: Profile, model: Model): react.Html<Msg> => {
  switch (model.page) {
    case "Main":
      return viewMain(profile, model);

    case "Seed":
      return () => <>view seed</>;

    case "Style":
      return viewPageStyle(model);
  }
};

const viewMain = (profile: Profile, model: Model): react.Html<Msg> => {
  return (dispatch) => (
    <View.Page>
      <View.Header
        left={
          <View.HeaderBackButton
            onClick={() => dispatch({ type: "ClickedBackButton" })}
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
          onClick={() => dispatch({ type: "ClickedStyle" })}
        />

        <View.Field
          label="Seed"
          value={model.seed}
          onClick={() => dispatch({ type: "ClickedSeed" })}
        />
      </List>
      <Box sx={{ paddingX: 2 }}>
        <LoadingButton fullWidth variant="contained">
          Update Avatar
        </LoadingButton>
      </Box>
    </View.Page>
  );
};

const viewPageStyle =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({
                  type: "ClickedBackButton",
                })
              }
            />
          }
          title="Choose Style"
        />
        <List sx={{ overflowY: "scroll" }}>
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <ListItemButton
              onClick={() =>
                dispatch({
                  type: "ClickedStyleListItem",
                  style,
                })
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={ProfileAvatar.toUrl({
                    style,
                    seed: ProfileAvatar.toSeed("hello"),
                  })}
                />
              </ListItemAvatar>
              <ListItemText primary={ProfileAvatar.formatStyle(style)} />
            </ListItemButton>
          ))}
        </List>
      </View.Page>
    );
