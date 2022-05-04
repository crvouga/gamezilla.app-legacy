import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  List,
} from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Profile from "../Profile";
import * as Session from "../Session";
import * as Router from "../Router";
import * as Navigation from "../Framework/Navigation";

/* 


Model


*/

type Form = {
  username: string;
  name: string;
  avatarUrl: string;
};

export type Model = { status: "Idle" | "Loading"; form: Form };

export const init = (form: Form): Model => {
  return {
    status: "Idle",
    form,
  };
};

/* 


Update


*/

export type Msg =
  | { type: "ClickedBack" }
  | { type: "ClickedName" }
  | { type: "ClickedUsername" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "ClickedBack":
        return [model, Navigation.replace("Account")];

      case "ClickedName":
        return [model, Navigation.push("ProfileUpdateName")];

      case "ClickedUsername":
        return [model, Navigation.push("ProfileUpdateUsername")];
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
            <IconButton
              edge="start"
              onClick={() => dispatch({ type: "ClickedBack" })}
            >
              <ChevronLeft />
            </IconButton>
          </Box>

          <Typography sx={{ flex: 2 }} align="center" variant="h6">
            Update Profile
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

        <Button sx={{ display: "block", marginX: "auto", marginBottom: 2 }}>
          Change Avatar
        </Button>

        <List>
          {viewField({
            label: "Username",
            value: profile.username,
            onClick: () => dispatch({ type: "ClickedUsername" }),
          })(dispatch)}
          {viewField({
            label: "Name",
            value: profile.name,
            onClick: () => dispatch({ type: "ClickedName" }),
          })(dispatch)}
        </List>
      </Box>
    );

const viewField =
  ({
    label,
    value,
    onClick,
  }: {
    label: string;
    value: string;
    onClick: () => void;
  }): react.Html<Msg> =>
  () => {
    return (
      <ListItemButton onClick={onClick}>
        <ListItemText
          primaryTypographyProps={{
            variant: "subtitle1",
            color: "text.primary",
          }}
          primary={label}
          secondaryTypographyProps={{ variant: "h6", color: "text.secondary" }}
          secondary={value}
        />
        <ListItemSecondaryAction>
          <ChevronRight />
        </ListItemSecondaryAction>
      </ListItemButton>
    );
  };
