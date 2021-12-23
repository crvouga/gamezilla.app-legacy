import { CssBaseline, ThemeProvider } from "@mui/material";
import { configureStore } from "@reduxjs/toolkit";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import createSagaMiddleware from "redux-saga";
import { theme } from "src/theme";
import { App, appReducer, appSaga } from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: appReducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(appSaga);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
);

reportWebVitals();
