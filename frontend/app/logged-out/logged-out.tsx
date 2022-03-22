import { ConstructionOutlined, Google } from "@mui/icons-material";
import { Box, Button, Dialog, Typography } from "@mui/material";

import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { call, takeLeading } from "redux-saga/effects";
import { LoadingDialog } from "../../ui-components";
import {
  Action,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../utils";

/**
 *
 *
 * State
 *
 *
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

/**
 *
 *
 * Reducer
 *
 *
 */

export type ILoginMethod = {
  type: "google";
};

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

/**
 *
 *
 * Saga
 *
 *
 */

export type ILogin = (method: ILoginMethod) => void;

export type IDataAccess = {
  login: ILogin;
};

export function* saga({ login }: IDataAccess) {
  yield takeLeading(actions.login, function* (action) {
    yield call(login, action.payload);
  });
}

/**
 *
 *
 * View
 *
 *
 */

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LoadingDialog
                visible={state.type === "loading"}
                title="Logging in..."
              />

              <Dialog open={state.type === "idle"}>
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h3"
                    sx={{ marginBottom: 2, paddingX: 4 }}
                  >
                    Gamezilla
                  </Typography>
                  <Button
                    fullWidth
                    startIcon={<Google />}
                    variant="contained"
                    onClick={() => {
                      dispatch(actions.login({ type: "google" }));
                    }}
                  >
                    Continue with Google
                  </Button>
                </Box>
              </Dialog>
            </>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
