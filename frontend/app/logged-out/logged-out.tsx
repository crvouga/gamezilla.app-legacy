import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Headline } from "react-native-paper";
import { call, takeLeading } from "redux-saga/effects";
import { spacing } from "../../ui-components/theme";
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

const styles = StyleSheet.create({
  root: {
    padding: spacing(2),
    width: "100%",
    height: "100%",
    justifyContent: "center",
    flex: 1,
  },

  button: {
    margin: spacing(2),
  },

  headline: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: spacing(2),
    fontWeight: "bold",
  },
});

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  const onLogin = () => {
    dispatch(actions.login({ type: "google" }));
  };

  return (
    <View style={styles.root}>
      <Headline style={styles.headline}>Gamezilla</Headline>

      <Button
        style={styles.button}
        mode="contained"
        icon="google"
        onPress={onLogin}
        loading={state.type === "loading"}
        disabled={state.type === "loading"}
      >
        Continue with Google
      </Button>
    </View>
  );
};
