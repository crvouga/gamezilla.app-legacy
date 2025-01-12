import type { ClientId } from '~/app/@/data/client-id'
import type { UserId } from '~/app/@/data/user-id'

//
//
//
//
//
//
//

export type WireCmd<MsgToClient> = {
  t: 'wire'
  c:
    | {
        t: 'send-to-user'
        userIds: UserId[]
        msg: MsgToClient
      }
    | {
        t: 'broadcast'
        msg: MsgToClient
      }
    | {
        t: 'send-to-client'
        clientIds: ClientId[]
        msg: MsgToClient
      }
    | {
        t: 'topic-publish'
        topics: string[]
        msg: MsgToClient
      }
    | {
        t: 'topic-subscribe'
        topics: string[]
        clientIds: ClientId[]
      }
}

export type BackendCmd<TMsgToClient> = WireCmd<TMsgToClient>

export const topicPublish = <MsgToClient>(topics: string[], msg: MsgToClient): BackendCmd<MsgToClient> => {
  return {
    t: 'wire',
    c: {
      t: 'topic-publish',
      topics,
      msg,
    },
  }
}

export const topicSubscribe = <MsgToClient>(topics: string[], clientIds: ClientId[]): BackendCmd<MsgToClient> => {
  return {
    t: 'wire',
    c: {
      t: 'topic-subscribe',
      topics,
      clientIds,
    },
  }
}

export const broadcast = <MsgToClient>(msg: MsgToClient): BackendCmd<MsgToClient> => {
  return {
    t: 'wire',
    c: {
      t: 'broadcast',
      msg,
    },
  }
}

export const didBroadcast = <MsgToClient, TCmd>(
  output: {
    msgCmd?: (WireCmd<MsgToClient> | TCmd)[] | null
  },
  predicate: (msg: MsgToClient) => boolean,
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

export const sendToClient = <MsgToClient>(
  clientIdInput: ClientId | ClientId[] | { clientId: ClientId } | { clientIds: ClientId[] },
  msg: MsgToClient,
): BackendCmd<MsgToClient> => {
  const clientIds: ClientId[] = []

  if (Array.isArray(clientIdInput)) {
    clientIds.push(...clientIdInput)
  } else if ('clientId' in clientIdInput) {
    clientIds.push(clientIdInput.clientId)
  } else if ('clientIds' in clientIdInput) {
    clientIds.push(...clientIdInput.clientIds)
  } else {
    clientIds.push(clientIdInput)
  }

  return {
    t: 'wire',
    c: {
      t: 'send-to-client',
      clientIds,
      msg,
    },
  }
}

export const didSendToClient = <MsgToClient, TCmd>(
  output: {
    msgCmd?: (WireCmd<MsgToClient> | TCmd)[] | null
  },
  clientId: ClientId,
  predicate: (msg: MsgToClient) => boolean,
): boolean => {
  return (
    ((output.msgCmd?.length ?? 0) > 0 &&
      output.msgCmd?.some(
        (cmd) =>
          typeof cmd === 'object' &&
          cmd &&
          't' in cmd &&
          cmd.t === 'wire' &&
          cmd.c.t === 'send-to-client' &&
          cmd.c.clientIds.includes(clientId) &&
          predicate(cmd.c.msg),
      )) ??
    false
  )
}

export const didSendMsgToClient = <MsgToClient>(
  output: { msgCmd?: BackendCmd<MsgToClient>[] | null },
  predicate: (msg: MsgToClient) => boolean,
): boolean => {
  return output.msgCmd?.some((cmd) => cmd.t === 'wire' && 'msg' in cmd.c && predicate(cmd.c.msg)) ?? false
}

export const sendToUser = <MsgToClient>(userIds: UserId[], msg: MsgToClient): BackendCmd<MsgToClient> => {
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
        case 'send-to-client':
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
              clientIds: msgCmd.c.clientIds,
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
