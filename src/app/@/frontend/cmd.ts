import { eq } from '~/@/equals/equals'
import { TranslatedText } from '~/@/l18n'
import { UnitInterval } from '~/@/range/unit-interval'
import type { Screen } from '~/@/screen/generated/screens'
import { TimeSpan } from '~/@/time/time-span'
import type { Profile } from '../data/profile'
import type { UserId } from '../data/user-id'

//
//
//
//
//
//

export type FrontendCmdTypes = {
  MsgFrontend: unknown
  MsgToBackend: unknown
}

export type AppFrontendCmd<T extends FrontendCmdTypes> =
  | WireCmd<T>
  | ToastCmd
  | ScreenCmd
  | SoundCmd
  | FocusCmd
  | TimeCmd<T['MsgFrontend']>
  | CopyToClipboardCmd
  | ProfileCmd
  | StatusBarCmd
  | AuthCmd

//
//
//
//
//
//

export type AuthCmd = {
  t: 'auth'
  c: {
    t: 'logout'
  }
}

export const logout = <T extends FrontendCmdTypes>(): AppFrontendCmd<T> => {
  return {
    t: 'auth',
    c: {
      t: 'logout',
    },
  }
}

//
//
//
//

export type StatusBarCmd = {
  t: 'status-bar'
  c: {
    t: 'close'
  }
}

export const closeStatusBar = <T extends FrontendCmdTypes>(): AppFrontendCmd<T> => {
  return {
    t: 'status-bar',
    c: {
      t: 'close',
    },
  }
}

//
//
//
//
//

export type ProfileCmd =
  | {
      t: 'profile'
      c: {
        t: 'add-profiles'
        profiles: {
          [userId: UserId]: Profile
        }
      }
    }
  | {
      t: 'profile'
      c: {
        t: 'open-profile'
        userId: UserId
      }
    }

export const addProfiles = <T extends FrontendCmdTypes>(profiles: { [userId: UserId]: Profile }): AppFrontendCmd<T> => {
  return { t: 'profile', c: { t: 'add-profiles', profiles } }
}

export const openProfile = <T extends FrontendCmdTypes>(userId: UserId): AppFrontendCmd<T> => {
  return { t: 'profile', c: { t: 'open-profile', userId } }
}

export const didOpenProfile = <T>(
  {
    msgCmd,
  }: {
    msgCmd?: (ProfileCmd | T)[] | null
  },
  userId: UserId,
): boolean => {
  return (
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'profile' &&
        cmd.c.t === 'open-profile' &&
        cmd.c.userId === userId,
    ) ?? false
  )
}

//
//
//
//
//
//

export type CopyToClipboardCmd = {
  t: 'copy-to-clipboard'
  c: {
    t: 'copy-to-clipboard'
    text: string
  }
}

export const copyToClipboard = <T extends FrontendCmdTypes>(text: string): AppFrontendCmd<T> => {
  return {
    t: 'copy-to-clipboard',
    c: {
      t: 'copy-to-clipboard',
      text,
    },
  }
}

export const didCopyToClipboard = <TCmd>(
  {
    msgCmd,
  }: {
    msgCmd?: (CopyToClipboardCmd | TCmd)[] | null
  },
  isValidText?: (text: string) => boolean,
): boolean => {
  return (
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'copy-to-clipboard' &&
        cmd.c.t === 'copy-to-clipboard' &&
        (typeof isValidText === 'function' ? isValidText(cmd.c.text) : true),
    ) ?? false
  )
}

//
//
//
//
//
//

export type FocusCmd = {
  t: 'focus'
  c: {
    t: 'focus'
    viewId: string
  }
}

export const focusView = <T extends FrontendCmdTypes>(viewId: string): AppFrontendCmd<T> => {
  return { t: 'focus', c: { t: 'focus', viewId: viewId } }
}

//
//
//
//
//

export type TimeCmd<Msg> = {
  t: 'time'
  c:
    | {
        t: 'start-timeout'
        timeoutId: string | number
        duration: TimeSpan
        msg: Msg
      }
    | {
        t: 'cancel-timeout'
        timeoutId: string | number
      }
}

export const startTimeout = <T extends FrontendCmdTypes>(
  timeoutId: string | number,
  duration: TimeSpan,
  msg: T['MsgFrontend'],
): AppFrontendCmd<T> => {
  return {
    t: 'time',
    c: {
      t: 'start-timeout',
      timeoutId,
      duration,
      msg,
    },
  }
}

