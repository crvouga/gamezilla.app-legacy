import { Google } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import React from "react";
import { call, takeLeading } from "redux-saga/effects";
import {
  Action,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../utils";

/* 


*/

export type IState =
  | {
      type: "idle";
    }
  | {
      type: "loading";
    };

export const initialState: IState = {
  type: "idle",
};

export type ILoginMethod = {
  type: "google";
};

/* 


*/

const actions = {
  login: Action<"logged-out", "login", ILoginMethod>("logged-out", "login"),
};

export type IAction = InferActionUnion<typeof actions>;

export type IActionMap = InferActionMap<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-out::login":
      return {
        type: "loading",
      };
  }
};

/* 


*/

export type ILogin = (method: ILoginMethod) => void;

export type IDataAccess = {
  login: ILogin;
};

export function* saga({ login }: IDataAccess) {
  function* loginFlow(action: IActionMap["login"]) {
    yield call(login, action.payload);
  }

  yield takeLeading(actions.login, loginFlow);
}

/* 


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
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="h4" color="primary.main" sx={{ marginBottom: 2 }}>
        Gamezilla
      </Typography>

      <LoadingButton
        variant="contained"
        size="large"
        fullWidth
        startIcon={<Google />}
        loading={state.type === "loading"}
        onClick={() => {
          dispatch(actions.login({ type: "google" }));
        }}
      >
        Continue With Google
      </LoadingButton>
    </Box>
  );
};
