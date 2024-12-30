import { AppClientCmd } from '~/app/@/client/client-cmd'
import type { UserId } from '~/app/@/data/user-id'

export type SpaceClientCmdTypes = {
  MsgClient: any
  MsgToServer: any
}

export type SpaceClientCmd<T extends SpaceClientCmdTypes> =
  | AppClientCmd<T>
  | { t: 'space/exit-game' }
  | { t: 'space/open-user-details'; userId: UserId }

export const exitGame = <T extends SpaceClientCmdTypes>(): SpaceClientCmd<T> => {
  return { t: 'space/exit-game' }
}

export const openUserDetails = <T extends SpaceClientCmdTypes>(userId: UserId): SpaceClientCmd<T> => {
  return { t: 'space/open-user-details', userId }
}

const tag = <T extends SpaceClientCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: SpaceClientCmd<T>[]
): SpaceClientCmd<{
  MsgClient: { t: Tag; c: T['MsgClient'] }
  MsgToServer: { t: Tag; c: T['MsgToServer'] }
}>[] => {
  return (
    cmds?.map((msgCmd) => {
      switch (msgCmd.t) {
        case 'space/open-user-details':
        case 'space/exit-game': {
          return msgCmd
        }
        default: {
          return AppClientCmd.tagOne(t, msgCmd)
        }
      }
    }) ?? []
  )
}

const map = <A extends SpaceClientCmdTypes, B extends SpaceClientCmdTypes>(
  msgCmd: SpaceClientCmd<A>[] | undefined | null,
  msgToServer: (a: A['MsgToServer']) => B['MsgToServer'],
  msgClient: (b: A['MsgClient']) => B['MsgClient']
): SpaceClientCmd<B>[] => {
  return (
    msgCmd?.flatMap((msgCmd): SpaceClientCmd<B>[] => {
      switch (msgCmd.t) {
        case 'space/open-user-details':
        case 'space/exit-game': {
          return [msgCmd]
        }
        default: {
          return AppClientCmd.map([msgCmd], msgToServer, msgClient)
        }
      }
    }) ?? []
  )
}

const toClientCmd = <T extends SpaceClientCmdTypes>(
  msgCmd: SpaceClientCmd<T>[] | undefined | null
): AppClientCmd<T>[] => {
  return (
    msgCmd?.flatMap((msgCmd) => {
      switch (msgCmd.t) {
        case 'space/open-user-details':
        case 'space/exit-game': {
          return []
        }
        default: {
          return [msgCmd]
        }
      }
    }) ?? []
  )
}

const toSpaceClientCmd = <T extends SpaceClientCmdTypes>(
  msgCmd: SpaceClientCmd<T>[] | undefined | null
): SpaceClientCmd<T>[] => {
  return (
    msgCmd?.flatMap((msgCmd) => {
      switch (msgCmd.t) {
        case 'space/open-user-details':
        case 'space/exit-game': {
          return [msgCmd]
        }
        default: {
          return []
        }
      }
    }) ?? []
  )
}

export const SpaceClientCmd = {
  toSpaceClientCmd,
  toClientCmd,
  tag,
  map
}
