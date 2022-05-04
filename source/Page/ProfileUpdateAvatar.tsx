import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as Router from "../Router";
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
  | { type: "Back" }
  | { type: "ClickedStyle" }
  | { type: "ClickedSeed" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "Back":
        return [model, Router.replace("ProfileUpdate")];

      case "ClickedSeed":
        return [model, Router.push("ProfileUpdate")];

      case "ClickedStyle":
        return [model, Router.push("ProfileUpdate")];
    }
  };

/* 


View


*/

export const view =
  (
    profile: { username: string; name: string; avatarUrl: string },
    model: Model
  ): react.Html<Msg> =>
  (dispatch) =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <IconButton edge="start" onClick={() => dispatch({ type: "Back" })}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography sx={{ flex: 2 }} align="center" variant="h6">
            Avatar
          </Typography>

          <Box sx={{ flex: 1 }}></Box>
        </Toolbar>

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
          {View.viewField<Msg>({
            label: "Style",
            value: model.style,
            onClick: () => dispatch({ type: "ClickedStyle" }),
          })(dispatch)}

          {View.viewField<Msg>({
            label: "Seed",
            value: model.seed,
            onClick: () => dispatch({ type: "ClickedSeed" }),
          })(dispatch)}
        </List>
      </Box>
    );
