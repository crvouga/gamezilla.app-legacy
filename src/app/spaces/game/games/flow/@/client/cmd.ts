import type { ClientCmdTypes } from '~/app/@/client/cmd'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { FlowClientCmdRoot } from './cmd-root'

type FlowClientCmdInternal =
  | PackListTypes.MsgInCmdClient
  | PackPuzzlesGridTypes.MsgInCmdClient
  | PuzzleListTypes.MsgInCmdClient
  | FlowClientCmdRoot

export type FlowClientCmd<T extends ClientCmdTypes> = SpaceClientCmd<T> | FlowClientCmdInternal

const isFlowClientCmdInternal = <T extends ClientCmdTypes>(cmd: FlowClientCmd<T>): cmd is FlowClientCmdInternal => {
  switch (cmd.t) {
    case 'flow-cmd.add-packs':
    case 'flow-cmd.remove-puzzles':
    case 'flow-cmd.add-puzzles':
    case 'pack-puzzles-grid':
    case 'puzzle-list':
    case 'pack-list':
    case 'flow-cmd.add-solutions': {
      return true
    }
    default: {
      return false
    }
  }
}

export type FlowClientCmdLocal = FlowClientCmd<ClientCmdTypes>

const toSpaceClientCmd = <T extends ClientCmdTypes>(
  cmds: FlowClientCmd<T>[] | undefined | null,
): SpaceClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): SpaceClientCmd<T>[] => {
    if (isFlowClientCmdInternal(cmd)) {
      return []
    }
    return [cmd]
  })
}

const toFlowClientCmd = <T extends ClientCmdTypes>(cmds: FlowClientCmd<T>[] | undefined | null): FlowClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): FlowClientCmd<T>[] => {
    if (isFlowClientCmdInternal(cmd)) {
      return [cmd]
    }
    return []
  })
}

const tag = <T extends ClientCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: FlowClientCmd<T>[],
): FlowClientCmd<{
  MsgClient: { t: Tag; c: T['MsgClient'] }
  MsgToServer: { t: Tag; c: T['MsgToServer'] }
}>[] => {
  return (cmds ?? []).flatMap(
    (
      msgCmd,
    ): FlowClientCmd<{
      MsgClient: { t: Tag; c: T['MsgClient'] }
      MsgToServer: { t: Tag; c: T['MsgToServer'] }
    }>[] => {
      if (isFlowClientCmdInternal(msgCmd)) {
        return [msgCmd]
      }
      return SpaceClientCmd.tag(t, [msgCmd])
    },
  )
}

export const FlowClientCmd = {
  toSpaceClientCmd,
  toFlowClientCmd,
  tag,
}
