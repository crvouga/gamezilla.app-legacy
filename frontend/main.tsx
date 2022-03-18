import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import App from "./app";
import { appStore } from "./app-store";
import ThemeProvider from "./features/theme/ThemeProvider";

render(
  <React.StrictMode>
    <Provider store={appStore}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
