import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import type { Route } from '~/@/routing/generated/routes'
import { APP_SOUND, playSound, type RouteCmd, type SoundCmd } from '~/app/@/client/cmd'
import { ClientEvt } from '../@/client/evt'

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
  t: 'space-list',
}

const encodeRoute = (route: Route): string => {
  return btoa(JSON.stringify(route))
}

const decodeRoute = (route: unknown): Route => {
  try {
    if (typeof route !== 'string') {
      return FALLBACK
    }
    return JSON.parse(atob(route))
  } catch {
    return FALLBACK
  }
}

const locationToRoute = (location: Browser.Location): Route => {
  return decodeRoute(location.query['route'])
}

export const init = (input: {
  location: Browser.Location
}): {
  model: Model
  eff?: Eff
} => {
  const currentRoute = locationToRoute(input.location)
  return {
    model: {
      currentRoute,
    },
    eff: Eff.batch([
      input.location.pathname === '/' ? null : Browser.replace('/'),
      Browser.replaceQueryParam('route', encodeRoute(currentRoute)),
    ]),
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

export const update = (input: {
  msgCmd?: RouteCmd | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgEvt?: ClientEvt[]
  msgCmd?: SoundCmd[]
} => {
  if (input.msg) {
    return updateFromMsg(input)
  }
  if (input.msgCmd) {
    return updateFromCmd(input)
  }
  return { model: input.model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) {
    return { model }
  }
  switch (msg.t) {
    case 'clicked-back': {
      return {
        model,
        eff: Browser.back,
      }
    }

    case 'clicked-link': {
      return {
        model: {
          currentRoute: msg.route,
        },
        eff: Browser.pushQueryParam('route', encodeRoute(msg.route)),
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'route-changed': {
      return {
        model: {
          currentRoute: msg.route,
        },
        msgEvt: [
          {
            t: 'routing-evt.route-changed',
            route: msg.route,
          },
        ],
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
          currentRoute: routeCmd.route,
        },
        eff: Browser.pushQueryParam('route', encodeRoute(routeCmd.route)),
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navForwardMin)] : [],
      }
    }

    case 'back': {
      return {
        model,
        eff: Browser.back,
        msgCmd: routeCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : [],
      }
    }

    case 'replace': {
      return {
        model: {
          currentRoute: routeCmd.route,
        },
        eff: Browser.replaceQueryParam('route', encodeRoute(routeCmd.route)),
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

export const subscriptions = Browser.onLocation((l): Msg => ({ t: 'route-changed', route: locationToRoute(l) }))
