import { p } from '~/@/schema'
import { GroupId } from './group-id'
import { NodeId } from './node-id'

const parser = p.obj({
  groupId: GroupId,
  startId: NodeId,
  endId: p.maybe(NodeId),
})
/**
 * A terminal represents the start and end nodes for a group.
 * These are the two circles the user is trying to connect
 */
export type Terminal = p.Infer<typeof parser>

const isSame = (a: Terminal, b: Terminal): boolean => {
  const startA = a.startId ?? null
  const startB = b.startId ?? null
  const endA = a.endId ?? null
  const endB = b.endId ?? null
  const isSameNodes = (startA === startB && endA === endB) || (endA === startB && startA === endB)
  const isSameGroup = a.groupId === b.groupId
  const isSame = isSameNodes && isSameGroup
  return isSame
}

const flip = (terminal: Terminal): Terminal => {
  if (!terminal.endId) {
    return terminal
  }
  return {
    groupId: terminal.groupId,
    startId: terminal.endId,
    endId: terminal.startId,
  }
}

const deriveHash = (terminal: Terminal): string => {
  return `${terminal.groupId}-${[terminal.startId, terminal.endId].sort().join('-')}`
}

export const Terminal = {
  ...parser,
  flip,
  isSame,
  deriveHash,
}
