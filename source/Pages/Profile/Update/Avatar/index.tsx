import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { option } from "fp-ts";
import { cmd, navigation, react } from "Framework";
import * as ProfileAvatar from "ProfileAvatar";
import * as React from "react";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = {
  status: "Idle" | "Loading";
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
  page: { type: "Main" } | { type: "Style" } | { type: "Seed" };
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  return {
    status: "Idle",
    page: { type: "Main" },
    ...ProfileAvatar.parseUrl(avatarUrl),
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
  | { type: "ClickedBackButton" }
  | { type: "ClickedStyle" }
  | { type: "ClickedSeed" }
  | { type: "ClickedStyleListItem"; style: ProfileAvatar.Style }
  | { type: "LocationChanged"; location: navigation.Location };

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
      return [model, navigation.back()];

    case "ClickedSeed":
      return [model, navigation.push("/ProfileUpdateAvatar/Seed")];

    case "ClickedStyle":
      return [model, cmd.none];
  }
};

//
//
//
// Update
//
//
//

type Profile = { username: string; name: string; avatarUrl: string };

export const view = (profile: Profile, model: Model): react.Html<Msg> => {
  switch (model.page.type) {
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

//
//
//
// Routes
//
//
//

type Route = { type: "Main" } | { type: "Style" } | { type: "Seed" };

const routesTypes: { [routeType in Route["type"]]: string } = {
  Main: "Main",
  Style: "Style",
  Seed: "Seed",
};

const isRouteType = (routeType: string): routeType is Route["type"] => {
  return routeType in routesTypes;
};

export const decode = (location: {
  pathname: string;
}): option.Option<Route> => {
  const path = location.pathname.substring(1);

  if (isRouteType(path)) {
    return option.some({ type: path });
  }

  return option.none;
};

export const encode = (route: Route): string => {
  return route.type;
};
