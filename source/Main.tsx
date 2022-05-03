import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";
import React from "react";
import { createRoot } from "react-dom/client";
import * as App from "./App";
import { react } from "./Framework";
import * as DebugNavigation from "./Framework/Debug/Navigation";
import * as Navigation from "./Framework/Navigation";

// Theme

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: green,
    },
    typography: {
      fontFamily: ["Nunito"].join(","),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "120px",
          },
        },
      },
    },
  })
);

// Program

const program =
  process.env.NODE_ENV === "production"
    ? Navigation.programWithFlags
    : DebugNavigation.programWithDebuggerWithFlags;

const main = program(
  App.locationToMsg,
  App.init,
  App.update,
  App.view,
  App.subscriptions
);

// Rendering

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root element");
}

const root = createRoot(rootElement);

const renderer = (dom: react.Dom) => {
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {dom}
    </ThemeProvider>
  );
};

react.run(main(), renderer);
