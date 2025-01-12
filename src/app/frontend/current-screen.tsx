import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import type { Screen } from '~/@/screen/generated/screens'
import { APP_SOUND, playSound, type ScreenCmd, type SoundCmd } from '~/app/@/frontend/cmd'
import { FrontendEvt } from '../@/frontend/evt'

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
  n: 'spaces',
  t: 'space-list',
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

const locationToScreen = (location: Browser.Location): Screen => {
  return decodeScreen(location.query['current-screen'])
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
      Browser.replaceQueryParam('current-screen', encodeScreen(currentScreen)),
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
  msgCmd?: ScreenCmd | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgEvt?: FrontendEvt[]
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
          currentScreen: msg.screen,
        },
        eff: Browser.pushQueryParam('current-screen', encodeScreen(msg.screen)),
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'screen-changed': {
      return {
        model: {
          currentScreen: msg.screen,
        },
        msgEvt: [
          {
            t: 'routing-evt.screen-changed',
            screen: msg.screen,
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

  const screenCmd = msgCmd.c

  switch (screenCmd.t) {
    case 'push': {
      return {
        model: {
          currentScreen: screenCmd.screen,
        },
        eff: Browser.pushQueryParam('current-screen', encodeScreen(screenCmd.screen)),
        msgCmd: screenCmd.playSound ? [playSound(APP_SOUND.navForwardMin)] : [],
      }
    }

    case 'back': {
      return {
        model,
        eff: Browser.back,
        msgCmd: screenCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : [],
      }
    }

    case 'replace': {
      return {
        model: {
          currentScreen: screenCmd.screen,
        },
        eff: Browser.replaceQueryParam('current-screen', encodeScreen(screenCmd.screen)),
        msgCmd: screenCmd.playSound ? [playSound(APP_SOUND.navBackwardMin)] : [],
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

export const subscriptions = Browser.onLocation((l): Msg => ({ t: 'screen-changed', screen: locationToScreen(l) }))
