import { ClientAppMsg, Route } from "src/app/@/client";
import { Browser, Cmd, p } from "src/core";

//
//
//
// Model
//
//
//

export type Model = {
  route: Route;
};

const fallback: Route = { t: "game-space", c: { t: "game-space-list" } };

export const init = (
  location: Browser.Location
): { model: Model; cmd: Cmd } => {
  const route = p(
    location.pathname,
    Route.decode,
    (route): Route => (route ? route : fallback)
  );

  return {
    model: { route },
    cmd: Browser.replace(Route.encode(route)),
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { t: "route-changed"; c: Route }
  | { t: "clicked-link"; c: Route }
  | { t: "clicked-back" };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "clicked-back") {
    return { model, cmd: Browser.back };
  }

  if (msg.t === "clicked-link") {
    return { model, cmd: Browser.push(Route.encode(msg.c)) };
  }

  if (msg.t === "route-changed") {
    return {
      model: { route: msg.c },
      msgs: [{ t: "route-changed", route: msg.c }],
    };
  }

  return { model };
};

export const updateFromApp = (input: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (input.msg.t === "push-route") {
    return {
      ...input,
      cmd: Browser.push(Route.encode(input.msg.route)),
    };
  }

  if (input.msg.t === "route-back") {
    return {
      ...input,
      cmd: Browser.back,
    };
  }

  return input;
};

//
//
//
// Subscriptions
//
//
//

const onLocationChange = (location: Browser.Location): Msg => {
  return p(
    location.pathname,
    Route.decode,
    (route): Route => (route ? route : fallback),
    (route): Msg => ({ t: "route-changed", c: route })
  );
};

export const subscriptions = Browser.onLocation(onLocationChange);
