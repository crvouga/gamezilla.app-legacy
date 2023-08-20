import { Browser, Eff } from "gamezilla/@SHARED/core";
import { ClientAppMsg, Route } from "gamezilla/app/@SHARED/client";

//
//
//
// Model
//
//
//

export type Model = Route;

const FALLBACK: Route = { t: "space", c: { t: "space-list" } };

export const init = (
  location: Browser.Location
): {
  model: Model;
  eff?: Eff;
} => {
  const decoded = Route.decode(location.pathname);

  if (decoded) {
    return { model: decoded };
  }

  return { model: FALLBACK, eff: Browser.replace(Route.encode(FALLBACK)) };
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
  switch (msg.t) {
    case "clicked-back": {
      return { model, eff: Browser.back };
    }

    case "clicked-link": {
      return { model, eff: Browser.push(Route.encode(msg.route)) };
    }

    case "route-changed": {
      return {
        model: msg.route,
        msgs: [{ t: "route-changed", route: msg.route }],
      };
    }
  }
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
    case "route-push": {
      return { model, eff: Browser.push(Route.encode(msg.route)) };
    }

    case "route-back": {
      return { model, eff: Browser.back };
    }

    default: {
      return { model };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

const onLocationChange = (location: Browser.Location): Msg => {
  const decoded = Route.decode(location.pathname);

  if (decoded) {
    return { t: "route-changed", route: decoded };
  }

  return { t: "route-changed", route: FALLBACK };
};

export const subscriptions = Browser.onLocation(onLocationChange);
