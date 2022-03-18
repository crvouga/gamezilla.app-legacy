import React from "react";
import * as ReactDOM from "react-dom";
import * as App from "./app/app";
import ThemeProvider from "./features/theme/ThemeProvider";
import { store } from "./store";

store.subscribe(() => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        <App.view state={store.getState()} dispatch={store.dispatch} />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
