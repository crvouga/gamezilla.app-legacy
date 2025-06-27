import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import type { Screen } from '~/@/screen/generated/screens'
import { Sub } from '~/@/sub'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt.$msg'

//
//
//
// Model
//
//
//

export type Model = {
  currentScreen: Screen
}

const FALLBACK: Screen = {
  n: 'auth-login',
  t: 'login',
}

const encodeScreen = (screen: Screen): string => {
  return btoa(JSON.stringify(screen))
}

const decodeScreen = (screen: unknown): Screen => {
  try {
    if (typeof screen !== 'string') {
      return FALLBACK
    }
    return JSON.parse(atob(screen))
  } catch {
    return FALLBACK
  }
}

const SCREEN_QUERY_PARAM_NAME = 'screen'

const locationToScreen = (location: Browser.Location): Screen => {
  return decodeScreen(location.query[SCREEN_QUERY_PARAM_NAME])
}

export const init = (input: {
  location: Browser.Location
}): {
  model: Model
  eff?: Eff
} => {
  const currentScreen = locationToScreen(input.location)
  return {
    model: {
      currentScreen,
    },
    eff: Eff.batch([
      input.location.pathname === '/' ? null : Browser.replace('/'),
      Browser.replaceQueryParam(SCREEN_QUERY_PARAM_NAME, encodeScreen(currentScreen)),
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

export type Msg =
  | { t: 'screen-changed'; screen: Screen }
  | { t: 'clicked-link'; screen: Screen }
  | { t: 'clicked-back' }

export const update = (input: {
  msg?: Msg | null
  msgIn?: unknown
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgOut?: (PlaySoundCmd | ScreenChangedEvt)[]
} => {
  if (PushScreenCmd.is(input.msgIn)) {
    return {
      model: {
        currentScreen: input.msgIn.screen,
      },
      eff: Browser.pushQueryParam(SCREEN_QUERY_PARAM_NAME, encodeScreen(input.msgIn.screen)),
      msgOut: input.msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navForwardMin)] : [],
    }
  }

  if (ReplaceScreenCmd.is(input.msgIn)) {
    return {
      model: {
        currentScreen: input.msgIn.screen,
      },
      eff: Browser.replaceQueryParam(SCREEN_QUERY_PARAM_NAME, encodeScreen(input.msgIn.screen)),
      msgOut: input.msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] : [],
    }
  }

  if (BackScreenCmd.is(input.msgIn)) {
    return {
      model: input.model,
      eff: Browser.back,
    }
  }

  if (input.msg) {
    return updateFromMsg(input)
  }

  return { model: input.model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) return { model }

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
          currentScreen: msg.screen,
        },
        eff: Browser.pushQueryParam(SCREEN_QUERY_PARAM_NAME, encodeScreen(msg.screen)),
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }

    case 'screen-changed': {
      return {
        model: { currentScreen: msg.screen },
        msgOut: [ScreenChangedEvt.init(msg.screen)],
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

export const subscriptions: Sub<Msg> = Browser.onLocation(
  (l): Msg => ({
    t: 'screen-changed',
    screen: locationToScreen(l),
  }),
)
