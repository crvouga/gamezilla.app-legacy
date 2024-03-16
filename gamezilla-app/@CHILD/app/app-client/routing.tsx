import {
  APP_SOUND,
  ClientEvent,
  RouteCmd,
  SoundCmd,
  playSound,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Browser, Eff } from "gamezilla-app/@SHARED/core"
import { Route } from "gamezilla-app/@SHARED/routing/generated/routes"

//
//
//
// Model
//
//
//

export type Model = {
  currentRoute: Route
}

const FALLBACK: Route = {
  n: "spaces",
  t: "space-list",
}

const locationToRoute = (location: Browser.Location): Route => {
  return RouteCodec.decode(location.query["route"]) ?? FALLBACK
}

export const init = ({
  location,
}: {
  location: Browser.Location
}): {
  model: Model
  eff?: Eff
} => {
  return {
    model: {
      currentRoute: locationToRoute(location),
    },
  }
}

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
  | { t: "clicked-back" }

export const update = ({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: RouteCmd | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgEvt?: ClientEvent[]
  msgCmd?: SoundCmd[]
} => {
  if (msg) {
    return updateFromMsg({ msg, model })
  }
  if (msgCmd) {
    return updateFromCmd({ msgCmd, model })
  }
  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) {
    return { model }
  }
  switch (msg.t) {
    case "clicked-back": {
      return {
        model,
        eff: Browser.back,
      }
    }

    case "clicked-link": {
      return {
        model: {
          currentRoute: msg.route,
        },
        eff: Browser.pushQueryParam("route", RouteCodec.encode(msg.route)),
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case "route-changed": {
      return {
        model: {
          currentRoute: msg.route,
        },
        msgEvt: [{ t: "routing/route-changed", route: msg.route }],
      }
    }
  }
}

const RouteCodec = {
  encode: (route: Route): string => {
    return btoa(JSON.stringify(route))
  },
  decode: (route: string | undefined): Route => {
    if (!route) {
      return FALLBACK
    }
    try {
      return JSON.parse(atob(route))
    } catch {
      return FALLBACK
    }
  },
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) {
    return { model }
  }

  const routeCmd = msgCmd.c

  switch (routeCmd.t) {
    case "push": {
      return {
        model: {
          currentRoute: routeCmd.route,
        },
        eff: Browser.pushQueryParam("route", RouteCodec.encode(routeCmd.route)),
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navForwardMin)] : [],
      }
    }

    case "back": {
      return {
        model,
        eff: Browser.back,
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : [],
      }
    }

    case "replace": {
      return {
        model: {
          currentRoute: routeCmd.route,
        },
        eff: Browser.replaceQueryParam(
          "route",
          RouteCodec.encode(routeCmd.route),
        ),
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : [],
      }
    }
  }
}

//
//
//
// Subscriptions
//
//
//

const onLocationChange = (location: Browser.Location): Msg => {
  const route = locationToRoute(location)

  if (route) {
    return { t: "route-changed", route }
  }

  return { t: "route-changed", route: FALLBACK }
}

export const subscriptions = Browser.onLocation(onLocationChange)
