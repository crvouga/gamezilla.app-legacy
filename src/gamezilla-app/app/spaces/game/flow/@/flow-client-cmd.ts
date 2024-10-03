import type { ClientCmdTypes } from 'gamezilla-app/app/@/client'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { FlowPackPuzzlesGridTypes } from './flow-pack/flow-pack-puzzles-grid'
import { FlowPackListTypes } from './flow-pack/flow-pack-list'

export type FlowClientCmd<T extends ClientCmdTypes> =
  | SpaceClientCmd<T>
  | FlowPackListTypes.MsgInCmdClient
  | FlowPackPuzzlesGridTypes.MsgInCmdClient

export type FlowClientCmdLocal = FlowClientCmd<ClientCmdTypes>

const toSpaceClientCmd = <T extends ClientCmdTypes>(
  cmds: FlowClientCmd<T>[] | undefined | null
): SpaceClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): SpaceClientCmd<T>[] => {
    switch (cmd.t) {
      case 'flow-pack-puzzles-grid':
      case 'flow-pack-list': {
        return []
      }
      default: {
        return [cmd]
      }
    }
  })
}

const toFlowClientCmd = <T extends ClientCmdTypes>(cmds: FlowClientCmd<T>[] | undefined | null): FlowClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): FlowClientCmd<T>[] => {
    switch (cmd.t) {
      case 'flow-pack-puzzles-grid':
      case 'flow-pack-list': {
        return [cmd]
      }
      default: {
        return []
      }
    }
  })
}

const tag = <T extends ClientCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: FlowClientCmd<T>[]
): FlowClientCmd<{
  MsgClient: { t: Tag; c: T['MsgClient'] }
  MsgToServer: { t: Tag; c: T['MsgToServer'] }
}>[] => {
  return (cmds ?? []).flatMap(
    (
      msgCmd
    ): FlowClientCmd<{
      MsgClient: { t: Tag; c: T['MsgClient'] }
      MsgToServer: { t: Tag; c: T['MsgToServer'] }
    }>[] => {
      switch (msgCmd.t) {
        case 'flow-pack-puzzles-grid':
        case 'flow-pack-list': {
          return [msgCmd]
        }
        default: {
          return SpaceClientCmd.tag(t, [msgCmd])
        }
      }
    }
  )
}

export const FlowClientCmd = {
  toSpaceClientCmd,
  toFlowClientCmd,
  tag
}
