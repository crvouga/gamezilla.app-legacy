import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";
import { ThemeProvider } from "./app-theme";

ReactDOM.render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById("reactjs-app")
);
