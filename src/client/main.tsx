import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "./App";
import { ThemeProvider } from "./components";

ReactDOM.render(
  <ThemeProvider>
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>
  </ThemeProvider>,
  document.getElementById("reactjs-app")
);
