import { Box, Container } from "@mui/material";
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
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <Container disableGutters maxWidth="sm">
            <App />
          </Container>
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById("reactjs-app")
);
