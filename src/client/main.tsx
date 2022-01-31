import { Container } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "./App";
import { ThemeProvider } from "./components/ThemeContext";

ReactDOM.render(
  <ThemeProvider>
    <QueryClientProvider client={new QueryClient()}>
      <Container disableGutters maxWidth="sm">
        <App />
      </Container>
    </QueryClientProvider>
  </ThemeProvider>,
  document.getElementById("reactjs-app")
);
