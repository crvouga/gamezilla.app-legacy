import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { TerminalFull } from '../../flow/terminal-full'
import { Variant } from '../../variant'

export const isImpossibleForTerminalsToConnect = (model: Variant.Model, terminals: TerminalFull[]): boolean => {
  for (const terminal of terminals) {
    const minPathLength = Variant.distance(model, terminal.startId, terminal.endId)
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

const isTerminalCutOff = (model: Variant.Model, terminal: TerminalFull): boolean => {
  const { startId, endId, groupId } = terminal
  const visited = new Set<NodeId>()
  const stack = [startId]

  while (stack.length > 0) {
    const nodeId = stack.pop()!
    visited.add(nodeId)

    for (const edge of Flow.yieldEdgesOut(model, nodeId)) {
      const targetId = edge.targetId
      const targetGroupId = Flow.toGroupId(model, targetId)

      if (targetId === endId) {
        return false
      }

      if (!visited.has(targetId) && (targetGroupId === null || targetGroupId === groupId)) {
        stack.push(targetId)
      }
    }
  }

  return true
}

const countAvailableSpaces = (model: Variant.Model, groupId: GroupId): number => {
  let count = 0
  for (const node of Flow.yieldNodes(model)) {
    const nodeGroupId = Flow.toGroupId(model, node.nodeId)
    if (nodeGroupId === null || nodeGroupId === groupId) {
      count++
    }
  }
  return count
}
