import { CircularProgress, Box } from "@mui/material";
import { Session } from "@supabase/supabase-js";
import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { supabaseClient } from "./supabase";

/*



State


*/

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "signed-in";
    }
  | {
      type: "signed-out";
    };

export const initialState: IState = {
  type: "loading",
};

/*



Actions



 */

export type IAction =
  | {
      type: "auth/signed-out";
    }
  | {
      type: "auth/signed-in";
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
  switch (action.type) {
    case "auth/signed-in":
      return [{ type: "signed-in" }];

    case "auth/signed-out":
      return [{ type: "signed-out" }];
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
      type: "auth/signed-in",
      payload: {
        userId,
        defaultName,
      },
    };
  }

  return {
    type: "auth/signed-out",
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

export function* saga() {
  yield takeEvery(authChan, function* (action) {
    yield put(action);
  });
}

/*


View


*/

export const view = ({ state }: { state: IState }) => {
  switch (state.type) {
    case "loading":
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

    case "signed-in":
      return <>hello</>;

    case "signed-out":
      return <>signed out</>;
  }
};
