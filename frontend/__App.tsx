import { Box, CircularProgress, Typography } from "@mui/material";
import { Session } from "@supabase/supabase-js";
import { eventChannel } from "redux-saga";
import { fork, put, takeEvery } from "redux-saga/effects";
import * as ProfileCreate from "./Screen/ProfileCreate";
import * as SignIn from "./Screen/SignIn";
import { definitions, supabaseClient } from "./supabase";

/*



State



*/

type IProfile = {
  userId: string;
  avatarUrl: string;
  name: string;
  username: string;
};

export type IState =
  | {
      type: "AuthLoading";
    }
  | {
      type: "AuthNotFound";
      child: SignIn.IState;
    }
  | {
      type: "ProfileLoading";
      defaultName: string;
      userId: string;
    }
  | {
      type: "ProfileNotFound";
      defaultName: string;
      userId: string;
      child: ProfileCreate.IState;
    }
  | {
      type: "ProfileFound";
      userId: string;
      defaultName: string;
      profile: IProfile;
    };

export const initialState: IState = {
  type: "AuthLoading",
};

/*



Actions



 */

export type IAction =
  | {
      type: "account/AuthNotFound";
    }
  | {
      type: "account/AuthFound";
      payload: {
        userId: string;
        defaultName: string;
      };
    }
  | {
      type: "account/ProfileFound";
      payload: {
        profile: IProfile;
      };
    }
  | {
      type: "account/ProfileNotFound";
    }
  | {
      type: "GotProfileCreate";
      payload: ProfileCreate.IAction;
    }
  | {
      type: "GotSignIn";
      payload: SignIn.IAction;
    }
  | {
      type: "UrlChanged";
      payload: string;
    };

/*


Reducer


*/

export const reducer = (state: IState, action: IAction): IState => {
  switch (state.type) {
    case "AuthLoading":
      switch (action.type) {
        case "account/AuthNotFound":
          return { type: "AuthNotFound", child: SignIn.initialState };

        case "account/AuthFound":
          return {
            type: "ProfileLoading",
            userId: action.payload.userId,
            defaultName: action.payload.defaultName,
          };

        default:
          return state;
      }

    case "AuthNotFound":
      switch (action.type) {
        case "GotSignIn":
          return {
            ...state,
            child: SignIn.reducer(state.child, action.payload),
          };

        default:
          return state;
      }

    case "ProfileFound":
      switch (action.type) {
        case "account/ProfileFound":
          return { ...state, profile: action.payload.profile };

        case "account/ProfileNotFound":
          return {
            ...state,
            type: "ProfileNotFound",
            child: ProfileCreate.toInitialState(state),
          };

        default:
          return state;
      }

    case "ProfileLoading":
      switch (action.type) {
        case "account/ProfileFound":
          return {
            ...state,
            type: "ProfileFound",
            profile: action.payload.profile,
          };

        case "account/ProfileNotFound":
          return {
            ...state,
            type: "ProfileNotFound",
            child: ProfileCreate.toInitialState(state),
          };

        default:
          return state;
      }

    case "ProfileNotFound":
      switch (action.type) {
        case "account/ProfileFound":
          return {
            ...state,
            type: "ProfileFound",
            profile: action.payload.profile,
          };

        case "GotProfileCreate":
          return {
            ...state,
            child: ProfileCreate.reducer(state.child, action.payload),
          };

        default:
          return state;
      }
  }
};

/*
 


Middleware



*/

export const sessionToAction = (session: Session | null): IAction => {
  const userId = session?.user?.id;
  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      type: "account/AuthFound",
      payload: {
        userId,
        defaultName,
      },
    };
  }

  return {
    type: "account/AuthNotFound",
  };
};

type Middleware<TState, TAction> = (store: {
  getState: () => TState;
  dispatch: (action: TAction) => void;
}) => (next: (action: TAction) => void) => (action: TAction) => void;

type IMiddleware = Middleware<IState, IAction>;

const authMiddleware: IMiddleware = ({ getState, dispatch }) => {
  const timeoutHandler = setTimeout(() => {
    dispatch(sessionToAction(supabaseClient.auth.session()));
  }, 1000);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    clearTimeout(timeoutHandler);
    dispatch(sessionToAction(session));
  });

  return (next) => async (action) => {
    next(action);

    const state = getState();

    if (state.type === "AuthNotFound" && action.type === "GotSignIn") {
    }
  };
};

const rowToProfile = (row: definitions["profile"]): IProfile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
  };
};

const getProfile = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const { data } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return rowToProfile(data);
  }

  return null;
};

const profileToAction = (profile: IProfile | null): IAction => {
  if (profile) {
    return {
      type: "account/ProfileFound",
      payload: {
        profile,
      },
    };
  }

  return {
    type: "account/ProfileNotFound",
  };
};

const profileMiddleware: IMiddleware =
  ({ dispatch }) =>
  (next) =>
  async (action) => {
    next(action);

    if (action.type === "account/AuthFound") {
      const { userId } = action.payload;

      const result = await getProfile({ userId });

      dispatch(profileToAction(result));

      supabaseClient
        .from<definitions["profile"]>(`profile:id=eq.${userId}`)
        .on("INSERT", (payload) => {
          dispatch(profileToAction(rowToProfile(payload.new)));
        })
        .on("UPDATE", (payload) => {
          dispatch(profileToAction(rowToProfile(payload.new)));
        })
        .on("DELETE", () => {
          dispatch(profileToAction(null));
        })
        .subscribe();
    }
  };

const authChan = eventChannel<IAction>((emit) => {
  setTimeout(() => {
    emit(sessionToAction(supabaseClient.auth.session()));
  }, 200);

  const subscription = supabaseClient.auth.onAuthStateChange(
    (_event, session) => {
      emit(sessionToAction(session));
    }
  );

  return () => {
    subscription.data?.unsubscribe();
  };
});

export function* saga() {
  yield takeEvery(authChan, function* (action) {
    yield put(action);
  });

  yield fork(SignIn.saga);

  yield fork(ProfileCreate.saga);
}

/*



View



*/

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  switch (state.type) {
    case "AuthLoading":
      return viewLoadingScreen({ subtitle: "Signing in..." });

    case "AuthNotFound":
      return SignIn.view({
        state: state.child,
        dispatch: (action) => {
          dispatch({ type: "GotSignIn", payload: action });
        },
      });

    case "ProfileLoading":
      return viewLoadingScreen({ subtitle: "Loading profile..." });

    case "ProfileNotFound":
      return ProfileCreate.view({
        state: state.child,
        dispatch: (action) => {
          dispatch({ type: "GotProfileCreate", payload: action });
        },
      });

    case "ProfileFound":
      return <>Loaded</>;
  }
};

const viewLoadingScreen = ({ subtitle }: { subtitle: string }) => {
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
      <Typography variant="subtitle2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
};
