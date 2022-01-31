import { Container } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "./App";
import { ThemeProvider } from "./components/ThemeContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <ThemeProvider>
        <Container disableGutters maxWidth="sm">
          <App />
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById("reactjs-app")
);
