export type AppFrontendCmd<TMsgToBackend> = {
  n: 'wire'
  t: 'wire'
  c: {
    t: 'send-to-backend'
    toBackend: TMsgToBackend
  }
}

/**
 * A msgCmd creator for sending a messages to the backend.
 */
export const sendToBackend = <TMsgToBackend>(msg: TMsgToBackend): AppFrontendCmd<TMsgToBackend> => {
  return {
    n: 'wire',
    t: 'wire',
    c: {
      t: 'send-to-backend',
      toBackend: msg,
    },
  }
}

export const didSendToBackend = <TMsgToBackend, TCmd>(
  {
    msgCmd,
  }: {
    msgCmd?: (AppFrontendCmd<TMsgToBackend> | TCmd)[] | null
  },
  predicate: (msg: TMsgToBackend) => boolean,
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

const tagOne = <Tag extends string, T>(t: Tag, msgCmd: AppFrontendCmd<T>): AppFrontendCmd<{ t: Tag; c: T }> => {
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

const tag = <Tag extends string, TMsgToBackend>(
  tag: Tag,
  msgCmd?: (AppFrontendCmd<TMsgToBackend> | null | undefined)[] | null | undefined | null,
): AppFrontendCmd<{ t: Tag; c: TMsgToBackend }>[] => {
  return msgCmd?.flatMap((c) => (c ? [tagOne(tag, c)] : [])) ?? []
}

export const AppFrontendCmd = {
  tagOne,
  tag,
}
