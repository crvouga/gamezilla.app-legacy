import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { green } from "@mui/material/colors";
import { configureStore } from "@reduxjs/toolkit";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { channel, runSaga, RunSagaOptions, stdChannel } from "redux-saga";
import { fork, takeEvery } from "redux-saga/effects";
import * as App from "./__App";

/* 




*/

const rootReducer = (
  maybeState: App.IState | undefined,
  action: App.IAction
): App.IState => {
  const previousState = maybeState ?? App.initialState;

  const nextState = App.reducer(previousState, action) ?? previousState;

  return nextState;
};

const store = configureStore({
  reducer: rootReducer,
});

const sagaChan = stdChannel<App.IAction>();

const myIO: RunSagaOptions<App.IAction, App.IState> = {
  channel: sagaChan,

  dispatch(output) {
    store.dispatch(output);
  },

  getState() {
    return store.getState();
  },
};

runSaga(myIO, App.saga);

/* 




*/

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: green,
  },
  typography: {
    fontFamily: ["Nunito"].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "120px",
        },
      },
    },
  },
});

/* 




*/

const render = () => {
  ReactDOM.render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App.view dispatch={store.dispatch} state={store.getState()} />
      </ThemeProvider>
    </StrictMode>,
    document.getElementById("root")
  );
};

render();

store.subscribe(render);
