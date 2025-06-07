import { Numberlink } from '../../numberlink'
import { GroupId } from '../../numberlink/group-id'
import { NodeId } from '../../numberlink/node-id'
import { TerminalFull } from '../../numberlink/terminal-full'
import { NumberlinkVariant } from '../../variant'

export const isImpossibleForAnyTerminalToConnect = (
  model: NumberlinkVariant.Model,
  terminals: TerminalFull[],
): boolean => {
  for (const terminal of terminals) {
    const minPathLength = NumberlinkVariant.distance(model, terminal.startId, terminal.endId)
    const availableSpaces = countAvailableSpaces(model, terminal.groupId)
    if (availableSpaces < minPathLength) {
      return true
    }
    if (isTerminalCutOff(model, terminal)) {
      return true
    }
  }
  return false
}

const isTerminalCutOff = (model: NumberlinkVariant.Model, terminal: TerminalFull): boolean => {
  const visited = new Set<NodeId>()
  const stack = [terminal.startId]

  while (stack.length > 0) {
    const nodeId = stack.pop()!
    visited.add(nodeId)

    for (const edge of Numberlink.yieldEdgesOut(model, nodeId)) {
      const targetId = edge.targetId
      const targetGroupId = Numberlink.toGroupId(model, targetId)

      if (targetId === terminal.endId) {
        return false
      }

      if (visited.has(targetId)) continue

      if (targetGroupId === null || targetGroupId === terminal.groupId) {
        stack.push(targetId)
      }
    }
  }

  return true
}

const countAvailableSpaces = (model: NumberlinkVariant.Model, groupId: GroupId): number => {
  let count = 0
  for (const node of Numberlink.yieldNodes(model)) {
    const nodeGroupId = Numberlink.toGroupId(model, node.nodeId)
    if (nodeGroupId === null || nodeGroupId === groupId) {
      count++
    }
  }
  return count
}
