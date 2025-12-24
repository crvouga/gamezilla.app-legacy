import { Eff } from '~/@/eff'
import { isAnyMsg } from '~/@/msg/msg'
import type { Screen } from '~/@/screens/generated/screens'
import { Sub } from '~/@/sub'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { BackScreenCmd } from '~/app/@/frontend/back-screen-cmd.$msg'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { CurrentScreenCmd, currentScreenCmds } from './current-screen-cmd'
import { currentScreenEvts } from './current-screen-evt'

export type Model = {
  currentScreen_screen: Screen
}

const FALLBACK: Screen = {
  n: 'auth',
  t: 'auth_login',
}

const encodeScreen = (screen: Screen): string => {
  return btoa(JSON.stringify(screen))
}

const decodeScreen = (screen: unknown): Screen | null => {
  try {
    if (typeof screen !== 'string') {
      return null
    }
    return JSON.parse(atob(screen))
  } catch {
    return null
  }
}

const SCREEN_QUERY_PARAM_NAME = 'screen'

export const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: Model
  eff?: Eff
} => {
  const currentScreen = decodeScreen(input.ctx.navigation.get(SCREEN_QUERY_PARAM_NAME)) ?? FALLBACK

  return {
    model: { currentScreen_screen: currentScreen },
    async eff() {
      await input.ctx.navigation.replace(SCREEN_QUERY_PARAM_NAME, encodeScreen(currentScreen))
    },
  }
}

export type Msg =
  | { n: 'currentScreen'; t: 'currentScreen_screenChanged'; screen: Screen | null }
  | { n: 'currentScreen'; t: 'currentScreen_clickedLink'; screen: Screen }
  | { n: 'currentScreen'; t: 'currentScreen_clickedBack' }
  | { n: 'currentScreen'; t: 'currentScreen_gotCmd'; cmd: CurrentScreenCmd }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('currentScreen_')
}

export const update = <T extends Model>(input: {
  msg?: unknown
  msgIn?: unknown
  model: T
  ctx: AppFrontendCtxBase
}): {
  model: T
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  if (input.msgIn) return updateFromMsgIn(input)
  if (input.msg) return updateFromMsg(input)
  return { model: input.model }
}

const updateFromMsgIn: typeof update = (input) => {
  if (!input.msgIn) return { model: input.model }

  const { msgIn } = input

  if (PushScreenCmd.is(msgIn)) {
    return {
      model: {
        ...input.model,
        currentScreen_screen: msgIn.screen,
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
        ...input.model,
        currentScreen_screen: msgIn.screen,
      },
      async eff() {
        await input.ctx.navigation.replace(SCREEN_QUERY_PARAM_NAME, encodeScreen(msgIn.screen))
      },
      msgOut: msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] : [],
    }
  }

  if (BackScreenCmd.is(msgIn)) {
    return {
      model: {
        ...input.model,
        // currentScreen_screen: msgIn.screen,
      },
      async eff() {
        await input.ctx.navigation.back()
      },
      msgOut: msgIn.playSound ? [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] : [],
    }
  }

  return { model: input.model }
}

const updateFromMsg: typeof update = (input) => {
  const { msg } = input
  if (!isMsg(msg)) return { model: input.model }

  switch (msg.t) {
    case 'currentScreen_clickedBack': {
      return {
        model: input.model,
        async eff() {
          await input.ctx.navigation.back()
        },
      }
    }

    case 'currentScreen_clickedLink': {
      const { screen } = msg
      return {
        model: {
          ...input.model,
          currentScreen_screen: screen,
        },
        async eff(dispatch) {
          await input.ctx.navigation.push(SCREEN_QUERY_PARAM_NAME, encodeScreen(screen))
          playSound(APP_SOUND.tap)(dispatch)
        },
      }
    }

    case 'currentScreen_screenChanged': {
      const screen = msg.screen ?? FALLBACK

      return {
        model: {
          ...input.model,
          currentScreen_screen: screen,
        },
        eff: () => {
          currentScreenEvts.pub({ t: 'screenChanged', screen })
        },
      }
    }

    case 'currentScreen_gotCmd': {
      const { cmd } = msg
      switch (cmd.t) {
        case 'push': {
          return {
            model: input.model,
            eff: Eff.batch([
              cmd.playSound ? playSound(APP_SOUND.navForwardMin) : null,
              () => input.ctx.navigation.push(SCREEN_QUERY_PARAM_NAME, encodeScreen(cmd.screen)),
            ]),
          }
        }
        case 'replace': {
          return {
            model: input.model,
            async eff() {
              await input.ctx.navigation.replace(SCREEN_QUERY_PARAM_NAME, encodeScreen(cmd.screen))
            },
          }
        }
        case 'back': {
          return {
            model: input.model,
            eff: Eff.batch([
              cmd.playSound ? playSound(APP_SOUND.navBackwardMin) : null,
              () => input.ctx.navigation.back(),
            ]),
          }
        }
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return Sub.batch<Msg>([
    Sub.map(currentScreenCmds, (cmd) => ({
      n: 'currentScreen',
      t: 'currentScreen_gotCmd',
      cmd,
    })),
    Sub.map(input.ctx.navigation.sub(SCREEN_QUERY_PARAM_NAME), (value) => ({
      n: 'currentScreen',
      t: 'currentScreen_screenChanged',
      screen: decodeScreen(value),
    })),
  ])
}
