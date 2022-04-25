import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { configureStore } from "@reduxjs/toolkit";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import createSagaMiddleware from "redux-saga";
import * as App from "./App";

/* 




*/

const rootReducer = (
  maybeState: App.IState | undefined,
  action: App.IAction
): App.IState => {
  const state = maybeState ?? App.initialState;

  const maybeResult = App.reducer(state, action);

  const [nextState, ...nextActions] = maybeResult ?? [state];

  for (const nextAction of nextActions) {
    store.dispatch(nextAction);
  }

  return nextState ?? state;
};

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(App.saga);

/* 




*/

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

/* 




*/

store.subscribe(() => {
  ReactDOM.render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App.view state={store.getState()} />
      </ThemeProvider>
    </StrictMode>,
    document.getElementById("root")
  );
});
