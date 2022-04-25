import { Google } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Session } from "@supabase/supabase-js";
import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { supabaseClient } from "./supabase";

/*



State


*/

export type IState =
  | {
      type: "Loading";
    }
  | {
      type: "SignedOut";
      child:
        | {
            type: "Idle";
          }
        | {
            type: "Loading";
          };
    }
  | {
      type: "LoadingProfile";
    }
  | {
      type: "Loaded";
    };

export const initialState: IState = {
  type: "Loading",
};

/*



Actions



 */

export type IAction =
  | {
      type: "auth/SignedOut";
    }
  | {
      type: "auth/SignIn";
    }
  | {
      type: "auth/SignedIn";
      payload: {
        userId: string;
        defaultName: string;
      };
    };

/*


Reducer


*/

export const reducer = (
  state: IState,
  action: IAction
): [IState, ...IAction[]] => {
  switch (state.type) {
    case "Loaded":
      return [state];

    case "Loading":
      switch (action.type) {
        case "auth/SignedIn":
          return [{ type: "LoadingProfile" }];

        case "auth/SignedOut":
          return [{ type: "SignedOut", child: { type: "Idle" } }];

        default:
          return [state];
      }

    case "LoadingProfile":
      return [state];

    case "SignedOut":
      switch (action.type) {
        case "auth/SignIn":
          return [{ ...state, child: { type: "Loading" } }];

        default:
          return [state];
      }
  }
};

/*
 

Saga


*/

export const sessionToAuthEvent = (session: Session | null): IAction => {
  const userId = session?.user?.id;
  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      type: "auth/SignedIn",
      payload: {
        userId,
        defaultName,
      },
    };
  }

  return {
    type: "auth/SignedOut",
  };
};

const authChan = eventChannel<IAction>((emit) => {
  const timeoutHandler = setTimeout(() => {
    emit(sessionToAuthEvent(supabaseClient.auth.session()));
  }, 1000);

  const response = supabaseClient.auth.onAuthStateChange((_event, session) => {
    clearTimeout(timeoutHandler);
    emit(sessionToAuthEvent(session));
  });

  return () => {
    response.data?.unsubscribe();
  };
});

const signIn = async () => {
  await supabaseClient.auth.signIn({ provider: "google" });
};

export function* saga() {
  yield takeEvery(authChan, function* (action) {
    yield put(action);
  });

  yield takeEvery("auth/SignIn", function* () {
    yield call(signIn);
  });
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
    case "Loading":
      return (
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );

    case "SignedOut":
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
            p: 2,
          }}
        >
          <Typography sx={{ marginBottom: 2 }} variant="h3" align="center">
            Gamezilla
          </Typography>

          <LoadingButton
            startIcon={<Google />}
            variant="contained"
            size="large"
            fullWidth
            loading={state.child.type === "Loading"}
            onClick={() => {
              dispatch({ type: "auth/SignIn" });
            }}
          >
            Continue With Google
          </LoadingButton>
        </Box>
      );

    case "LoadingProfile":
      return (
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );

    case "Loaded":
      return <>Loaded</>;
  }
};
