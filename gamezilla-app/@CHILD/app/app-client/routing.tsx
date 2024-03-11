import {
  ClientEvent,
  RouteCmd,
  SoundCmd,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Browser, Eff } from "gamezilla-app/@SHARED/core"
import { SpacesRoutes } from "../@CHILD/spaces/@SHARED/space.routes"

//
//
//
// Model
//
//
//

export type Model = {
  currentRouteV2: Record<string, unknown>
}

const FALLBACK = SpacesRoutes.SpaceList()

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
      currentRouteV2: location.query["route"]
        ? RouteCodec.decode(location.query["route"])
        : FALLBACK,
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
  | { t: "route-changed"; route: Record<string, unknown> }
  | { t: "clicked-link"; route: Record<string, unknown> }
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
          currentRouteV2: msg.route,
        },
        eff: Browser.pushQueryParam("route", RouteCodec.encode(msg.route)),
      }
    }

    case "route-changed": {
      return {
        model: {
          currentRouteV2: msg.route,
        },
        msgEvt: [{ t: "routing/route-changed", route: msg.route }],
      }
    }
  }
}

const RouteCodec = {
  encode: (route: Record<string, unknown>): string => {
    return btoa(JSON.stringify(route))
  },
  decode: (route: string): Record<string, unknown> => {
    try {
      return JSON.parse(atob(route))
    } catch {
      return {}
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
          currentRouteV2: routeCmd.route,
        },
        eff: Browser.pushQueryParam("route", RouteCodec.encode(routeCmd.route)),
      }
    }

    case "back": {
      return {
        model,
        eff: Browser.back,
      }
    }

    case "replace": {
      return {
        model: {
          currentRouteV2: routeCmd.route,
        },
        eff: Browser.replaceQueryParam(
          "route",
          RouteCodec.encode(routeCmd.route),
        ),
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
  const route = RouteCodec.decode(location.query["route"] ?? "")

  if (route) {
    return { t: "route-changed", route }
  }

  return { t: "route-changed", route: FALLBACK }
}

export const subscriptions = Browser.onLocation(onLocationChange)
