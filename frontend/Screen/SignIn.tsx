import { Google } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { call, takeEvery } from "redux-saga/effects";
import { supabaseClient } from "../supabase";

/*



State



*/

export type IState =
  | {
      type: "Idle";
    }
  | {
      type: "SigningIn";
    };

export const initialState: IState = {
  type: "Idle",
};

/*



Actions



 */

export type IAction = {
  type: "SignIn";
};

/*


Reducer


*/

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "SignIn":
      return { type: "SigningIn" };

    default:
      return state;
  }
};

/*
 


Saga



*/

const signIn = async () => {
  await supabaseClient.auth.signIn({ provider: "google" });
};

export function* saga() {
  yield takeEvery("SignIn", function* (action) {
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
        loading={state.type === "SigningIn"}
        onClick={() => {
          dispatch({ type: "SignIn" });
        }}
      >
        Continue With Google
      </LoadingButton>
    </Box>
  );
};
