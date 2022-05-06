import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as View from "../View";

/* 


Model


*/

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

/* 


Update


*/

export type Msg =
  | { group: "ProfileUpdateAvatarStyle"; type: "SelectedStyle" }
  | { group: "ProfileUpdateAvatarStyle"; type: "Back" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  return [model, cmd.none];
};

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({ group: "ProfileUpdateAvatarStyle", type: "Back" })
              }
            />
          }
          title="Choose Style"
        />
        <List sx={{ overflowY: "scroll" }}>
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  src={ProfileAvatar.toUrl({
                    style,
                    seed: ProfileAvatar.toSeed("hello"),
                  })}
                />
              </ListItemAvatar>
              <ListItemText primary={ProfileAvatar.formatStyle(style)} />
            </ListItem>
          ))}
        </List>
      </View.Page>
    );
