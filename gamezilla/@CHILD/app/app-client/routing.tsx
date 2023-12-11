import {
  APP_SOUND,
  AppRoute,
  ClientEvt,
  RouteCmd,
  SoundCmd,
  playSound,
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

const FALLBACK: AppRoute = { t: "space", c: { t: "space-list" } };

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
  cmd,
}: {
  cmd?: RouteCmd | null;
  msg?: Msg | null;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  evt?: ClientEvt[];
  cmd?: SoundCmd[];
} => {
  if (msg) {
    return updateFromMsg({ msg, model });
  }
  if (cmd) {
    return updateFromCmd({ cmd, model });
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
        cmd: [playSound(APP_SOUND.tap)],
      };
    }

    case "clicked-link": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        eff: Browser.push(AppRoute.encode(msg.route)),
        cmd: [playSound(APP_SOUND.tap)],
      };
    }

    case "route-changed": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        evt: [{ t: "routing/route-changed", route: msg.route }],
      };
    }
  }
};

const updateFromCmd: typeof update = ({ cmd, model }) => {
  if (!cmd) {
    return { model };
  }

  const routeCmd = cmd.c;

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
