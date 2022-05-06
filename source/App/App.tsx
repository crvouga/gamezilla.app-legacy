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
  return initLoggedOut();
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
]): [Model, cmd.Cmd<Msg>] => {
  return [
    { type: "LoggedOut", child: subModel },
    pipe(
      subCmd,
      cmd.map((msg) => ({ type: "LoggedOutAppMsg", msg }))
    ),
  ];
};

const initLoggedIn = (session: Auth.Session): [LoggedIn, cmd.Cmd<Msg>] => {
  const [childModel, childCmd] = LoggedInApp.init();

  return [
    { type: "LoggedIn", session, child: childModel },
    pipe(
      childCmd,
      cmd.map((msg) => ({ type: "LoggedInAppMsg", msg }))
    ),
  ];
};

/* 


Update


*/

export type Msg =
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

export const updateLoading = (
  msg: Msg,
  model: Loading
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(msg.session);

    case "LoggedOut":
      return initLoggedOut();

    default:
      return [model, cmd.none];
  }
};

export const updateLoggedIn = (
  msg: Msg,
  model: LoggedIn
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedOut":
      return initLoggedOut();

    case "LoggedInAppMsg":
      return updateLoggedInChild(msg.msg, model);

    default:
      return [model, cmd.none];
  }
};

const updateLoggedInChild = (
  msg: LoggedInApp.Msg,
  model: LoggedIn
): [LoggedIn, cmd.Cmd<Msg>] => {
  return [model, cmd.none];
};

export const updateLoggedOut = (
  msg: Msg,
  model: LoggedOut
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoggedIn":
      return initLoggedIn(msg.session);

    case "LoggedOutAppMsg":
      return mapLoggedOut(LoggedOutApp.update(msg.msg, model.child));

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
      return () => <View.LoadingPage />;

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

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  return sub.batch([sub.map(sessionToMsg)(Auth.subscription)]);
};
