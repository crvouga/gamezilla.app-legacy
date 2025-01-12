import { BackendCmd } from '~/app/@/server/cmd'

export type SpaceBackendCmd<MsgToClient> = BackendCmd<MsgToClient> | { t: 'send-to-space'; msg: MsgToClient }

//
//
//
//
//
//
//
//

export const sendToSpace = <MsgToClient>(msg: MsgToClient): SpaceBackendCmd<MsgToClient> => {
  return { t: 'send-to-space', msg }
}

//
//
//
//
//
//
//

const mapOne = <A, B>(fn: (a: A) => B, msgCmd: SpaceBackendCmd<A>): SpaceBackendCmd<B> => {
  switch (msgCmd.t) {
    case 'send-to-space': {
      return {
        ...msgCmd,
        msg: fn(msgCmd.msg),
      }
    }
    default: {
      return BackendCmd.mapOne(fn, msgCmd)
    }
  }
}

const map = <A, B>(
  msgCmd: SpaceBackendCmd<A>[] | undefined | null,
  fn: (a: A) => B,
): SpaceBackendCmd<B>[] | undefined => {
  return msgCmd?.map((m) => mapOne(fn, m))
}

const tag = <T extends string, A>(
  tag: T,
  msgCmd?: SpaceBackendCmd<A>[],
): SpaceBackendCmd<{ t: T; c: A }>[] | undefined => {
  return map(msgCmd ?? [], (c) => ({ t: tag, c }))
}

const toSpaceBackendCmd = <TMsgToClient>(
  msgCmd: SpaceBackendCmd<TMsgToClient>[] | undefined | null,
): SpaceBackendCmd<TMsgToClient>[] => {
  return (msgCmd ?? []).flatMap((msgCmd) => {
    switch (msgCmd.t) {
      case 'send-to-space': {
        return [msgCmd]
      }
      default: {
        return []
      }
    }
  })
}

const toBackendCmd = <TMsgToClient>(
  msgCmd: SpaceBackendCmd<TMsgToClient>[] | undefined | null,
): BackendCmd<TMsgToClient>[] => {
  return (msgCmd ?? []).flatMap((msgCmd) => {
    switch (msgCmd.t) {
      case 'send-to-space': {
        return []
      }
      default: {
        return [msgCmd]
      }
    }
  })
}

export const SpaceBackendCmd = {
  toBackendCmd,
  toSpaceBackendCmd,
  map,
  mapOne,
  tag,
}
