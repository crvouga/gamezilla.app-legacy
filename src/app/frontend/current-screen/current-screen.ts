import { Eff } from '~/@/eff'
import type { Screen } from '~/@/screen/generated/screens'
import { Sub } from '~/@/sub'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt.$msg'

export type Model = {
  currentScreen: Screen
}

const FALLBACK: Screen = {
  n: 'auth',
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

export const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: Model
  eff?: Eff
} => {
  const currentScreen = decodeScreen(input.ctx.navigation.get(SCREEN_QUERY_PARAM_NAME))

  return {
    model: { currentScreen },
    async eff() {
      await input.ctx.navigation.replace(SCREEN_QUERY_PARAM_NAME, encodeScreen(currentScreen))
    },
  }
}

export type Msg =
  | { t: 'screen-changed'; screen: Screen }
  | { t: 'clicked-link'; screen: Screen }
  | { t: 'clicked-back' }

export const update = (input: {
  msg?: Msg | null
  msgIn?: unknown
  model: Model
  ctx: AppFrontendCtxBase
}): {
  model: Model
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  if (input.msgIn) return updateFromMsgIn(input)
  if (input.msg) return updateFromMsg(input)
  return { model: input.model }
}

const updateFromMsgIn = (input: {
  ctx: AppFrontendCtxBase
  msgIn?: unknown
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  if (!input.msgIn) return { model: input.model }

  const { msgIn } = input

  if (PushScreenCmd.is(msgIn)) {
    return {
      model: {
        currentScreen: msgIn.screen,
      },
      async eff() {
        await input.ctx.navigation.push(SCREEN_QUERY_PARAM_NAME, encodeScreen(msgIn.screen))
      },
      msgOut: msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navForwardMin)] : [],
    }
  }

  if (ReplaceScreenCmd.is(msgIn)) {
    return {
      model: {
        currentScreen: msgIn.screen,
      },
      async eff() {
        await input.ctx.navigation.replace(SCREEN_QUERY_PARAM_NAME, encodeScreen(msgIn.screen))
      },
      msgOut: msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] : [],
    }
  }

  if (BackScreenCmd.is(msgIn)) {
    return {
      model: input.model,
      async eff() {
        await input.ctx.navigation.back()
      },
      msgOut: msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] : [],
    }
  }

  return { model: input.model }
}

const updateFromMsg: typeof update = (input) => {
  if (!input.msg) return { model: input.model }
  const { msg } = input

  switch (msg.t) {
    case 'clicked-back': {
      return {
        model: input.model,
        async eff() {
          await input.ctx.navigation.back()
        },
      }
    }

    case 'clicked-link': {
      return {
        model: { currentScreen: msg.screen },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff() {
          await input.ctx.navigation.push(SCREEN_QUERY_PARAM_NAME, encodeScreen(msg.screen))
        },
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

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return Sub.map(input.ctx.navigation.sub(SCREEN_QUERY_PARAM_NAME), (value) => ({
    t: 'screen-changed',
    screen: decodeScreen(value),
  }))
}
