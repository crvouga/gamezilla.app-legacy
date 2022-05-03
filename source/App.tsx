import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  BoxProps,
  Button,
  CircularProgress,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { cmd } from "elm-ts";
import { Html } from "elm-ts/lib/React";
import * as Sub from "elm-ts/lib/Sub";
import * as React from "react";
import * as Rx from "rxjs";
import * as Supabase from "./Supabase";
import { definitions } from "./supabase-types";

/* 


model


*/

type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
};

export type Model =
  | { type: "Loading" }
  | { type: "LoggedOut" }
  | { type: "LoggingOut" }
  | { type: "LoggingIn" }
  | { type: "ProfileLoading"; defaultName: string; userId: string }
  | { type: "ProfileNotFound"; defaultName: string; userId: string }
  | { type: "ProfileFound"; profile: Profile };

export const init: [Model, cmd.Cmd<Msg>] = [{ type: "Loading" }, cmd.none];

/*


update


*/

export type Msg =
  | { type: "LoggedIn"; userId: string; defaultName: string }
  | { type: "LoggedOut" }
  | { type: "LogIn" }
  | { type: "LogOut" }
  | { type: "ProfileNotFound" }
  | { type: "ProfileFound"; profile: Profile };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return [{ ...msg, type: "ProfileLoading" }, cmd.none];

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
        return [{ ...model, type: "ProfileNotFound" }, cmd.none];
      }

      return [model, cmd.none];
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

/* 


view


*/

export const view = (model: Model): Html<Msg> => {
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
      return viewProfileCreate;
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

const viewLoggedOut =
  ({ isLoading }: { isLoading: boolean }): Html<Msg> =>
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

const viewLoading: Html<Msg> = () => {
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

const viewProfileCreate: Html<Msg> = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingX: 2,
      }}
    >
      <Toolbar>
        <Typography sx={{ flex: 1 }} align="center" variant="h6">
          Create Profile
        </Typography>
      </Toolbar>

      <Avatar
        sx={{
          marginX: "auto",
          width: "150px",
          height: "150px",
          marginBottom: 1,
        }}
      />

      <Button sx={{ marginBottom: 2 }}>Change Avatar</Button>

      <TextField sx={{ marginBottom: 2 }} label="Username" fullWidth />

      <TextField sx={{ marginBottom: 4 }} label="Name" fullWidth />

      <Button fullWidth size="large" variant="contained">
        Create Profile
      </Button>
    </Box>
  );
};

/* 


Subscriptions


*/

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

authSubject.next(sessionToMsg(Supabase.client.auth.session()));

Supabase.client.auth.onAuthStateChange((state, session) => {
  authSubject.next(sessionToMsg(session));
});

const rowToProfile = (row: definitions["profile"]): Profile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    // themeMode: row.theme_mode,
    // gameRoomId: row.game_room_id,
  };
};

const getProfile = async ({
  userId,
}: {
  userId: string;
}): Promise<Profile | null> => {
  const { data } = await Supabase.client
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return rowToProfile(data);
  }

  return null;
};

const profileToMsg = (profile: Profile | null): Msg => {
  if (profile) {
    return {
      type: "ProfileFound",
      profile,
    };
  }

  return {
    type: "ProfileNotFound",
  };
};

const profileSub = ({ userId }: { userId: string }) => {
  return new Rx.Observable<Msg>((subscriber) => {
    getProfile({ userId }).then((profile) => {
      subscriber.next(profileToMsg(profile));
    });

    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(profileToMsg(rowToProfile(payload.new)));
      })
      .on("UPDATE", (payload) => {
        subscriber.next(profileToMsg(rowToProfile(payload.new)));
      })
      .on("DELETE", () => {
        subscriber.next(profileToMsg(null));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });
};

const toProfileSub = (model: Model): Sub.Sub<Msg> => {
  switch (model.type) {
    case "Loading":
    case "LoggedOut":
    case "LoggingIn":
    case "LoggingOut":
      return Sub.none;

    case "ProfileFound":
      return profileSub({ userId: model.profile.userId });

    case "ProfileLoading":
      return profileSub({ userId: model.userId });

    case "ProfileNotFound":
      return profileSub({ userId: model.userId });
  }
};

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch([authSubject, toProfileSub(model)]);
};
