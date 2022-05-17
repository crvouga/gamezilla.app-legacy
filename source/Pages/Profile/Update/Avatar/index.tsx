import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import UrlPattern from "url-pattern";
import { cmd, react } from "../../Framework";
import * as ProfileAvatar from "../../ProfileAvatar";
import * as Routes from "../../Routes";
import * as View from "../../View";

// ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝

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

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝

export type Msg =
  | { type: "ClickedBackButton" }
  | { type: "ClickedStyle" }
  | { type: "ClickedSeed" }
  | { type: "ClickedStyleListItem"; style: ProfileAvatar.Style }
  | { type: "LocationChanged"; location: { pathname: string } };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [model, cmd.none];

    case "ClickedStyleListItem":
      return [{ ...model, style: msg.style }, cmd.none];

    case "ClickedBackButton":
      return [model, Routes.replace({ type: "ProfileUpdate" })];

    case "ClickedSeed":
      return [model, cmd.none];

    case "ClickedStyle":
      return [model, cmd.none];
  }
};

// ██╗   ██╗██╗███████╗██╗    ██╗
// ██║   ██║██║██╔════╝██║    ██║
// ██║   ██║██║█████╗  ██║ █╗ ██║
// ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝

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