export const cancelTimeout = <T extends FrontendCmdTypes>(timeoutId: string | number): AppFrontendCmd<T> => {
  return {
    t: 'time',
    c: {
      t: 'cancel-timeout',
      timeoutId,
    },
  }
}

//
//
//
//
//

export type WireCmd<T extends FrontendCmdTypes> = {
  t: 'wire'
  c: {
    t: 'send-to-backend'
    toBackend: T['MsgToBackend'] | null
  }
}

/**
 * A msgCmd creator for sending a messages to the backend.
 */
export const sendToBackend = <T extends FrontendCmdTypes>(msg: T['MsgToBackend']): AppFrontendCmd<T> => {
  return {
    t: 'wire',
    c: {
      t: 'send-to-backend',
      toBackend: msg,
    },
  }
}

export const didSendToBackend = <T extends FrontendCmdTypes, TCmd>(
  {
    msgCmd,
  }: {
    msgCmd?: (WireCmd<T> | TCmd)[] | null
  },
  predicate: (msg: T['MsgToBackend']) => boolean,
): boolean => {
  return (
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'wire' &&
        cmd.c.t === 'send-to-backend' &&
        cmd.c.toBackend &&
        predicate(cmd.c.toBackend),
    ) ?? false
  )
}

//
//
//
//
//
//

export type ToastCmd = {
  t: 'toast'
  c: {
    t: 'enqueue'
    text: TranslatedText
    toastVariant?: 'error' | 'info'
    duration?: TimeSpan
    errorMsg?: string
  }
}

export const showToast = <T extends FrontendCmdTypes>(
  text: TranslatedText,
  variant?: 'error' | 'info',
  duration?: TimeSpan,
): AppFrontendCmd<T> => {
  return {
    t: 'toast',
    c: {
      t: 'enqueue',
      text,
      toastVariant: variant,
      duration,
    },
  }
}

export const didShowToast = <T>(
  output?: {
    msgCmd?: (ToastCmd | T)[] | null
  },
  predicate?: (toast: { message: TranslatedText }) => boolean,
): boolean => {
  return (
    output?.msgCmd?.some((cmd) => {
      return (
        typeof cmd === 'object' &&
        cmd !== null &&
        't' in cmd &&
        cmd.t === 'toast' &&
        cmd.c.t === 'enqueue' &&
        (predicate
          ? predicate({
              message: cmd.c.text,
            })
          : true)
      )
    }) ?? false
  )
}

export const showOkSm = <T extends FrontendCmdTypes>(text: TranslatedText): AppFrontendCmd<T>[] => {
  return [
    {
      t: 'toast',
      c: {
        t: 'enqueue',
        text,
      },
    },
    {
      t: 'sound',
      c: {
        t: 'play',
        src: APP_SOUND.refreshFeed,
      },
    },
  ]
}

export const didShowOkSm = <TCmd>({ msgCmd }: { msgCmd?: (ToastCmd | SoundCmd | TCmd)[] | null }): boolean => {
  const isSomeToast =
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'toast' &&
        cmd.c.t === 'enqueue' &&
        !cmd.c.toastVariant,
    ) ?? false

  const isSomeSound =
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'sound' &&
        cmd.c.t === 'play' &&
        cmd.c.src === APP_SOUND.refreshFeed,
    ) ?? false

  return isSomeToast && isSomeSound
}

export const showWarningSm = <T extends FrontendCmdTypes>(text: TranslatedText): AppFrontendCmd<T>[] => {
  return [
    {
      t: 'toast',
      c: {
        t: 'enqueue',
        text,
        toastVariant: 'info',
      },
    },
    {
      t: 'sound',
      c: {
        t: 'play',
        src: APP_SOUND.alertErrorMd,
      },
    },
  ]
}

export const didShowWarningSm = <TCmd>({ msgCmd }: { msgCmd?: (ToastCmd | SoundCmd | TCmd)[] | null }): boolean => {
  const isSomeToast =
    msgCmd?.some((cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'toast' && cmd.c.t === 'enqueue') ??
    false

  const isSomeSound =
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'sound' &&
        cmd.c.t === 'play' &&
        cmd.c.src === APP_SOUND.alertErrorMd,
    ) ?? false

  return isSomeToast && isSomeSound
}

