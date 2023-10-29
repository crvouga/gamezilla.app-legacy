import { Browser, Eff, UnitInterval } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  ClientEvt,
  Route,
  RouteCmd,
  playSound,
} from "gamezilla/app/@SHARED/client";

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
  evt?: ClientEvt[];
  cmd?: ClientCmd[];
} => {
  switch (msg.t) {
    case "clicked-back": {
      return { model, eff: Browser.back };
    }

    case "clicked-link": {
      return {
        model,
        eff: Browser.push(Route.encode(msg.route)),
        // cmd: [playSound(APP_SOUND.tap, UnitInterval.init(0.5))],
      };
    }

    case "route-changed": {
      return {
        model: msg.route,
        evt: [{ t: "route-changed", route: msg.route }],
      };
    }
  }
};

export const updateFromCmd = ({
  cmd: msg,
  model,
}: {
  cmd: RouteCmd;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
    case "routing/push": {
      return {
        model: msg.route,
        eff: Browser.push(Route.encode(msg.route)),
      };
    }

    case "routing/back": {
      return {
        model,
        eff: Browser.back,
      };
    }

    case "routing/replace": {
      return {
        model: msg.route,
        eff: Browser.replace(Route.encode(msg.route)),
      };
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
