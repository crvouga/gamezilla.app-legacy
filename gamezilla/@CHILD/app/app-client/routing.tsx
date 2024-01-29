import {
  AppRoute,
  ClientEvent,
  RouteCmd,
  SoundCmd,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Browser, Eff } from "gamezilla/@SHARED/core";

//
//
//
// Model
//
//
//

export type Model = {
  previousRoute: AppRoute;
  currentRoute: AppRoute;
};

const FALLBACK: AppRoute = { t: "spaces", c: { t: "space-list" } };

export const init = ({
  location,
}: {
  location: Browser.Location;
  stored: Model | null;
}): {
  model: Model;
  eff?: Eff;
} => {
  const decoded = AppRoute.decode(location.pathname);

  if (decoded) {
    return { model: { currentRoute: decoded, previousRoute: decoded } };
  }

  return {
    model: { currentRoute: FALLBACK, previousRoute: FALLBACK },
    eff: Browser.replace(AppRoute.encode(FALLBACK)),
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
  | { t: "route-changed"; route: AppRoute }
  | { t: "clicked-link"; route: AppRoute }
  | { t: "clicked-back" };

export const update = ({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: RouteCmd | null;
  msg?: Msg | null;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  msgEvt?: ClientEvent[];
  msgCmd?: SoundCmd[];
} => {
  if (msg) {
    return updateFromMsg({ msg, model });
  }
  if (msgCmd) {
    return updateFromCmd({ msgCmd, model });
  }
  return { model };
};

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) {
    return { model };
  }
  switch (msg.t) {
    case "clicked-back": {
      return {
        model,
        eff: Browser.back,
      };
    }

    case "clicked-link": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        eff: Browser.push(AppRoute.encode(msg.route)),
      };
    }

    case "route-changed": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        msgEvt: [{ t: "routing/route-changed", route: msg.route }],
      };
    }
  }
};

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) {
    return { model };
  }

  const routeCmd = msgCmd.c;

  switch (routeCmd.t) {
    case "push": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: routeCmd.route,
        },
        eff: Browser.push(AppRoute.encode(routeCmd.route)),
      };
    }

    case "back": {
      return {
        model,
        eff: Browser.back,
      };
    }

    case "replace": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: routeCmd.route,
        },
        eff: Browser.replace(AppRoute.encode(routeCmd.route)),
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
  const decoded = AppRoute.decode(location.pathname);

  if (decoded) {
    return { t: "route-changed", route: decoded };
  }

  return { t: "route-changed", route: FALLBACK };
};

export const subscriptions = Browser.onLocation(onLocationChange);
