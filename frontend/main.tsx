import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import * as App from "./app";
import { appStore, useAppDispatch, useAppSelector } from "./app-store";
import ThemeProvider from "./features/theme/ThemeProvider";
import fastDeepEqual from "fast-deep-equal";

const Root = () => {
  const state = useAppSelector((state) => state, fastDeepEqual);
  const dispatch = useAppDispatch();

  return <App.view state={state} dispatch={dispatch} />;
};

render(
  <React.StrictMode>
    <Provider store={appStore}>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
