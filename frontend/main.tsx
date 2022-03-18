import React from "react";
import * as ReactDOM from "react-dom";
import * as App from "./app";
import { appStore } from "./store";
import ThemeProvider from "./features/theme/ThemeProvider";

const render = ({
  state,
  dispatch,
}: {
  state: App.IState;
  dispatch: (action: App.IAction) => void;
}) => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        <App.view state={state} dispatch={dispatch} />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

appStore.subscribe(() => {
  render({
    state: appStore.getState(),
    dispatch: appStore.dispatch,
  });
});
