import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { programWithDebugger } from "elm-ts/lib/Debug/Html";
import * as Html from "elm-ts/lib/Html";
import * as React from "elm-ts/lib/React";
import { createRoot } from "react-dom/client";
import * as App from "./App";

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
  process.env.NODE_ENV === "production" ? React.program : programWithDebugger;

const main = program(App.init, App.update, App.view, App.subscriptions);

// Rendering

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root element");
}

const root = createRoot(rootElement);

const renderer = (dom: React.Dom) => {
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {dom}
    </ThemeProvider>
  );
};

Html.run(main, renderer);
