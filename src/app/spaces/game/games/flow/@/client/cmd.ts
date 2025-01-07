import type { ClientCmdTypes } from '~/app/@/client/cmd'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { Puzzle } from '../puzzle/puzzle'
import { PuzzleId } from '../puzzle/puzzle-id'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { Solutions } from '../solutions/solutions'

type FlowClientCmdInternal =
  | PackListTypes.MsgInCmdClient
  | PackPuzzlesGridTypes.MsgInCmdClient
  | PuzzleListTypes.MsgInCmdClient
  | {
      t: 'flow-cmd.add-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: Puzzle
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.remove-puzzles'
      puzzles: {
        [puzzleId: PuzzleId]: PuzzleId
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.new-packs'
      packs: {
        [packId: PackId]: Pack
      }
      causedBy: unknown
    }
  | {
      t: 'flow-cmd.add-solutions'
      solutions: Solutions
      causedBy: unknown
    }

export type FlowClientCmd<T extends ClientCmdTypes> = SpaceClientCmd<T> | FlowClientCmdInternal

const addPuzzles = <T extends ClientCmdTypes>(
  puzzles: { [puzzleId: PuzzleId]: Puzzle },
  causedBy: unknown,
): FlowClientCmd<T> => {
  return {
    t: 'flow-cmd.add-puzzles',
    puzzles,
    causedBy,
  }
}

const addSolutions = <T extends ClientCmdTypes>(solutions: Solutions, causedBy: unknown): FlowClientCmd<T> => {
  return {
    t: 'flow-cmd.add-solutions',
    solutions,
    causedBy,
  }
}

const isFlowClientCmdInternal = <T extends ClientCmdTypes>(cmd: FlowClientCmd<T>): cmd is FlowClientCmdInternal => {
  switch (cmd.t) {
    case 'flow-cmd.new-packs':
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
  addPuzzles,
  addSolutions,
}
