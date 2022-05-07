import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import * as Auth from "../Auth";
import { cmd, react, sub } from "../Framework";
import * as View from "../View";
import * as LoggedInApp from "./LoggedInApp";
import * as LoggedOutApp from "./LoggedOutApp";

/* 


Model


*/

export type Model = Loading | LoggedOut | LoggedIn;

type Loading = { type: "Loading" };

type LoggedIn = {
  type: "LoggedIn";
  session: Auth.Session;
  child: LoggedInApp.Model;
};

type LoggedOut = { type: "LoggedOut"; child: LoggedOutApp.Model };

export const init = (): [Model, cmd.Cmd<Msg>] => {
  return initLoading();
};

const initLoggedOut = () => {
  return mapLoggedOut(LoggedOutApp.init());
};

const initLoading = (): [Loading, cmd.Cmd<Msg>] => {
  return [
    { type: "Loading" },
    Auth.fetch<Msg>({
      onFailure: () => ({ type: "LoggedOut" }),
      onSuccess: (session) => ({ type: "LoggedIn", session }),
    }),
  ];
};

const mapLoggedOut = ([subModel, subCmd]: [
  LoggedOutApp.Model,
  cmd.Cmd<LoggedOutApp.Msg>
]): [LoggedOut, cmd.Cmd<Msg>] => {
  return [
    { type: "LoggedOut", child: subModel },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "LoggedOutAppMsg", msg }))
    ),
  ];
};

const initLoggedIn = (
  location: { pathname: string },
  session: Auth.Session
): [LoggedIn, cmd.Cmd<Msg>] => {
  return mapLoggedIn(session, LoggedInApp.init(location, session));
};

const mapLoggedIn = (
  session: Auth.Session,
  [subModel, subCmd]: [LoggedInApp.Model, cmd.Cmd<LoggedInApp.Msg>]
): [LoggedIn, cmd.Cmd<Msg>] => {
  return [
    { type: "LoggedIn", session, child: subModel },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "LoggedInAppMsg", msg }))
    ),
  ];
};

/* 


Update


*/

export type Msg =
  | { type: "LocationChanged"; location: { pathname: string } }
  | { type: "LoggedIn"; session: Auth.Session }
  | { type: "LoggedOut" }
  | { type: "LoggedInAppMsg"; msg: LoggedInApp.Msg }
  | { type: "LoggedOutAppMsg"; msg: LoggedOutApp.Msg };

export const update = (
  location: { pathname: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Loading":
      return updateLoading(location, msg, model);

    case "LoggedIn":
      return updateLoggedIn(msg, model);

    case "LoggedOut":
      return updateLoggedOut(location, msg, model);
  }
};

const updateLoading = (
  location: { pathname: string },
  msg: Msg,
  model: Loading
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(location, msg.session);

    case "LoggedOut":
      return initLoggedOut();

    case "LocationChanged":
    case "LoggedInAppMsg":
    case "LoggedOutAppMsg":
      return [model, cmd.none];
  }
};

const updateLoggedIn = (msg: Msg, model: LoggedIn): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedOut":
      return initLoggedOut();

    case "LoggedInAppMsg":
      return mapLoggedIn(
        model.session,
        LoggedInApp.update(msg.msg, model.child)
      );

    case "LocationChanged":
      return mapLoggedIn(model.session, LoggedInApp.update(msg, model.child));

    case "LoggedIn":
    case "LoggedOutAppMsg":
      return [model, cmd.none];
  }
};

const updateLoggedOut = (
  location: { pathname: string },
  msg: Msg,
  model: LoggedOut
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(location, msg.session);

    case "LoggedOutAppMsg":
      return mapLoggedOut(LoggedOutApp.update(msg.msg, model.child));

    case "LocationChanged":
    case "LoggedOut":
    case "LoggedInAppMsg":
      return [model, cmd.none];
  }
};

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
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

/* 



Subscriptions



*/

const sessionToMsg = option.fold<Auth.Session, Msg>(
  () => ({ type: "LoggedOut" }),
  (session) => ({ type: "LoggedIn", session })
);

const toMsg = (msg: LoggedInApp.Msg): Msg => ({ type: "LoggedInAppMsg", msg });

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "Loading":
      return sub.map(sessionToMsg)(Auth.subscription);

    case "LoggedOut":
      return sub.map(sessionToMsg)(Auth.subscription);

    case "LoggedIn":
      return sub.batch([
        sub.map(sessionToMsg)(Auth.subscription),
        sub.map(toMsg)(LoggedInApp.subscriptions(model.session, model.child)),
      ]);
  }
};