export const showErrSm = <T extends FrontendCmdTypes>(
  text: TranslatedText,
  errorMsg?: string,
  duration?: TimeSpan,
): AppFrontendCmd<T>[] => {
  return [
    {
      t: 'toast',
      c: {
        t: 'enqueue',
        text,
        toastVariant: 'error',
        errorMsg,
        duration: duration ?? TimeSpan.seconds(4),
      },
    },
    {
      t: 'sound',
      c: {
        t: 'play',
        src: APP_SOUND.alertErrorSm,
      },
    },
  ]
}

export const didShowErrorSm = <TCmd>(
  {
    msgCmd,
  }: {
    msgCmd?: (ToastCmd | SoundCmd | TCmd)[] | null
  },
  errorMessage?: TranslatedText,
): boolean => {
  const isSomeErrorToast =
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'toast' &&
        cmd.c.t === 'enqueue' &&
        cmd.c.toastVariant === 'error' &&
        (errorMessage ? eq(cmd.c.text, errorMessage) : true),
    ) ?? false

  const isSomeErrorSound =
    msgCmd?.some(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'sound' &&
        cmd.c.t === 'play' &&
        cmd.c.src === APP_SOUND.alertErrorSm,
    ) ?? false
  return isSomeErrorToast && isSomeErrorSound
}

//
//
//
//
//
//
//

export type SoundCmd = {
  t: 'sound'
  c:
    | {
        t: 'play'
        src: string
        volume?: UnitInterval
        delay?: TimeSpan
      }
    | {
        t: 'preload'
        src: string[]
      }
}

export const APP_SOUND = {
  tap: './sound/tap.wav',
  alertErrorLg: './sound/alert-error-lg.wav',
  alertErrorMd: './sound/alert-error-md.wav',
  alertErrorSm: './sound/alert-error-sm.wav',
  celebration: './sound/celebration.wav',
  celebrationDecorative: './sound/celebration-decorative.wav',
  navForward: './sound/nav-forward.wav',
  navBackward: './sound/nav-backward.wav',
  navForwardMin: './sound/nav-forward-min.wav',
  navBackwardMin: './sound/nav-backward-min.wav',
  navTransitionLeft: './sound/nav-transition-left.wav',
  stateChangeUp: './sound/state-change-up.wav',
  stateChangeDown: './sound/state-change-down.wav',
  refreshFeed: './sound/refresh-feed.wav',
  surfaceOpened: './sound/drawer-opened.wav',
  surfaceClosed: './sound/drawer-closed.wav',
}

export const playSound = (
  src: string,
  config?: {
    volume?: UnitInterval
    delay?: TimeSpan
  },
): SoundCmd => {
  return {
    t: 'sound',
    c: {
      t: 'play',
      src,
      volume: config?.volume,
      delay: config?.delay,
    },
  }
}

export const didPlaySound = <T>(
  {
    msgCmd,
  }: {
    msgCmd?: (SoundCmd | T)[] | null | null
  },
  src?: string,
): boolean => {
  return countPlaySoundCmd({ msgCmd }, src) > 0
}

export const countPlaySoundCmd = <T>(
  {
    msgCmd,
  }: {
    msgCmd?: (SoundCmd | T)[] | null
  },
  src?: string,
): number => {
  return (
    msgCmd?.filter(
      (cmd) =>
        typeof cmd === 'object' &&
        cmd &&
        't' in cmd &&
        cmd.t === 'sound' &&
        cmd.c.t === 'play' &&
        (src ? cmd.c.src === src : true),
    ).length ?? 0
  )
}

export const preloadSound = <T extends FrontendCmdTypes>(src: string[]): AppFrontendCmd<T> => {
  return {
    t: 'sound',
    c: {
      t: 'preload',
      src,
    },
  }
}

//
//
//
//
//
//
//
//

export type ScreenCmd = {
  t: 'current-screen'
  c:
    | {
        t: 'push'
        screen: Screen
        playSound?: boolean
      }
    | {
        t: 'replace'
        screen: Screen
        reason?: string
        playSound?: boolean
      }
    | {
        t: 'back'
        reason?: string
        playSound?: boolean
      }
}

export const pushScreen = <T extends FrontendCmdTypes>(screen: Screen, playSound?: boolean): AppFrontendCmd<T> => {
  return {
    t: 'current-screen',
    c: {
      t: 'push',
      screen,
      playSound,
    },
  }
}

export const didPushScreen = <T>(
  output?: {
    msgCmd?: (ScreenCmd | T)[] | null
  },
  predicate?: (screen: Screen) => boolean,
): boolean => {
  return Boolean(
    output?.msgCmd?.some((cmd) => {
      if (typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'current-screen' && cmd.c.t === 'push') {
        if (predicate) {
          return predicate(cmd.c.screen)
        }
        return true
      }
      return false
    }),
  )
}

