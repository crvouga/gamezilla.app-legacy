import { LoadingButton } from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { cmd, react, sub } from "elm-ts";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import * as Rx from "rxjs";
import * as ProfileCreate from "./Page/ProfileCreate";
import * as Profile from "./Profile";
import * as Supabase from "./Supabase";

/* 


Model


*/

export type Model =
  | { type: "Loading" }
  | { type: "LoggedOut" }
  | { type: "LoggingOut" }
  | { type: "LoggingIn" }
  | { type: "ProfileLoading"; defaultName: string; userId: string }
  | {
      type: "ProfileNotFound";
      defaultName: string;
      userId: string;
      child: ProfileCreate.Model;
    }
  | { type: "ProfileFound"; profile: Profile.Profile };

type Flags = null;

export const init = (flags: Flags): [Model, cmd.Cmd<Msg>] => {
  return [{ type: "Loading" }, cmd.none];
};

/*


Update


*/

export type Msg =
  | { type: "LoggedIn"; userId: string; defaultName: string }
  | { type: "LoggedOut" }
  | { type: "LogIn" }
  | { type: "LogOut" }
  | { type: "ProfileNotFound" }
  | { type: "ProfileFound"; profile: Profile.Profile }
  | { type: "ProfileCreateMsg"; msg: ProfileCreate.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return [
        { ...msg, type: "ProfileLoading" },
        Profile.fetch<Msg>(
          { userId: msg.userId },
          (profile) => ({ type: "ProfileFound", profile }),
          () => ({ type: "ProfileNotFound" })
        ),
      ];

    case "LoggedOut":
      return [{ type: "LoggedOut" }, cmd.none];

    case "LogIn":
      return [{ type: "LoggingIn" }, logIn()];

    case "LogOut":
      return [{ type: "LoggingOut" }, logOut()];

    case "ProfileFound":
      return [{ ...msg, type: "ProfileFound" }, cmd.none];

    case "ProfileNotFound":
      if (model.type === "ProfileLoading") {
        return [
          {
            ...model,
            type: "ProfileNotFound",
            child: ProfileCreate.init(model),
          },
          cmd.none,
        ];
      }

      return [model, cmd.none];

    case "ProfileCreateMsg":
      if (model.type === "ProfileNotFound") {
        return [model, cmd.none];
      }

      return [model, cmd.none];
  }
};

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

/* 


View


*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Loading":
      return viewLoading;

    case "ProfileLoading":
      return viewLoading;

    case "LoggingOut":
      return viewLoading;

    case "LoggedOut":
      return viewLoggedOut({ isLoading: false });

    case "LoggingIn":
      return viewLoggedOut({ isLoading: true });

    case "ProfileFound":
      return () => <>profileFound</>;

    case "ProfileNotFound":
      return pipe(
        ProfileCreate.view(model.child),
        react.map((msg) => ({ type: "ProfileCreateMsg", msg }))
      );
  }
};

const viewLoggedOut =
  ({ isLoading }: { isLoading: boolean }): react.Html<Msg> =>
  (dispatch) =>
    (
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
          loading={isLoading}
          onClick={() => {
            dispatch({ type: "LogIn" });
          }}
        >
          Continue With Google
        </LoadingButton>
      </Box>
    );

const viewLoading: react.Html<Msg> = () => {
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
      <CircularProgress size="4rem" />
    </Box>
  );
};

/* 


Subscriptions


*/

const profileToMsg = (profile: Profile.Profile | null): Msg => {
  if (profile) {
    return { type: "ProfileFound", profile };
  }

  return { type: "ProfileNotFound" };
};

const profileSub = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "Loading":
      return sub.none;

    case "LoggedOut":
      return sub.none;

    case "LoggingIn":
      return sub.none;

    case "LoggingOut":
      return sub.none;

    case "ProfileFound":
      return pipe(
        Profile.subscription({ userId: model.profile.userId }),
        sub.map(profileToMsg)
      );

    case "ProfileLoading":
      return pipe(
        Profile.subscription({ userId: model.userId }),
        sub.map(profileToMsg)
      );

    case "ProfileNotFound":
      return pipe(
        Profile.subscription({ userId: model.userId }),
        sub.map(profileToMsg)
      );
  }
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

const authSubject = new Rx.Subject<Msg>();

setTimeout(() => {
  authSubject.next(sessionToMsg(Supabase.client.auth.session()));
}, 1000);

Supabase.client.auth.onAuthStateChange((_, session) => {
  authSubject.next(sessionToMsg(session));
});

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  return sub.batch([authSubject, profileSub(model)]);
};
