import { StyleSheet, View } from "react-native";
import { Provider } from "react-native-paper";
import { LoadingDialog } from "../ui-components/Loading";
import { theme } from "../ui-components/theme";
import { IAction, IState } from "./app";
import * as LoggedIn from "./logged-in/logged-in";
import * as LoggedOut from "./logged-out/logged-out";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.background,
  },
});

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <View style={styles.root}>
      <Provider theme={theme}>
        <LoadingDialog
          visible={state.type === "loading"}
          title="Checking if logged in..."
        />

        {state.type === "logged-in" && (
          <LoggedIn.view state={state.child} dispatch={dispatch} />
        )}

        {state.type === "logged-out" && (
          <LoggedOut.view state={state.child} dispatch={dispatch} />
        )}
      </Provider>
    </View>
  );
};
