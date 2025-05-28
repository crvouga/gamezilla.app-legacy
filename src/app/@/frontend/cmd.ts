import { TimeSpan } from '~/@/time/time-span'

export type FrontendCmdTypes = {
  MsgFrontend: unknown
  MsgToBackend: unknown
}

export type AppFrontendCmd<T extends FrontendCmdTypes> = WireCmd<T> | TimeCmd<T['MsgFrontend']>

export type TimeCmd<Msg> = {
  n: 'frontend'
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
    n: 'frontend',
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
    n: 'frontend',
    t: 'time',
    c: {
      t: 'cancel-timeout',
      timeoutId,
    },
  }
}

export type WireCmd<T extends FrontendCmdTypes> = {
  n: 'wire'
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
    n: 'wire',
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
