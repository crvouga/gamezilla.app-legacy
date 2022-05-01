import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { cmd } from "elm-ts";
import { Html } from "elm-ts/lib/React";
import * as Sub from "elm-ts/lib/Sub";
import * as React from "react";
import * as Rx from "rxjs";
import * as Supabase from "./Supabase";

//  Model

export type Model =
  | { type: "Loading" }
  | { type: "LoggedOut" }
  | { type: "LoggingIn" }
  | { type: "LoggingOut" }
  | { type: "LoggedIn"; userId: string };

export const init: [Model, cmd.Cmd<Msg>] = [{ type: "Loading" }, cmd.none];

//  Update

export type Msg =
  | { type: "LoggedIn"; userId: string; defaultName: string }
  | { type: "LoggedOut" }
  | { type: "LogIn" }
  | { type: "LogInCancel" }
  | { type: "LogOut" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return [{ type: "LoggedIn", userId: msg.userId }, cmd.none];

    case "LoggedOut":
      return [{ type: "LoggedOut" }, cmd.none];

    case "LogIn":
      return [{ type: "LoggingIn" }, logIn()];

    case "LogOut":
      return [{ type: "LoggingOut" }, logOut()];

    case "LogInCancel":
      return [{ type: "LoggedOut" }, loginCancel()];
  }
};

// Commands

const logIn = (): cmd.Cmd<Msg> => {
  return new Rx.Observable(() => {
    Supabase.client.auth.signIn({ provider: "google" });
  });
};

const logOut = (): cmd.Cmd<Msg> => {
  return new Rx.Observable(() => {
    Supabase.client.auth.signOut();
  });
};

const loginCancel = (): cmd.Cmd<Msg> => {
  return new Rx.Observable(() => {
    window.onbeforeunload = function () {
      return "Cancel login?";
    };
  });
};

//  View

export const view = (model: Model): Html<Msg> => {
  switch (model.type) {
    case "Loading":
      return viewLoading({ subtitle: "Loading..." });

    case "LoggedIn":
      return viewLoggedIn;

    case "LoggedOut":
      return viewLoggedOut;

    case "LoggingOut":
      return viewLoading({
        subtitle: "Logging out...",
      });

    case "LoggingIn":
      return viewLoading({
        subtitle: "Logging in...",
        onCancel: {
          type: "LogInCancel",
        },
      });
  }
};

const viewLoggedIn: Html<Msg> = (dispatch) => (
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
      <Typography sx={{ flex: 1 }} variant="h6">
        Home
      </Typography>
      <Avatar />
    </Toolbar>

    <Box
      sx={{
        padding: 2,
      }}
    >
      <Button
        size="large"
        fullWidth
        variant="outlined"
        onClick={() => dispatch({ type: "LogOut" })}
      >
        Logout
      </Button>
    </Box>
  </Box>
);

const viewLoggedOut: Html<Msg> = (dispatch) => (
  <Box
    sx={{
      position: "fixed",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
    }}
  >
    <Typography variant="h1" sx={{ marginBottom: 2 }}>
      Gamezilla
    </Typography>
    <LoadingButton
      variant="outlined"
      size="large"
      fullWidth
      onClick={() => {
        dispatch({ type: "LogIn" });
      }}
    >
      Continue With Google
    </LoadingButton>
  </Box>
);

const viewLoading =
  ({ subtitle, onCancel }: { subtitle: string; onCancel?: Msg }): Html<Msg> =>
  (dispatch) => {
    return (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress sx={{ marginBottom: 2 }} />
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ marginBottom: 2 }}
        >
          {subtitle}
        </Typography>
        {onCancel && (
          <Button variant="outlined" onClick={() => dispatch(onCancel)}>
            Cancel
          </Button>
        )}
      </Box>
    );
  };

// Subscriptions

const authSubs = new Rx.Subject<Msg>();

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return authSubs;
};

export const sessionToMsg = (session: Supabase.Session | null): Msg => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return { type: "LoggedIn", userId, defaultName };
  }

  return { type: "LoggedOut" };
};

const timeout = setTimeout(() => {
  authSubs.next(sessionToMsg(Supabase.client.auth.session()));
}, 1000);

const { data } = Supabase.client.auth.onAuthStateChange((state, session) => {
  clearTimeout(timeout);
  authSubs.next(sessionToMsg(session));
});
