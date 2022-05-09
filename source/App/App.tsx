import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import * as Auth from "../Auth";
import { cmd, react, sub } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as View from "../View";
import * as LoggedInApp from "./LoggedInApp";
import * as LoggedOutApp from "./LoggedOutApp";

//
//
//
//
// Model
//
//
//
//

export type Model = Loading | LoggedOut | LoggedIn;

type Location = { pathname: string };

type Loading = {
  type: "Loading";
  location: Location;
};

type LoggedIn = {
  type: "LoggedIn";
  location: Location;
  session: Auth.Session;
  child: LoggedInApp.Model;
};

type LoggedOut = {
  type: "LoggedOut";
  location: Location;
  child: LoggedOutApp.Model;
};

//
// Init
//

export const init = (location: Navigation.Location): [Model, cmd.Cmd<Msg>] => {
  return initLoading(location);
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { type: "LocationChanged"; location: Location }
  | { type: "LoggedIn"; session: Auth.Session }
  | { type: "LoggedOut" }
  | { type: "LoggedInAppMsg"; msg: LoggedInApp.Msg }
  | { type: "LoggedOutAppMsg"; msg: LoggedOutApp.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Loading":
      return updateLoading(msg, model);

    case "LoggedIn":
      return updateLoggedIn(msg, model);

    case "LoggedOut":
      return updateLoggedOut(msg, model);
  }
};

const updateLoading = (msg: Msg, model: Loading): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(model.location, msg.session);

    case "LoggedOut":
      return initLoggedOut(model.location);

    case "LocationChanged":
    case "LoggedInAppMsg":
    case "LoggedOutAppMsg":
      return [model, cmd.none];
  }
};

const updateLoggedIn = (msg: Msg, model: LoggedIn): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedOut":
      return initLoggedOut(model.location);

    case "LoggedInAppMsg":
      return toLoggedIn(
        model.location,
        model.session,
        LoggedInApp.update(model, msg.msg, model.child)
      );

    case "LocationChanged":
      return toLoggedIn(
        model.location,
        model.session,
        LoggedInApp.update(model, msg, model.child)
      );

    case "LoggedIn":
    case "LoggedOutAppMsg":
      return [model, cmd.none];
  }
};

const updateLoggedOut = (msg: Msg, model: LoggedOut): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(model.location, msg.session);

    case "LoggedOutAppMsg":
      return toLoggedOut(
        model.location,
        LoggedOutApp.update(msg.msg, model.child)
      );

    case "LocationChanged":
    case "LoggedOut":
    case "LoggedInAppMsg":
      return [model, cmd.none];
  }
};

//
//
//
//
// View
//
//
//
//

export const view =
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
  switch (model.type) {
    case "Loading":
      return () => <View.LoadingPage />;

    case "LoggedIn":
      return pipe(
        LoggedInApp.view(model.child),
        react.map((msg) => ({ type: "LoggedInAppMsg", msg }))
      );

    case "LoggedOut":
      return pipe(
        LoggedOutApp.view(model.child),
        react.map((msg) => ({ type: "LoggedOutAppMsg", msg }))
      );
  }
};

//
// theme
//

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

//
//
//
//
// Subscriptions
//
//
//
//

const sessionToMsg = option.fold<Auth.Session, Msg>(
  () => ({ type: "LoggedOut" }),
  (session) => ({ type: "LoggedIn", session })
);

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "Loading":
      return sub.map(sessionToMsg)(Auth.subscription);

    case "LoggedOut":
      return sub.map(sessionToMsg)(Auth.subscription);

    case "LoggedIn":
      return sub.batch([
        sub.map(sessionToMsg)(Auth.subscription),
        pipe(
          LoggedInApp.subscriptions(model.session, model.child),
          sub.map((msg: LoggedInApp.Msg) => ({ type: "LoggedInAppMsg", msg }))
        ),
      ]);
  }
};

//
//
// helper
//
//

const initLoading = (location: Location): [Loading, cmd.Cmd<Msg>] => {
  return [
    { type: "Loading", location },
    Auth.fetch<Msg>({
      onFailure: () => ({ type: "LoggedOut" }),
      onSuccess: (session) => ({ type: "LoggedIn", session }),
    }),
  ];
};

const initLoggedOut = (location: Location) => {
  return toLoggedOut(location, LoggedOutApp.init());
};

const initLoggedIn = (
  location: Location,
  session: Auth.Session
): [LoggedIn, cmd.Cmd<Msg>] => {
  return toLoggedIn(location, session, LoggedInApp.init({ session, location }));
};

const toLoggedIn = (
  location: Location,
  session: Auth.Session,
  [subModel, subCmd]: [LoggedInApp.Model, cmd.Cmd<LoggedInApp.Msg>]
): [LoggedIn, cmd.Cmd<Msg>] => {
  return [
    { type: "LoggedIn", session, child: subModel, location },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "LoggedInAppMsg", msg }))
    ),
  ];
};

const toLoggedOut = (
  location: Location,
  [subModel, subCmd]: [LoggedOutApp.Model, cmd.Cmd<LoggedOutApp.Msg>]
): [LoggedOut, cmd.Cmd<Msg>] => {
  return [
    { type: "LoggedOut", child: subModel, location },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "LoggedOutAppMsg", msg }))
    ),
  ];
};
