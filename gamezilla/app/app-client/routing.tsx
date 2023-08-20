import { Browser, Eff, p } from "gamezilla/@SHARED/core";
import { ClientAppMsg, Route } from "gamezilla/app/@SHARED/client";

//
//
//
// Model
//
//
//

export type Model = Route;

const fallback: Route = { t: "space", c: { t: "space-list" } };

export const init = (
  location: Browser.Location
): { model: Model; eff: Eff } => {
  const route = p(
    location.pathname,
    Route.decode,
    (route): Route => (route ? route : fallback)
  );

  return {
    model: route,
    eff: Browser.replace(Route.encode(route)),
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
  | { t: "route-changed"; route: Route }
  | { t: "clicked-link"; route: Route }
  | { t: "clicked-back" };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "clicked-back") {
    return { model, eff: Browser.back };
  }

  if (msg.t === "clicked-link") {
    return { model, eff: Browser.push(Route.encode(msg.route)) };
  }

  if (msg.t === "route-changed") {
    return {
      model: msg.route,
      msgs: [{ t: "route-changed", route: msg.route }],
    };
  }

  return { model };
};

export const updateFromEvent = (input: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (input.msg.t === "push-route") {
    return {
      ...input,
      eff: Browser.push(Route.encode(input.msg.route)),
    };
  }

  if (input.msg.t === "route-back") {
    return {
      ...input,
      eff: Browser.back,
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
    (route): Msg => ({ t: "route-changed", route })
  );
};

export const subscriptions = Browser.onLocation(onLocationChange);
