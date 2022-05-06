import * as LoggedInApp from "./LoggedInApp";
import * as LoggedOutApp from "./LoggedOutApp";
import * as Auth from "../Auth";
import { cmd } from "../Framework";
import { pipe } from "fp-ts/lib/function";

/* 


Model


*/

export type Model = Loading | LoggedOut | LoggedIn;

type Loading = { type: "Loading" };

const initLoading = (): [Loading, cmd.Cmd<Msg>] => {
  return [{ type: "Loading" }, cmd.none];
};

type LoggedOut = { type: "LoggedOut"; child: LoggedOutApp.Model };

const initLoggedOut = (): [LoggedOut, cmd.Cmd<Msg>] => {
  return [{ type: "LoggedOut", child: LoggedOutApp.init() }, cmd.none];
};

type LoggedIn = {
  type: "LoggedIn";
  session: Auth.Session;
  child: LoggedInApp.Model;
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
  | { type: "LoggedInAppMsg"; msg: LoggedInApp.Msg };

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

    default:
      return [model, cmd.none];
  }
};
