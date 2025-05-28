import { s } from '~/@/schema'
import { GroupId } from './group-id'
import { NodeId } from './node-id'
import { Terminal } from './terminal'

const parser = s.obj({
  groupId: GroupId,
  startId: NodeId,
  endId: NodeId,
})

export type TerminalFull = s.Infer<typeof parser>

const is = (terminal: Terminal): terminal is TerminalFull => {
  return Boolean(terminal.endId)
}

export const TerminalFull = {
  ...parser,
  is,
}
