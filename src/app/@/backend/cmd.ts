import type { FrontendId } from '~/app/@/data/frontend-id'
import type { UserId } from '~/app/@/data/user-id'

//
//
//
//
//
//
//

export type WireCmd<MsgToFrontend> = {
  t: 'wire'
  c:
    | {
        t: 'send-to-user'
        userIds: UserId[]
        msg: MsgToFrontend
      }
    | {
        t: 'broadcast'
        msg: MsgToFrontend
      }
    | {
        t: 'send-to-frontend'
        frontendIds: FrontendId[]
        msg: MsgToFrontend
      }
    | {
        t: 'topic-publish'
        topics: string[]
        msg: MsgToFrontend
      }
    | {
        t: 'topic-subscribe'
        topics: string[]
        frontendIds: FrontendId[]
      }
}

export type BackendCmd<TMsgToFrontend> = WireCmd<TMsgToFrontend>

export const topicPublish = <MsgToFrontend>(topics: string[], msg: MsgToFrontend): BackendCmd<MsgToFrontend> => {
  return {
    t: 'wire',
    c: {
      t: 'topic-publish',
      topics,
      msg,
    },
  }
}

export const topicSubscribe = <MsgToFrontend>(
  topics: string[],
  frontendIds: FrontendId[],
): BackendCmd<MsgToFrontend> => {
  return {
    t: 'wire',
    c: {
      t: 'topic-subscribe',
      topics,
      frontendIds,
    },
  }
}

export const broadcast = <MsgToFrontend>(msg: MsgToFrontend): BackendCmd<MsgToFrontend> => {
  return {
    t: 'wire',
    c: {
      t: 'broadcast',
      msg,
    },
  }
}

export const didBroadcast = <MsgToFrontend, TCmd>(
  output: {
    msgCmd?: (WireCmd<MsgToFrontend> | TCmd)[] | null
  },
  predicate: (msg: MsgToFrontend) => boolean,
): boolean => {
  return (
    ((output.msgCmd?.length ?? 0) > 0 &&
      output.msgCmd?.some(
        (cmd) =>
          typeof cmd === 'object' &&
          cmd &&
          't' in cmd &&
          cmd.t === 'wire' &&
          cmd.c.t === 'broadcast' &&
          predicate(cmd.c.msg),
      )) ??
    false
  )
}

export const sendToFrontend = <MsgToFrontend>(
  frontendIdInput: FrontendId | FrontendId[] | { frontendId: FrontendId } | { frontendIds: FrontendId[] },
  msg: MsgToFrontend,
): BackendCmd<MsgToFrontend> => {
  const frontendIds: FrontendId[] = []

  if (Array.isArray(frontendIdInput)) {
    frontendIds.push(...frontendIdInput)
  } else if ('frontendId' in frontendIdInput) {
    frontendIds.push(frontendIdInput.frontendId)
  } else if ('frontendIds' in frontendIdInput) {
    frontendIds.push(...frontendIdInput.frontendIds)
  } else {
    frontendIds.push(frontendIdInput)
  }

  return {
    t: 'wire',
    c: {
      t: 'send-to-frontend',
      frontendIds,
      msg,
    },
  }
}

export const didSendToFrontend = <MsgToFrontend, TCmd>(
  output: {
    msgCmd?: (WireCmd<MsgToFrontend> | TCmd)[] | null
  },
  frontendId: FrontendId,
  predicate: (msg: MsgToFrontend) => boolean,
): boolean => {
  return (
    ((output.msgCmd?.length ?? 0) > 0 &&
      output.msgCmd?.some(
        (cmd) =>
          typeof cmd === 'object' &&
          cmd &&
          't' in cmd &&
          cmd.t === 'wire' &&
          cmd.c.t === 'send-to-frontend' &&
          cmd.c.frontendIds.includes(frontendId) &&
          predicate(cmd.c.msg),
      )) ??
    false
  )
}

export const didSendMsgToFrontend = <MsgToFrontend>(
  output: { msgCmd?: BackendCmd<MsgToFrontend>[] | null },
  predicate: (msg: MsgToFrontend) => boolean,
): boolean => {
  return output.msgCmd?.some((cmd) => cmd.t === 'wire' && 'msg' in cmd.c && predicate(cmd.c.msg)) ?? false
}

export const sendToUser = <MsgToFrontend>(userIds: UserId[], msg: MsgToFrontend): BackendCmd<MsgToFrontend> => {
  return {
    t: 'wire',
    c: {
      t: 'send-to-user',
      userIds,
      msg,
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

const mapOne = <A, B>(fn: (a: A) => B, msgCmd: BackendCmd<A>): BackendCmd<B> => {
  switch (msgCmd.t) {
    case 'wire': {
      switch (msgCmd.c.t) {
        case 'send-to-user':
        case 'send-to-frontend':
        case 'topic-publish':
        case 'broadcast': {
          return {
            t: 'wire',
            c: {
              ...msgCmd.c,
              msg: fn(msgCmd.c.msg),
            },
          }
        }
        case 'topic-subscribe': {
          return {
            t: 'wire',
            c: {
              t: 'topic-subscribe',
              frontendIds: msgCmd.c.frontendIds,
              topics: msgCmd.c.topics,
            },
          }
        }
      }
    }
  }
}

const map = <A, B>(fn: (a: A) => B, msgCmd?: BackendCmd<A>[]): BackendCmd<B>[] => {
  return msgCmd?.map((m) => mapOne(fn, m)) ?? []
}

const tag = <T extends string, A>(tag: T, commands?: BackendCmd<A>[]): BackendCmd<{ t: T; c: A }>[] | undefined => {
  return map((c) => ({ t: tag, c }), commands)
}

export const BackendCmd = {
  mapOne,
  map,
  tag,
}
