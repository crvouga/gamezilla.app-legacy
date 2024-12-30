import type { ClientCmdTypes } from '~/app/@/client/client-cmd'
import { SpaceClientCmd } from '~/app/spaces/@/space-client-cmd'
import { Flow } from '../flow/flow'
import { FlowId } from '../flow/flow/flow-id'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { Puzzle } from '../puzzle/puzzle'
import { PuzzleId } from '../puzzle/puzzle-id'
import { PuzzleListTypes } from '../puzzle/puzzle-list'

export type FlowClientCmd<T extends ClientCmdTypes> =
  | SpaceClientCmd<T>
  | PackListTypes.MsgInCmdClient
  | PackPuzzlesGridTypes.MsgInCmdClient
  | PuzzleListTypes.MsgInCmdClient
  | {
      t: 'flow.new-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: Puzzle
      }
      causedBy: unknown
    }
  | {
      t: 'flow.remove-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: PuzzleId
      }
      causedBy: unknown
    }
  | {
      t: 'flow.new-packs'
      packs: {
        [packId: PackId]: Pack
      }
      causedBy: unknown
    }
  | {
      t: 'flow.new-solutions'
      solutions: {
        [flowId: FlowId]: Flow.Model[]
      }
      causedBy: unknown
    }

export type FlowClientCmdLocal = FlowClientCmd<ClientCmdTypes>

const toSpaceClientCmd = <T extends ClientCmdTypes>(
  cmds: FlowClientCmd<T>[] | undefined | null
): SpaceClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): SpaceClientCmd<T>[] => {
    switch (cmd.t) {
      case 'flow-pack-puzzles-grid':
      case 'flow.new-packs':
      case 'flow.remove-puzzles':
      case 'flow.new-puzzles':
      case 'flow-puzzle-list':
      case 'flow.new-solutions':
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
      case 'flow.new-packs':
      case 'flow.remove-puzzles':
      case 'flow.new-puzzles':
      case 'flow-pack-puzzles-grid':
      case 'flow-puzzle-list':
      case 'flow.new-solutions':
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
        case 'flow.new-packs':
        case 'flow.remove-puzzles':
        case 'flow.new-puzzles':
        case 'flow-pack-puzzles-grid':
        case 'flow-puzzle-list':
        case 'flow.new-solutions':
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