export const replaceScreen = <T extends FrontendCmdTypes>(screen: Screen, playSound?: boolean): AppFrontendCmd<T> => {
  return {
    t: 'current-screen',
    c: {
      t: 'replace',
      screen,
      playSound: playSound ?? true,
    },
  }
}

export const didReplaceScreen = <T extends FrontendCmdTypes>(
  {
    msgCmd,
  }: {
    msgCmd?: AppFrontendCmd<T>[]
  },
  screen?: Screen,
): boolean => {
  return Boolean(
    msgCmd?.some((cmd) => {
      if (cmd.t === 'current-screen' && cmd.c.t === 'replace') {
        if (screen) {
          return eq(cmd.c.screen, screen)
        }
        return true
      }
      return false
    }),
  )
}

export const back = <T extends FrontendCmdTypes>(reason?: string): AppFrontendCmd<T> => {
  return {
    t: 'current-screen',
    c: {
      t: 'back',
      reason,
      playSound: true,
    },
  }
}

//
//
//
//
//
//
//
//

const tagOne = <Tag extends string, T extends FrontendCmdTypes>(
  t: Tag,
  msgCmd: AppFrontendCmd<T>,
): AppFrontendCmd<{
  MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
  MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
}> => {
  switch (msgCmd.t) {
    case 'wire': {
      switch (msgCmd.c.t) {
        case 'send-to-backend': {
          if (msgCmd.c.toBackend) {
            return {
              ...msgCmd,
              c: {
                ...msgCmd.c,
                toBackend: {
                  t,
                  c: msgCmd.c.toBackend,
                },
              },
            }
          }
          return {
            ...msgCmd,
            c: {
              ...msgCmd.c,
              toBackend: {
                t,
                c: null,
              },
            },
          }
        }
        default: {
          return msgCmd as AppFrontendCmd<{
            MsgFrontend: {
              t: Tag
              c: T['MsgFrontend']
            }
            MsgToBackend: {
              t: Tag
              c: T['MsgToBackend']
            }
          }>
        }
      }
    }

    case 'time': {
      switch (msgCmd.c.t) {
        case 'start-timeout': {
          return {
            ...msgCmd,
            c: {
              ...msgCmd.c,
              msg: {
                t,
                c: msgCmd.c.msg,
              },
            },
          }
        }

        default: {
          return msgCmd as AppFrontendCmd<{
            MsgFrontend: {
              t: Tag
              c: T['MsgFrontend']
            }
            MsgToBackend: {
              t: Tag
              c: T['MsgToBackend']
            }
          }>
        }
      }
    }

    default: {
      return msgCmd
    }
  }
}

const tag = <Tag extends string, T extends FrontendCmdTypes>(
  tag: Tag,
  msgCmd?: (AppFrontendCmd<T> | null | undefined)[] | null | undefined | null,
): AppFrontendCmd<{
  MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
  MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
}>[] => {
  return msgCmd?.flatMap((c) => (c ? [tagOne(tag, c)] : [])) ?? []
}

const map = <A extends FrontendCmdTypes, B extends FrontendCmdTypes>(
  msgCmd: AppFrontendCmd<A>[],
  toBackendMap: (a: A['MsgToBackend']) => B['MsgToBackend'],
  frontendMsgMap: (b: A['MsgFrontend']) => B['MsgFrontend'],
): AppFrontendCmd<B>[] => {
  return msgCmd.map((msgCmd) => {
    switch (msgCmd.t) {
      case 'wire': {
        switch (msgCmd.c.t) {
          case 'send-to-backend': {
            if (msgCmd.c.toBackend) {
              return {
                ...msgCmd,
                c: {
                  ...msgCmd.c,
                  toBackend: toBackendMap(msgCmd.c.toBackend),
                },
              }
            }
            return {
              ...msgCmd,
              c: {
                ...msgCmd.c,
                toBackend: null,
              },
            }
          }
          default: {
            return msgCmd
          }
        }
      }

      case 'time': {
        switch (msgCmd.c.t) {
          case 'start-timeout': {
            return {
              ...msgCmd,
              c: {
                ...msgCmd.c,
                toBackend: frontendMsgMap(msgCmd.c.msg),
              },
            }
          }

          default: {
            return msgCmd
          }
        }
      }

      default: {
        return msgCmd
      }
    }
  })
}
export const AppFrontendCmd = {
  tagOne,
  tag,
  map,
}
