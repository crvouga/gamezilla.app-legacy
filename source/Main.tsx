import * as React from "react";
import { createRoot } from "react-dom/client";
import { sub, cmd, react } from "./Framework";
import * as DebugNavigation from "./Framework/Debug/Navigation";
import * as Navigation from "./Framework/Navigation";
import * as App from "./App/App";
import { pipe } from "fp-ts/lib/function";
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";

/* 


Main


*/

export const main = (): Error[] => {
  const program =
    process.env.NODE_ENV === "production"
      ? Navigation.program
      : DebugNavigation.programWithDebugger;

  const mainProgram = program(locationToMsg, init, update, view, subscriptions);

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    return [new Error("Failed to get root element from html document")];
  }

  const root = createRoot(rootElement);

  react.run(mainProgram, (node) => root.render(node));

  return [];
};

/* 



Location



*/

const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "Noop",
  };
};

/* 



Model



*/

type Model = {
  url: string;
  app: App.Model;
};

const init = (location: Navigation.Location): [Model, cmd.Cmd<Msg>] => {
  const url = location.pathname.substring(1);

  return mapAppUpdate(url, App.init());
};

const mapAppUpdate = (
  url: string,
  [subModel, subCmd]: [App.Model, cmd.Cmd<App.Msg>]
): [Model, cmd.Cmd<Msg>] => {
  return [
    { url, app: subModel },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "AppMsg", msg }))
    ),
  ];
};

/* 



Update



*/

type Msg = { type: "AppMsg"; msg: App.Msg } | { type: "Noop" };

const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "AppMsg":
      return mapAppUpdate(model.url, App.update(model.url, msg.msg, model.app));

    case "Noop":
      return [model, cmd.none];
  }
};

/* 



Subsciptions



*/

const subscriptions = (model: Model): sub.Sub<Msg> => {
  return pipe(
    App.subscriptions(model.app),
    sub.map((msg) => ({ type: "AppMsg", msg }))
  );
};

/* 



View



*/

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

const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) => {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {viewMain(model)(dispatch)}
      </ThemeProvider>
    );
  };

const viewMain = (model: Model): react.Html<Msg> => {
  return pipe(
    App.view(model.app),
    react.map((msg) => ({ type: "AppMsg", msg }))
  );
};
