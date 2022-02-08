import { ThemeProvider, CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import theme from "./theme";

ReactDOM.render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById("reactjs-app")
);
