import React from "react";
import { render } from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import { appStore } from "./app-store";
import ThemeProvider from "./features/theme/ThemeProvider";

render(
  <React.StrictMode>
    <Provider store={appStore}>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
