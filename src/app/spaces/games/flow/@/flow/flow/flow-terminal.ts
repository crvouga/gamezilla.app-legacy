import { p } from '@/core/parser'
import { FlowGroupId } from './flow-group-id'
import { FlowNodeId } from './flow-node-id'

const parser = p.obj({
  groupId: FlowGroupId,
  startId: FlowNodeId,
  endId: p.maybe(FlowNodeId)
})
/**
 * A terminal represents the start and end nodes for a group.
 * These are the two circles the user is trying to connect
 */
export type FlowTerminal = p.Infer<typeof parser>

const isSame = (a: FlowTerminal, b: FlowTerminal): boolean => {
  const startA = a.startId ?? null
  const startB = b.startId ?? null
  const endA = a.endId ?? null
  const endB = b.endId ?? null
  const isSameNodes = (startA === startB && endA === endB) || (endA === startB && startA === endB)
  const isSameGroup = a.groupId === b.groupId
  const isSame = isSameNodes && isSameGroup
  return isSame
}

const flip = (terminal: FlowTerminal): FlowTerminal => {
  if (!terminal.endId) {
    return terminal
  }
  return {
    groupId: terminal.groupId,
    startId: terminal.endId,
    endId: terminal.startId
  }
}

export const FlowTerminal = {
  ...parser,
  flip,
  isSame
}
