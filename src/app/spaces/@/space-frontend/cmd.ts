import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import type { UserId } from '~/app/@/data/user-id'

export type SpaceFrontendCmdTypes = {
  MsgFrontend: any
  MsgToBackend: any
}

export type SpaceFrontendCmd<T extends SpaceFrontendCmdTypes> =
  | AppFrontendCmd<T>
  | { t: 'space-cmd.exit-game' }
  | { t: 'space-cmd.open-user-details'; userId: UserId }

export const exitGame = <T extends SpaceFrontendCmdTypes>(): SpaceFrontendCmd<T> => {
  return { t: 'space-cmd.exit-game' }
}

export const openUserDetails = <T extends SpaceFrontendCmdTypes>(userId: UserId): SpaceFrontendCmd<T> => {
  return { t: 'space-cmd.open-user-details', userId }
}

const tag = <T extends SpaceFrontendCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: SpaceFrontendCmd<T>[],
): SpaceFrontendCmd<{
  MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
  MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
}>[] => {
  return (
    cmds?.map((msgCmd) => {
      switch (msgCmd.t) {
        case 'space-cmd.open-user-details':
        case 'space-cmd.exit-game': {
          return msgCmd
        }
        default: {
          return AppFrontendCmd.tagOne(t, msgCmd)
        }
      }
    }) ?? []
  )
}

const map = <A extends SpaceFrontendCmdTypes, B extends SpaceFrontendCmdTypes>(
  msgCmd: SpaceFrontendCmd<A>[] | undefined | null,
  msgToBackend: (a: A['MsgToBackend']) => B['MsgToBackend'],
  msgFrontend: (b: A['MsgFrontend']) => B['MsgFrontend'],
): SpaceFrontendCmd<B>[] => {
  return (
    msgCmd?.flatMap((msgCmd): SpaceFrontendCmd<B>[] => {
      switch (msgCmd.t) {
        case 'space-cmd.open-user-details':
        case 'space-cmd.exit-game': {
          return [msgCmd]
        }
        default: {
          return AppFrontendCmd.map([msgCmd], msgToBackend, msgFrontend)
        }
      }
    }) ?? []
  )
}

const toFrontendCmd = <T extends SpaceFrontendCmdTypes>(
  msgCmd: SpaceFrontendCmd<T>[] | undefined | null,
): AppFrontendCmd<T>[] => {
  return (
    msgCmd?.flatMap((msgCmd) => {
      switch (msgCmd.t) {
        case 'space-cmd.open-user-details':
        case 'space-cmd.exit-game': {
          return []
        }
        default: {
          return [msgCmd]
        }
      }
    }) ?? []
  )
}

const toSpaceFrontendCmd = <T extends SpaceFrontendCmdTypes>(
  msgCmd: SpaceFrontendCmd<T>[] | undefined | null,
): SpaceFrontendCmd<T>[] => {
  return (
    msgCmd?.flatMap((msgCmd) => {
      switch (msgCmd.t) {
        case 'space-cmd.open-user-details':
        case 'space-cmd.exit-game': {
          return [msgCmd]
        }
        default: {
          return []
        }
      }
    }) ?? []
  )
}

export const SpaceFrontendCmd = {
  toSpaceFrontendCmd,
  toFrontendCmd,
  tag,
  map,
}
