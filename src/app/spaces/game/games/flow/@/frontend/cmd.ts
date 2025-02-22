import type { FrontendCmdTypes } from '~/app/@/frontend/cmd'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCmdRoot } from './cmd-root'

type FlowFrontendCmdInternal =
  | PackLoaderTypes.MsgInCmdFrontend
  | PuzzleLoaderTypes.MsgInCmdFrontend
  | SolutionsLoaderTypes.MsgInCmdFrontend
  | FlowFrontendCmdRoot

export type FlowFrontendCmd<T extends FrontendCmdTypes> = SpaceFrontendCmd<T> | FlowFrontendCmdInternal

const isFlowFrontendCmdInternal = <T extends FrontendCmdTypes>(
  cmd: FlowFrontendCmd<T>,
): cmd is FlowFrontendCmdInternal => {
  switch (cmd.t) {
    case 'flow-cmd.add-packs':
    case 'flow-cmd.remove-puzzles':
    case 'flow-cmd.add-puzzles':
    case 'got-puzzle-loader-cmd':
    case 'got-pack-loader-cmd':
    case 'got-solutions-loader-cmd':
    case 'flow-cmd.add-solutions': {
      return true
    }
    default: {
      return false
    }
  }
}

export type FlowFrontendCmdLocal = FlowFrontendCmd<FrontendCmdTypes>

const toSpaceFrontendCmd = <T extends FrontendCmdTypes>(
  cmds: FlowFrontendCmd<T>[] | undefined | null,
): SpaceFrontendCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): SpaceFrontendCmd<T>[] => {
    if (isFlowFrontendCmdInternal(cmd)) {
      return []
    }
    return [cmd]
  })
}

const toFlowFrontendCmd = <T extends FrontendCmdTypes>(
  cmds: FlowFrontendCmd<T>[] | undefined | null,
): FlowFrontendCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): FlowFrontendCmd<T>[] => {
    if (isFlowFrontendCmdInternal(cmd)) {
      return [cmd]
    }
    return []
  })
}

const tag = <T extends FrontendCmdTypes, Tag extends string>(
  t: Tag,
  cmds?: FlowFrontendCmd<T>[],
): FlowFrontendCmd<{
  MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
  MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
}>[] => {
  return (cmds ?? []).flatMap(
    (
      msgCmd,
    ): FlowFrontendCmd<{
      MsgFrontend: { t: Tag; c: T['MsgFrontend'] }
      MsgToBackend: { t: Tag; c: T['MsgToBackend'] }
    }>[] => {
      if (isFlowFrontendCmdInternal(msgCmd)) {
        return [msgCmd]
      }
      return SpaceFrontendCmd.tag(t, [msgCmd])
    },
  )
}

export const FlowFrontendCmd = {
  toSpaceFrontendCmd,
  toFlowFrontendCmd,
  tag,
}
