import {
  APP_SOUND,
  AppRoute,
  ClientEvt,
  RouteCmd,
  SoundCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Browser, Eff, UnitInterval } from "gamezilla/@SHARED/core";

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
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  evt?: ClientEvt[];
  cmd?: SoundCmd[];
} => {
  switch (msg.t) {
    case "clicked-back": {
      return {
        model,
        eff: Browser.back,
        cmd: [playSound(APP_SOUND.tap, UnitInterval.init(0.5))],
      };
    }

    case "clicked-link": {
      return {
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        eff: Browser.push(AppRoute.encode(msg.route)),
        cmd: [playSound(APP_SOUND.tap, UnitInterval.init(0.5))],
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
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        eff: Browser.push(AppRoute.encode(msg.route)),
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
        model: {
          previousRoute: model.currentRoute,
          currentRoute: msg.route,
        },
        eff: Browser.replace(AppRoute.encode(msg.route)),
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
