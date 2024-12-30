import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import type { Route } from '~/@/routing/generated/routes'
import { APP_SOUND, playSound, type RouteCmd, type SoundCmd } from '~/app/@/client/client-cmd'
import { ClientEvt } from '../@/client/client-event'

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
  n: 'spaces',
  t: 'space-list'
}

const encodeRoute = (route: Route): string => {
  return btoa(JSON.stringify(route))
}

const decodeRoute = (route: unknown): Route => {
  if (typeof route !== 'string') {
    return FALLBACK
  }
  try {
    return JSON.parse(atob(route))
  } catch {
    return FALLBACK
  }
}

const locationToRoute = (location: Browser.Location): Route => {
  return decodeRoute(location.query['route'])
}

export const init = ({
  location
}: {
  location: Browser.Location
}): {
  model: Model
  eff?: Eff
} => {
  const currentRoute = locationToRoute(location)
  return {
    model: {
      currentRoute
    },
    eff: Eff.batch([Browser.replace('/'), Browser.pushQueryParam('route', encodeRoute(currentRoute))])
  }
}

//
//
//
// Update
//
//
//

export type Msg = { t: 'route-changed'; route: Route } | { t: 'clicked-link'; route: Route } | { t: 'clicked-back' }

export const update = ({
  msg,
  model,
  msgCmd
}: {
  msgCmd?: RouteCmd | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgEvt?: ClientEvt[]
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
    case 'clicked-back': {
      return {
        model,
        eff: Browser.back
      }
    }

    case 'clicked-link': {
      return {
        model: {
          currentRoute: msg.route
        },
        eff: Browser.pushQueryParam('route', encodeRoute(msg.route)),
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    case 'route-changed': {
      return {
        model: {
          currentRoute: msg.route
        },
        msgEvt: [
          {
            t: 'routing/route-changed',
            route: msg.route
          }
        ]
      }
    }
  }
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) {
    return { model }
  }

  const routeCmd = msgCmd.c

  switch (routeCmd.t) {
    case 'push': {
      return {
        model: {
          currentRoute: routeCmd.route
        },
        eff: Browser.pushQueryParam('route', encodeRoute(routeCmd.route)),
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navForwardMin)] : []
      }
    }

    case 'back': {
      return {
        model,
        eff: Browser.back,
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : []
      }
    }

    case 'replace': {
      return {
        model: {
          currentRoute: routeCmd.route
        },
        eff: Browser.replaceQueryParam('route', encodeRoute(routeCmd.route)),
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : []
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

export const subscriptions = Browser.onLocation(
  (location): Msg => ({
    t: 'route-changed',
    route: locationToRoute(location)
  })
)
