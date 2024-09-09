import type { ClientCmdTypes } from 'gamezilla-app/app/@/client'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { FlowPackListTypes } from './flow-pack'

export type FlowClientCmd<T extends ClientCmdTypes> = SpaceClientCmd<T> | FlowPackListTypes.MsgInCmdClient

export type FlowClientCmdLocal = FlowClientCmd<ClientCmdTypes>

const sieveOne = <T extends ClientCmdTypes>(
  cmds: FlowClientCmd<T>[] | undefined | null,
  acc: FlowClientCmd<T>[] = []
): [FlowClientCmdLocal | null, FlowClientCmd<T>[]] => {
  const [cmd, ...rest] = cmds ?? []

  if (!cmd) {
    return [null, acc]
  }

  if (cmd?.t === 'flow-pack-list') {
    return [cmd, [...acc, ...rest]]
  }

  return sieveOne(rest, [...acc, cmd])
}

const toSpaceClientCmds = <T extends ClientCmdTypes>(
  cmds: FlowClientCmd<T>[] | undefined | null
): SpaceClientCmd<T>[] => {
  return (cmds ?? []).flatMap((cmd): SpaceClientCmd<T>[] => {
    switch (cmd.t) {
      case 'flow-pack-list': {
        return []
      }
      default: {
        return [cmd]
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
  toSpaceClientCmds,
  tag,
  sieveOne
}
