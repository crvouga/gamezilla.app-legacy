import { BackendCmd } from '~/app/@/backend/cmd'

export type SpaceBackendCmd<MsgToFrontend> = BackendCmd<MsgToFrontend> | { t: 'send-to-space'; msg: MsgToFrontend }

//
//
//
//
//
//
//
//

export const sendToSpace = <MsgToFrontend>(msg: MsgToFrontend): SpaceBackendCmd<MsgToFrontend> => {
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

const toSpaceBackendCmd = <TMsgToFrontend>(
  msgCmd: SpaceBackendCmd<TMsgToFrontend>[] | undefined | null,
): SpaceBackendCmd<TMsgToFrontend>[] => {
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

const toBackendCmd = <TMsgToFrontend>(
  msgCmd: SpaceBackendCmd<TMsgToFrontend>[] | undefined | null,
): BackendCmd<TMsgToFrontend>[] => {
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
